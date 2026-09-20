import React, { useRef, useEffect, useState } from 'react';
import {
  Terminal as TerminalIcon,
  Trash2,
  Copy,
  Check,
  Play,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  Square,
  BarChart3,
  Download,
  SlidersHorizontal,
  Info,
  CornerDownLeft,
  Send,
  Layers,
  Bot,
} from 'lucide-react';
import { TerminalEntry, FriendlyErrorHint, ActiveInputRequest, PythonVariable } from '../types';

interface TerminalProps {
  entries: TerminalEntry[];
  isRunning: boolean;
  lastExecutionTime?: number;
  lastErrorHint?: FriendlyErrorHint | null;
  activeInputRequest: ActiveInputRequest | null;
  plotUrl?: string | null;
  variables?: PythonVariable[];
  stdinBuffer: string;
  onChangeStdinBuffer: (value: string) => void;
  onClear: () => void;
  onStop: () => void;
  onQuickRunSnippet?: (snippet: string) => void;
  onOpenTutor?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  entries,
  isRunning,
  lastExecutionTime,
  lastErrorHint,
  activeInputRequest,
  plotUrl,
  variables = [],
  stdinBuffer,
  onChangeStdinBuffer,
  onClear,
  onStop,
  onQuickRunSnippet,
  onOpenTutor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const interactiveInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'terminal' | 'variables' | 'plots' | 'stdin'>('terminal');
  const [copied, setCopied] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [interactiveInputValue, setInteractiveInputValue] = useState('');

  // Auto-switch to plots tab if a new plot arrives
  useEffect(() => {
    if (plotUrl) {
      setActiveTab('plots');
    }
  }, [plotUrl]);

  // Auto-switch to terminal tab when interactive input is requested
  useEffect(() => {
    if (activeInputRequest) {
      setActiveTab('terminal');
      setTimeout(() => {
        interactiveInputRef.current?.focus();
      }, 50);
    }
  }, [activeInputRequest]);

