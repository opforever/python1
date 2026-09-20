import { TerminalEntry, FriendlyErrorHint, ActiveInputRequest, PythonVariable } from '../types';
import { analyzePythonError } from '../utils/errorAnalyzer';

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
    pyodideInstance?: PyodideInterface;
    __calm_input_bridge?: (promptText: string) => Promise<string>;
    __calm_stdin_queue?: string[];
    __calm_active_abort?: (() => void) | null;
  }
}

export interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  runPython: (code: string) => unknown;
  loadPackage: (pkg: string | string[]) => Promise<void>;
  loadPackagesFromImports: (code: string) => Promise<void>;
  setStdout: (options: { batched?: (text: string) => void }) => void;
  setStderr: (options: { batched?: (text: string) => void }) => void;
  setStdin: (options: { stdin: () => string | null }) => void;
  globals: {
    get: (key: string) => unknown;
    set: (key: string, value: unknown) => void;
  };
}

export type StatusCallback = (status: string, isReady: boolean) => void;
export type OutputCallback = (entry: Omit<TerminalEntry, 'id' | 'timestamp'>) => void;

let pyodidePromise: Promise<PyodideInterface> | null = null;
let isEnvironmentInitialized = false;

const PYTHON_SETUP_SCRIPT = `
import ast
import asyncio
import sys
import io
import base64
from js import window

async def __calm_input(prompt=""):
    prompt_str = str(prompt) if prompt is not None else ""
    if prompt_str:
        print(prompt_str, end="", flush=True)
    
    # Check if stdin buffer has lines from user pre-configured input
    if hasattr(window, '__calm_stdin_queue') and window.__calm_stdin_queue and len(window.__calm_stdin_queue) > 0:
        val = str(window.__calm_stdin_queue.shift())
        print(val)
        return val
    
    # Otherwise, request interactive input from the UI
    if hasattr(window, '__calm_input_bridge') and window.__calm_input_bridge:
        val = await window.__calm_input_bridge(prompt_str)
        return str(val)
    return ""

def __calm_check_plots():
    try:
        if 'matplotlib.pyplot' in sys.modules:
            import matplotlib.pyplot as plt
            if plt.get_fignums():
                buf = io.BytesIO()
                plt.savefig(buf, format='png', bbox_inches='tight', dpi=120)
                buf.seek(0)
                img_b64 = base64.b64encode(buf.read()).decode('utf-8')
                plt.close('all')
                return f"data:image/png;base64,{img_b64}"
    except Exception:
        pass
    return None

def __calm_get_variables():
    try:
        import types
        import json
        excluded = {
            '__name__', '__doc__', '__package__', '__loader__', '__spec__',
            '__annotations__', '__builtins__', '__calm_input', '__calm_check_plots',
            '__calm_transform', '__calm_raw_code', '__calm_get_variables', 'sys', 'io',
            'base64', 'ast', 'js', 'window'
        }
        res = []
        for k, v in list(globals().items()):
            if k not in excluded and not isinstance(v, (types.ModuleType, types.FunctionType)):
                val_str = repr(v)
                if len(val_str) > 100:
                    val_str = val_str[:97] + '...'
                res.append({
                    'name': str(k),
                    'type': type(v).__name__,
                    'value': val_str
                })
        return json.dumps(res)
    except Exception:
        return "[]"

def __calm_transform(code):
    try:
        tree = ast.parse(code)
    except Exception:
        return code

    has_input = any(
        isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == 'input'
        for n in ast.walk(tree)
    )
    if not has_input:
        return code

    async_funcs = set()
    changed = True
    while changed:
        changed = False
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if node.name not in async_funcs:
                    for child in ast.walk(node):
                        if isinstance(child, ast.Call) and isinstance(child.func, ast.Name):
                            if child.func.id == 'input' or child.func.id in async_funcs:
                                async_funcs.add(node.name)
                                changed = True
                                break

    class InputTransformer(ast.NodeTransformer):
        def visit_Call(self, node):
            self.generic_visit(node)
            if isinstance(node.func, ast.Name) and node.func.id == 'input':
                node.func.id = '__calm_input'
                return ast.Await(value=node)
            elif isinstance(node.func, ast.Name) and node.func.id in async_funcs:
                return ast.Await(value=node)
            return node

        def visit_FunctionDef(self, node):
            self.generic_visit(node)
            if node.name in async_funcs:
                return ast.AsyncFunctionDef(
                    name=node.name,
                    args=node.args,
                    body=node.body,
                    decorator_list=node.decorator_list,
                    returns=node.returns,
                    type_comment=getattr(node, 'type_comment', None)
                )
            return node

    transformer = InputTransformer()
    new_tree = transformer.visit(tree)
    ast.fix_missing_locations(new_tree)
    return ast.unparse(new_tree)
`;

