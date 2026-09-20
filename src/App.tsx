/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  TerminalEntry,
  FriendlyErrorHint,
  PracticeLesson,
  ActiveInputRequest,
  ScriptFile,
  PythonVariable,
} from './types';
import { PRACTICE_LESSONS } from './data/lessons';
import { executePythonCode, getPyodide } from './services/pythonRunner';
import { zenAudio, SoundscapeType } from './utils/zenAudio';
import { Header } from './components/Header';
import { CodeEditor } from './components/CodeEditor';
import { Terminal } from './components/Terminal';
import { LessonModal } from './components/LessonModal';
import { CheatsheetModal } from './components/CheatsheetModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { AITutorDrawer } from './components/AITutorDrawer';
import { AmbientRainCanvas } from './components/AmbientRainCanvas';

const FILES_STORAGE_KEY = 'python_playground_files_v2';
const ACTIVE_FILE_KEY = 'python_playground_active_file_v2';
const STDIN_STORAGE_KEY = 'python_playground_stdin_v2';

const DEFAULT_FILES: ScriptFile[] = [
  {
    id: 'interactive-test',
    name: 'test_input.py',
    code: `# Test interactive input commands right here!
# Run this code and respond directly in the terminal below.

test = input("What is your name? ")
print(f"Hello, {test}! Welcome to your calm Python sanctuary.")

favorite_color = input("What is your favorite calming color? ")
print(f"Envisioning a peaceful landscape in gentle {favorite_color}.")

number = input("Pick any number you like: ")
try:
    doubled = float(number) * 2
    print(f"Twice your number is {doubled}!")
except ValueError:
    print("That was creative! You can type numbers or words.")

print("\\n✓ All interactive inputs executed serenely.")
`,
    updatedAt: Date.now(),
  },
  {
    id: 'main',
    name: 'main.py',
    code: PRACTICE_LESSONS[1].code,
    updatedAt: Date.now(),
  },
  {
    id: 'matplotlib-demo',
    name: 'plot_wave.py',
    code: PRACTICE_LESSONS[8].code,
    updatedAt: Date.now(),
  },
];

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('LocalStorage read skipped:', e);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('LocalStorage write skipped:', e);
    }
  },
};