  // Auto-scroll terminal to bottom when new logs or inputs arrive
  useEffect(() => {
    if (activeTab === 'terminal' && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries, activeInputRequest, activeTab]);

  const handleCopy = async () => {
    const fullText = entries.map((e) => e.text).join('\n');
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleInteractiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInputRequest) return;
    const val = interactiveInputValue;
    setInteractiveInputValue('');
    activeInputRequest.resolve(val);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim() || !onQuickRunSnippet) return;
    onQuickRunSnippet(quickInput.trim());
    setQuickInput('');
  };

  const downloadPlot = () => {
    if (!plotUrl) return;
    const a = document.createElement('a');
    a.href = plotUrl;
    a.download = 'python_plot.png';
    a.click();
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'int':
      case 'float':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/40';
      case 'str':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40';
      case 'list':
      case 'tuple':
      case 'set':
        return 'bg-sky-950/60 text-sky-300 border-sky-800/40';
      case 'dict':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/40';
      case 'bool':
        return 'bg-teal-950/60 text-teal-300 border-teal-800/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090d12] border-t lg:border-t-0 border-slate-800/80">
      {/* Terminal Header & Navigation */}
      <div className="h-11 border-b border-slate-800/80 bg-[#070a0e] px-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {/* Terminal Tab */}
          <button
            id="tab-terminal"
            onClick={() => setActiveTab('terminal')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'terminal'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal</span>
            {activeInputRequest && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Waiting for input" />
            )}
          </button>

          {/* Variables (Memory) Tab */}
          <button
            id="tab-variables"
            onClick={() => setActiveTab('variables')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'variables'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Inspect variables currently stored in Python memory"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Variables</span>
            {variables.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-950 text-amber-400 border border-amber-800">
                {variables.length}
              </span>
            )}
          </button>

          {/* Plots Tab */}
          <button
            id="tab-plots"
            onClick={() => setActiveTab('plots')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'plots'
                ? 'bg-slate-800 text-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Plots</span>
            {plotUrl && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-sky-950 text-sky-400 border border-sky-800">
                1
              </span>
            )}
          </button>

          {/* Stdin Tab */}
          <button
            id="tab-stdin"
            onClick={() => setActiveTab('stdin')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'stdin'
                ? 'bg-slate-800 text-teal-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Pre-buffered Standard Input"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Input (stdin)</span>
            {stdinBuffer.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            )}
          </button>

          {isRunning && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/60 text-amber-400 border border-amber-800/40 animate-pulse ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Running...
            </span>
          )}

          {!isRunning && lastExecutionTime !== undefined && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono ml-1">
              <span>{lastExecutionTime}ms</span>
            </span>
          )}
        </div>

        {/* Toolbar actions */}
        <div className="flex items-center gap-1">
          {/* AI Tutor Assistant Button */}
          {onOpenTutor && (
            <button
              id="btn-terminal-open-tutor"
              onClick={onOpenTutor}
              className="px-2 py-1 rounded-lg text-xs font-medium bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800/50 text-emerald-300 flex items-center gap-1.5 transition-colors shadow-xs"
              title="Open Zen Sensei AI Tutor"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Ask Tutor</span>
            </button>
          )}

          {/* Stop / Interrupt Button */}
          {isRunning && (
            <button
              id="btn-terminal-stop"
              onClick={onStop}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 flex items-center gap-1.5 transition-colors animate-pulse"
              title="Interrupt code execution (Ctrl + C)"
            >
              <Square className="w-3 h-3 fill-rose-400 text-rose-400" />
              <span>Stop</span>
            </button>
          )}

          {/* Copy logs */}
          <button
            id="btn-copy-terminal"
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy Output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear logs */}
          <button
            id="btn-clear-terminal"
            onClick={onClear}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TAB 1: Main Terminal Stream */}
      {activeTab === 'terminal' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Output log entries container */}
          <div
            ref={containerRef}
            className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 leading-relaxed selection:bg-emerald-500/30"
          >
            {entries.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 select-none py-12">
                <TerminalIcon className="w-8 h-8 mb-2 stroke-1 opacity-40 text-emerald-400" />
                <p className="text-xs">Quiet terminal awaiting execution</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click &ldquo;Run Code&rdquo; or press <kbd className="font-mono text-slate-300">Ctrl+Enter</kbd>
                </p>
              </div>
            )}

            {entries.map((entry) => {
              switch (entry.type) {
                case 'stdout':
                  return (
                    <div key={entry.id} className="text-slate-200 whitespace-pre-wrap break-words">
                      {entry.text}
                    </div>
                  );
                case 'stderr':
                  return (
                    <div
                      key={entry.id}
                      className="text-rose-400/90 whitespace-pre-wrap break-words bg-rose-950/20 p-2 rounded-lg border border-rose-900/30 my-1 font-mono"
                    >
                      <div className="flex items-center gap-1.5 text-rose-300 font-semibold mb-1 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Traceback / Runtime Notice</span>
                      </div>
                      {entry.text}
                    </div>
                  );
                case 'result':
                  return (
                    <div
                      key={entry.id}
                      className="text-emerald-300 font-medium py-0.5 px-2 bg-emerald-950/30 rounded border border-emerald-800/20 inline-block my-0.5"
                    >
                      {entry.text}
                    </div>
                  );
                case 'input':
                  return (
                    <div key={entry.id} className="text-sky-300/90 flex items-center gap-1 py-0.5">
                      <span className="text-slate-400 select-none">&gt;&gt;&gt;</span>
                      <span>{entry.text}</span>
                    </div>
                  );
                case 'plot':
                  return (
                    <div
                      key={entry.id}
                      onClick={() => setActiveTab('plots')}
                      className="text-sky-400 bg-sky-950/30 border border-sky-800/40 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-2 cursor-pointer hover:bg-sky-900/40 transition-colors my-1"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>{entry.text} — Click to view in Plots tab</span>
                    </div>
                  );
                case 'info':
                default:
                  return (
                    <div key={entry.id} className="text-slate-400 italic text-[11px]">
                      {entry.text}
                    </div>
                  );
              }
            })}

            {/* In-Terminal Interactive Input Prompt Widget */}
            {activeInputRequest && (
              <div className="my-2 p-3 rounded-xl bg-slate-900 border-2 border-emerald-500/70 shadow-lg shadow-emerald-950/40 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 mb-1.5">
                  <CornerDownLeft className="w-4 h-4 text-emerald-400" />
                  <span>Python is asking for input:</span>
                </div>

                {activeInputRequest.prompt && (
                  <p className="text-xs text-slate-200 font-mono mb-2 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    {activeInputRequest.prompt}
                  </p>
                )}

                <form onSubmit={handleInteractiveSubmit} className="flex items-center gap-2">
                  <input
                    ref={interactiveInputRef}
                    type="text"
                    value={interactiveInputValue}
                    onChange={(e) => setInteractiveInputValue(e.target.value)}
                    placeholder="Type response and press Enter..."
                    className="flex-1 bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-1.5 text-xs text-emerald-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>Submit</span>
                    <Send className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => activeInputRequest.reject(new Error('User cancelled input'))}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition-colors shrink-0"
                    title="Cancel prompt"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {/* Beginner-Friendly Error Guide Card */}
            {lastErrorHint && (
              <div className="mt-3 p-3.5 rounded-xl bg-amber-950/20 border border-amber-600/30 text-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>{lastErrorHint.errorType} Guide</span>
                  </div>
                  {lastErrorHint.line && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/40">
                      Line {lastErrorHint.line}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lastErrorHint.friendlyMessage}
                </p>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-amber-900/30 text-[11px] text-amber-200 font-mono">
                  💡 {lastErrorHint.suggestion}
                </div>
              </div>
            )}
          </div>

          {/* Quick Python REPL Single-Line Input Bar */}
          <form
            onSubmit={handleQuickSubmit}
            className="h-10 border-t border-slate-800/80 bg-[#070a0e] px-3 flex items-center gap-2"
          >
            <span className="text-emerald-500 font-mono text-xs select-none">&gt;&gt;&gt;</span>
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Quick one-line Python test (e.g. 2**10 or len('peaceful'))"
              disabled={isRunning || Boolean(activeInputRequest)}
              className="flex-1 bg-transparent text-xs text-slate-200 font-mono focus:outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!quickInput.trim() || isRunning}
              className="p-1 rounded text-slate-400 hover:text-emerald-400 disabled:opacity-30 transition-colors"
              title="Execute expression in REPL"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Live Variables / Memory Inspector */}
      {activeTab === 'variables' && (
        <div className="flex-1 p-4 overflow-y-auto flex flex-col font-sans">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Layers className="w-4 h-4" />
              <span>Live Python Memory &amp; Variables</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {variables.length} active variable(s)
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            As your Python code runs, any variables you declare or store are inspected live in memory. 
            This helps you visualize your data structures and state!
          </p>

          {variables.length > 0 ? (
            <div className="space-y-2">
              {variables.map((v) => (
                <div
                  key={v.name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300 font-semibold">{v.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-medium border ${getTypeBadgeColor(
                        v.type
                      )}`}
                    >
                      {v.type}
                    </span>
                  </div>
                  <div className="text-slate-300 max-w-xs truncate bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
                    {v.value}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-slate-400 my-auto">
              <Layers className="w-8 h-8 mx-auto mb-2 text-amber-500/40" />
              <p className="text-xs text-slate-300">No user variables in memory yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Declare variables like <code className="text-amber-300 font-mono">x = 10</code> or{' '}
                <code className="text-amber-300 font-mono">name = &quot;Aria&quot;</code> and run your script!
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Visual Plot Rendering */}
      {activeTab === 'plots' && (
        <div className="flex-1 p-4 overflow-y-auto flex flex-col items-center justify-center font-sans">
          {plotUrl ? (
            <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-800 text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  Matplotlib Visual Figure
                </span>
                <button
                  onClick={downloadPlot}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Download Image</span>
                </button>
              </div>
              <img
                src={plotUrl}
                alt="Matplotlib generated plot"
                className="w-full h-auto rounded-xl border border-slate-800 bg-[#090d12]"
                referrerPolicy="no-referrer"
              />
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Visual generated via Python Matplotlib backend
              </p>
            </div>
          ) : (
            <div className="text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-sky-950/40 border border-sky-800/30 flex items-center justify-center text-sky-400 mb-3 mx-auto">
                <BarChart3 className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-300 mb-1">No Plots Generated Yet</p>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Run any code importing <code className="text-sky-300 font-mono">matplotlib.pyplot</code> and calling{' '}
                <code className="text-sky-300 font-mono">plt.show()</code>. Your rendered graph will appear here automatically!
              </p>
              <button
                onClick={() => {
                  if (onQuickRunSnippet) {
                    onQuickRunSnippet(
                      `import matplotlib.pyplot as plt\nplt.figure(figsize=(6,3))\nplt.plot([1,2,3,4],[1,4,9,16],'g-o')\nplt.title('Quick Test Plot')\nplt.show()`
                    );
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-800/60 text-sky-300 text-xs font-medium transition-colors"
              >
                Try Quick Sample Plot
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Pre-buffered Stdin Inputs */}
      {activeTab === 'stdin' && (
        <div className="flex-1 p-4 overflow-y-auto flex flex-col font-sans">
          <div className="flex items-center gap-2 mb-2 text-xs text-teal-400 font-medium">
            <Info className="w-4 h-4" />
            <span>Pre-buffered Standard Input (stdin)</span>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            If your script uses multiple <code className="text-teal-300 font-mono">input()</code> statements (e.g. for competitive programming or automated test exercises), you can paste them here line-by-line. The program will consume each line automatically without pausing for interactive prompts. If left empty, you will be prompted interactively in the terminal!
          </p>
          <textarea
            id="stdin-buffer-textarea"
            value={stdinBuffer}
            onChange={(e) => onChangeStdinBuffer(e.target.value)}
            placeholder={`Example input values:\nAlice\n2005\nPeaceful Mountain`}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl p-3 text-xs text-slate-200 font-mono resize-none focus:outline-none transition-colors shadow-inner"
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>{stdinBuffer.split('\n').filter(Boolean).length} line(s) ready in buffer</span>
            {stdinBuffer && (
              <button
                onClick={() => onChangeStdinBuffer('')}
                className="text-rose-400 hover:underline"
              >
                Clear Buffer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