export async function getPyodide(
  onStatus?: StatusCallback,
  onOutput?: OutputCallback
): Promise<PyodideInterface> {
  if (window.pyodideInstance && isEnvironmentInitialized) {
    return window.pyodideInstance;
  }

  if (pyodidePromise) {
    return pyodidePromise;
  }

  pyodidePromise = (async () => {
    onStatus?.('Preparing Python 3.12 WebAssembly environment...', false);

    // Ensure pyodide script is loaded in window
    if (!window.loadPyodide) {
      onStatus?.('Loading Python runtime script...', false);
      await new Promise<void>((resolve, reject) => {
        let isDone = false;
        const checkDone = () => {
          if (window.loadPyodide) {
            isDone = true;
            resolve();
            return true;
          }
          return false;
        };

        if (checkDone()) return;

        const timer = setInterval(() => {
          if (checkDone()) {
            clearInterval(timer);
          }
        }, 100);

        const timeout = setTimeout(() => {
          clearInterval(timer);
          if (!isDone && !window.loadPyodide) {
            reject(new Error('Timed out waiting for Pyodide script. Please check your internet connection.'));
          }
        }, 20000);

        const existing = document.querySelector('script[src*="pyodide"]');
        if (existing) {
          existing.addEventListener('load', () => {
            clearInterval(timer);
            clearTimeout(timeout);
            resolve();
          });
          existing.addEventListener('error', (e) => {
            clearInterval(timer);
            clearTimeout(timeout);
            reject(new Error('Failed to load Pyodide from CDN: ' + (e instanceof Error ? e.message : 'Network error')));
          });
        } else {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
          script.defer = true;
          script.onload = () => {
            clearInterval(timer);
            clearTimeout(timeout);
            resolve();
          };
          script.onerror = (e) => {
            clearInterval(timer);
            clearTimeout(timeout);
            reject(new Error('Failed to load Pyodide from CDN: ' + (e instanceof Error ? e.message : 'Network error')));
          };
          document.head.appendChild(script);
        }
      });
    }

    if (!window.loadPyodide) {
      throw new Error('Pyodide loader unavailable.');
    }

    onStatus?.('Awakening Python interpreter...', false);
    const pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    });

    window.pyodideInstance = pyodide;

    // Load helper environment in Python
    try {
      await pyodide.runPythonAsync(PYTHON_SETUP_SCRIPT);
      isEnvironmentInitialized = true;
    } catch (e) {
      console.warn('Python helper setup notice:', e);
    }

    onStatus?.('Python 3.12 Ready', true);
    return pyodide;
  })();

  return pyodidePromise;
}

export interface ExecutionResult {
  success: boolean;
  executionTimeMs: number;
  friendlyHint?: FriendlyErrorHint | null;
  error?: string;
  resultValue?: string;
  plotUrl?: string;
  variables?: PythonVariable[];
}