export default function App() {
  const [files, setFiles] = useState<ScriptFile[]>(() => {
    try {
      const saved = safeStorage.getItem(FILES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validated = parsed.filter(
            (f): f is ScriptFile => Boolean(f && typeof f.id === 'string' && typeof f.name === 'string' && typeof f.code === 'string')
          );
          if (validated.length > 0) return validated;
        }
      }
    } catch {
      // fallback to defaults
    }
    return DEFAULT_FILES;
  });

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    try {
      const savedId = safeStorage.getItem(ACTIVE_FILE_KEY);
      if (savedId && files.some((f) => f && f.id === savedId)) return savedId;
    } catch {
      // fallback
    }
    return files[0]?.id || 'interactive-test';
  });

  const [stdinBuffer, setStdinBuffer] = useState<string>(() => {
    return safeStorage.getItem(STDIN_STORAGE_KEY) || '';
  });

  const [activeLesson, setActiveLesson] = useState<PracticeLesson | null>(PRACTICE_LESSONS[0] || null);
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([
    {
      id: 'welcome-0',
      type: 'info',
      text: '🌿 Welcome to Python Sanctuary. CPython 3.12 WebAssembly, interactive input(), live variable inspection, & AI tutor ready.',
      timestamp: new Date(),
    },
  ]);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Initializing Engine...');
  const [lastExecutionTime, setLastExecutionTime] = useState<number | undefined>(undefined);
  const [lastErrorHint, setLastErrorHint] = useState<FriendlyErrorHint | null>(null);
  const [activeInputRequest, setActiveInputRequest] = useState<ActiveInputRequest | null>(null);
  const [plotUrl, setPlotUrl] = useState<string | null>(null);
  const [variables, setVariables] = useState<PythonVariable[]>([]);

  // Soundscape and Ambience States
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [soundscape, setSoundscape] = useState<SoundscapeType>('rain');
  const [volume, setVolume] = useState<number>(0.45);
  const [visualRain, setVisualRain] = useState<boolean>(true);

  // Modals & Drawers
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [isLessonsOpen, setIsLessonsOpen] = useState<boolean>(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState<boolean>(false);
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);

  // Active file & code
  const activeFile = useMemo(() => {
    return files.find((f) => f && f.id === activeFileId) || files[0] || DEFAULT_FILES[0];
  }, [files, activeFileId]);

  const code = activeFile ? activeFile.code : '';

  // Sync active file id to storage
  useEffect(() => {
    if (activeFileId) {
      safeStorage.setItem(ACTIVE_FILE_KEY, activeFileId);
    }
  }, [activeFileId]);

  // Sync files to storage
  useEffect(() => {
    if (files && files.length > 0) {
      safeStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
    }
  }, [files]);

  // Sync stdin buffer to storage
  useEffect(() => {
    safeStorage.setItem(STDIN_STORAGE_KEY, stdinBuffer);
  }, [stdinBuffer]);

  // Initialize Pyodide on mount
  useEffect(() => {
    getPyodide(
      (status, ready) => {
        setStatusText(status);
        setIsReady(ready);
      },
      (entry) => {
        setTerminalEntries((prev) => [
          ...prev,
          {
            id: 'init-' + Math.random(),
            type: entry.type,
            text: entry.text,
            timestamp: new Date(),
            plotUrl: entry.plotUrl,
          },
        ]);
      }
    ).catch(() => {
      setStatusText('Ready (on-demand)');
      setIsReady(true);
    });
  }, []);

  const updateActiveCode = useCallback(
    (newCode: string) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === activeFileId ? { ...f, code: newCode, updatedAt: Date.now() } : f))
      );
    },
    [activeFileId]
  );

  const handleSelectFile = (id: string) => {
    setActiveFileId(id);
    setLastErrorHint(null);
  };

  const handleAddFile = () => {
    const nextIndex = files.length + 1;
    const newId = 'script-' + Date.now();
    const newFile: ScriptFile = {
      id: newId,
      name: `exercise_${nextIndex}.py`,
      code: `# Practice Script ${nextIndex}\nprint("New peaceful exercise!")\n`,
      updatedAt: Date.now(),
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newId);
  };

  const handleDeleteFile = (id: string) => {
    if (files.length <= 1) return;
    const fileToDelete = files.find((f) => f.id === id);
    if (window.confirm(`Delete "${fileToDelete?.name || 'this file'}"?`)) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      if (activeFileId === id) {
        const remaining = files.filter((f) => f.id !== id);
        setActiveFileId(remaining[0].id);
      }
    }
  };

  const handleRenameFile = (id: string, newName: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name: newName } : f)));
  };

  const handleStop = useCallback(() => {
    if (activeInputRequest) {
      activeInputRequest.reject(new Error('KeyboardInterrupt: Execution interrupted by user'));
      setActiveInputRequest(null);
    }
    setIsRunning(false);
    setTerminalEntries((prev) => [
      ...prev,
      {
        id: 'stop-' + Date.now(),
        type: 'stderr',
        text: 'KeyboardInterrupt: Execution stopped by user.',
        timestamp: new Date(),
      },
    ]);
  }, [activeInputRequest]);

  const handleRun = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setLastErrorHint(null);
    setActiveInputRequest(null);

    // Append execution start marker in terminal
    setTerminalEntries((prev) => [
      ...prev,
      {
        id: 'run-start-' + Date.now(),
        type: 'info',
        text: `▶ Run ${activeFile.name} (${new Date().toLocaleTimeString()})`,
        timestamp: new Date(),
      },
    ]);

    // Parse pre-buffered stdin queue
    const stdinQueue = stdinBuffer
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const result = await executePythonCode(code, {
      stdinQueue,
      onOutput: (entry) => {
        setTerminalEntries((prev) => [
          ...prev,
          {
            id: 'out-' + Math.random(),
            type: entry.type,
            text: entry.text,
            timestamp: new Date(),
            plotUrl: entry.plotUrl,
          },
        ]);
      },
      onStatus: (status, ready) => {
        setStatusText(status);
        setIsReady(ready);
      },
      onInputRequest: (request: ActiveInputRequest) => {
        setActiveInputRequest(request);
      },
    });

    setIsRunning(false);
    setActiveInputRequest(null);
    setLastExecutionTime(result.executionTimeMs);

    if (result.plotUrl) {
      setPlotUrl(result.plotUrl);
    }

    if (result.variables) {
      setVariables(result.variables);
    }

    if (result.success) {
      zenAudio.playSuccessChime();
      confetti({
        particleCount: 24,
        spread: 45,
        origin: { y: 0.85, x: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b'],
        disableForReducedMotion: true,
      });
    } else if (result.friendlyHint) {
      setLastErrorHint(result.friendlyHint);
    }
  }, [code, isRunning, activeFile.name, stdinBuffer]);

  const handleQuickRunSnippet = useCallback(
    async (snippet: string) => {
      if (isRunning) return;

      setTerminalEntries((prev) => [
        ...prev,
        {
          id: 'repl-' + Date.now(),
          type: 'input',
          text: snippet,
          timestamp: new Date(),
        },
      ]);

      setIsRunning(true);
      const result = await executePythonCode(snippet, {
        onOutput: (entry) => {
          setTerminalEntries((prev) => [
            ...prev,
            {
              id: 'out-' + Math.random(),
              type: entry.type,
              text: entry.text,
              timestamp: new Date(),
              plotUrl: entry.plotUrl,
            },
          ]);
        },
        onInputRequest: (request) => {
          setActiveInputRequest(request);
        },
      });

      setIsRunning(false);
      setActiveInputRequest(null);
      if (result.plotUrl) setPlotUrl(result.plotUrl);
      if (result.variables) setVariables(result.variables);
      if (result.friendlyHint) {
        setLastErrorHint(result.friendlyHint);
      }
    },
    [isRunning]
  );

  const handleClearTerminal = () => {
    setTerminalEntries([]);
    setLastErrorHint(null);
    setPlotUrl(null);
  };

  const handleResetCode = () => {
    if (window.confirm('Reset current file to the active lesson code?')) {
      const targetLesson = activeLesson || PRACTICE_LESSONS[0];
      updateActiveCode(targetLesson.code);
    }
  };

  const handleExport = () => {
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.name || 'sanctuary.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Soundscape audio handlers
  const handleTogglePlayAudio = () => {
    const playing = zenAudio.toggleSoundscape();
    setIsAudioPlaying(playing);
  };

  const handleSelectSoundscape = (type: SoundscapeType) => {
    setSoundscape(type);
    zenAudio.toggleSoundscape(type);
    setIsAudioPlaying(true);
  };

  const handleChangeVolume = (newVol: number) => {
    setVolume(newVol);
    zenAudio.setVolume(newVol);
  };

  const handleSelectLesson = (lesson: PracticeLesson) => {
    updateActiveCode(lesson.code);
    setActiveLesson(lesson);
    setTerminalEntries((prev) => [
      ...prev,
      {
        id: 'lesson-' + Date.now(),
        type: 'info',
        text: `📖 Loaded lesson: "${lesson.title}". ${lesson.hint}`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0f14] text-slate-200 relative">
      {/* Background Ambient Rain Overlay */}
      <AmbientRainCanvas enabled={isAudioPlaying && visualRain} />

      {/* Top Navigation Bar */}
      <Header
        isRunning={isRunning}
        statusText={statusText}
        isReady={isReady}
        isAudioPlaying={isAudioPlaying}
        soundscapeName={soundscape}
        onRun={handleRun}
        onStop={handleStop}
        onReset={handleResetCode}
        onExport={handleExport}
        onOpenAudioModal={() => setIsAudioModalOpen(true)}
        onOpenLessons={() => setIsLessonsOpen(true)}
        onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
        onOpenTutor={() => setIsTutorOpen(true)}
      />

      {/* Main Workspace Split Grid */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-20">
        {/* Left Pane: Code Editor */}
        <div className="h-1/2 lg:h-full lg:w-1/2 flex flex-col min-w-0">
          <CodeEditor
            code={code}
            files={files}
            activeFileId={activeFileId}
            onChange={updateActiveCode}
            onRun={handleRun}
            onSelectFile={handleSelectFile}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
            activeLessonTitle={activeLesson?.title}
            errorLine={lastErrorHint?.line}
          />
        </div>

        {/* Right Pane: Output Terminal */}
        <div className="h-1/2 lg:h-full lg:w-1/2 flex flex-col min-w-0">
          <Terminal
            entries={terminalEntries}
            isRunning={isRunning}
            lastExecutionTime={lastExecutionTime}
            lastErrorHint={lastErrorHint}
            activeInputRequest={activeInputRequest}
            plotUrl={plotUrl}
            variables={variables}
            stdinBuffer={stdinBuffer}
            onChangeStdinBuffer={setStdinBuffer}
            onClear={handleClearTerminal}
            onStop={handleStop}
            onQuickRunSnippet={handleQuickRunSnippet}
            onOpenTutor={() => setIsTutorOpen(true)}
          />
        </div>
      </main>

      {/* Zen Ambience & Soundscapes Control Modal */}
      <AudioSettingsModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        isPlaying={isAudioPlaying}
        currentSoundscape={soundscape}
        volume={volume}
        visualRain={visualRain}
        onTogglePlay={handleTogglePlayAudio}
        onSelectSoundscape={handleSelectSoundscape}
        onChangeVolume={handleChangeVolume}
        onToggleVisualRain={() => setVisualRain((v) => !v)}
      />

      {/* AI Tutor "Zen Sensei" Drawer */}
      <AITutorDrawer
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        currentCode={code}
        lastError={lastErrorHint?.friendlyMessage}
      />

      {/* Beginner Lessons Modal */}
      <LessonModal
        isOpen={isLessonsOpen}
        onClose={() => setIsLessonsOpen(false)}
        onSelectLesson={handleSelectLesson}
        currentLessonId={activeLesson?.id}
      />

      {/* Quick Reference Cheatsheet Modal */}
      <CheatsheetModal
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />
    </div>
  );
}