export async function executePythonCode(
  code: string,
  callbacks: {
    onOutput: OutputCallback;
    onStatus?: StatusCallback;
    onInputRequest: (request: ActiveInputRequest) => void;
    stdinQueue?: string[];
  }
): Promise<ExecutionResult> {
  const startTime = performance.now();

  try {
    const pyodide = await getPyodide(callbacks.onStatus, callbacks.onOutput);

    // Set pre-buffered stdin queue if provided
    window.__calm_stdin_queue = callbacks.stdinQueue ? [...callbacks.stdinQueue] : [];

    // Setup stdout / stderr capturing
    pyodide.setStdout({
      batched: (text: string) => {
        callbacks.onOutput({
          type: 'stdout',
          text: text,
        });
      },
    });

    pyodide.setStderr({
      batched: (text: string) => {
        callbacks.onOutput({
          type: 'stderr',
          text: text,
        });
      },
    });

    // Wire up interactive input bridge
    window.__calm_input_bridge = (promptText: string): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
        callbacks.onInputRequest({
          prompt: promptText,
          resolve: (val: string) => {
            // Also log the user's typed input to the terminal
            callbacks.onOutput({
              type: 'input',
              text: `> ${val}`,
            });
            resolve(val);
          },
          reject: (err: Error) => {
            reject(err);
          },
        });
      });
    };

    // Check and auto-load any imported packages (like numpy, matplotlib, etc.)
    try {
      callbacks.onStatus?.('Checking library imports...', true);
      await pyodide.loadPackagesFromImports(code);
    } catch {
      // Non-blocking if pyodide package check encounters standard libraries
    }

    callbacks.onStatus?.('Executing code...', true);

    // Transform code to handle input() calls asynchronously
    let executableCode = code;
    try {
      pyodide.globals.set('__calm_raw_code', code);
      const transformed = await pyodide.runPythonAsync('__calm_transform(__calm_raw_code)');
      if (typeof transformed === 'string' && transformed.trim() !== '') {
        executableCode = transformed;
      }
    } catch {
      executableCode = code;
    }

    // Execute the Python code
    const rawResult = await pyodide.runPythonAsync(executableCode);
    const executionTimeMs = Math.round(performance.now() - startTime);

    // Check if any matplotlib plots were generated
    let plotUrl: string | undefined = undefined;
    try {
      const generatedPlot = await pyodide.runPythonAsync('__calm_check_plots()');
      if (typeof generatedPlot === 'string' && generatedPlot.startsWith('data:image/')) {
        plotUrl = generatedPlot;
        callbacks.onOutput({
          type: 'plot',
          text: '📊 Visual Plot Generated',
          plotUrl,
        });
      }
    } catch {
      // noop
    }

    let resultString: string | undefined = undefined;
    if (rawResult !== undefined && rawResult !== null) {
      resultString = String(rawResult);
      if (resultString !== 'None' && resultString.trim() !== '') {
        callbacks.onOutput({
          type: 'result',
          text: `↪ Return: ${resultString}`,
        });
      }
    }

    // Extract current Python variables for memory inspector
    let variables: PythonVariable[] | undefined = undefined;
    try {
      const varsJson = await pyodide.runPythonAsync('__calm_get_variables()');
      if (typeof varsJson === 'string') {
        variables = JSON.parse(varsJson);
      }
    } catch {
      // noop
    }

    callbacks.onStatus?.('Python 3.12 Ready', true);

    return {
      success: true,
      executionTimeMs,
      resultValue: resultString,
      plotUrl,
      variables,
    };
  } catch (err: unknown) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    const errorString = err instanceof Error ? err.message : String(err);

    callbacks.onOutput({
      type: 'stderr',
      text: errorString,
    });

    const friendlyHint = analyzePythonError(errorString);
    callbacks.onStatus?.('Python 3.12 Ready', true);

    return {
      success: false,
      executionTimeMs,
      error: errorString,
      friendlyHint,
    };
  } finally {
    window.__calm_input_bridge = undefined;
    window.__calm_active_abort = null;
  }
}

export function stopPythonExecution() {
  if (window.__calm_active_abort) {
    window.__calm_active_abort();
    window.__calm_active_abort = null;
  }
}
