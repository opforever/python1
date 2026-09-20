import React from 'react';
import {
  Play,
  Sparkles,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Square,
  Bot,
  Sliders,
} from 'lucide-react';

interface HeaderProps {
  isRunning: boolean;
  statusText: string;
  isReady: boolean;
  isAudioPlaying: boolean;
  soundscapeName: string;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onExport: () => void;
  onOpenAudioModal: () => void;
  onOpenLessons: () => void;
  onOpenCheatsheet: () => void;
  onOpenTutor: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  statusText,
  isReady,
  isAudioPlaying,
  soundscapeName,
  onRun,
  onStop,
  onReset,
  onExport,
  onOpenAudioModal,
  onOpenLessons,
  onOpenCheatsheet,
  onOpenTutor,
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0b0f14]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Python Status */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
          <svg
            className="w-5 h-5 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M11.91 0c-4.49 0-4.2 1.94-4.2 1.94l.01 2.02h4.29v.61H5.97S3 4.23 3 8.75s2.6 4.39 2.6 4.39h1.55v-2.18s-.08-2.6 2.56-2.6h4.39s2.48.04 2.48-2.43V2.43S16.89 0 11.91 0zm-2.3 1.25a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6zm6.42 6.64s.08 2.6-2.56 2.6H9.08s-2.48-.04-2.48 2.43v3.51s-.31 2.43 4.67 2.43c4.49 0 4.2-1.94 4.2-1.94l-.01-2.02h-4.29v-.61h6.04s2.97.34 2.97-4.18-2.6-4.39-2.6-4.39h-1.55v2.17zm-1.89 12.36a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6z" />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              Python Sanctuary
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {statusText}
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Serene Python 3.12 WebAssembly environment with interactive input &amp; AI tutor
          </p>
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Practice Exercises Button */}
        <button
          id="btn-practice-lessons"
          onClick={onOpenLessons}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 hover:border-slate-600 transition-all hover:text-slate-100 active:scale-95"
          title="Browse beginner practice lessons"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Lessons</span>
        </button>

        {/* Cheatsheet Button */}
        <button
          id="btn-cheatsheet"
          onClick={onOpenCheatsheet}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 hover:border-slate-600 transition-all hover:text-slate-100 active:scale-95"
          title="Quick Python Reference & Cheatsheet"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden lg:inline">Cheatsheet</span>
        </button>

        {/* AI Tutor Button */}
        <button
          id="btn-ai-tutor"
          onClick={onOpenTutor}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-950/80 to-teal-950/80 text-emerald-300 border border-emerald-700/60 hover:border-emerald-500 transition-all active:scale-95 shadow-sm"
          title="Open Zen Sensei AI Tutor"
        >
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sensei AI</span>
        </button>

        {/* Ambient Soundscapes Control Popover Trigger */}
        <button
          id="btn-zen-ambient-menu"
          onClick={onOpenAudioModal}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
            isAudioPlaying
              ? 'bg-teal-950/80 text-teal-300 border-teal-600/70 shadow-sm shadow-teal-900/40'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-300'
          }`}
          title="Ambient Soundscapes & Volume Controls"
        >
          {isAudioPlaying ? (
            <>
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-teal-400 animate-pulse" />
                <span className="w-0.5 h-3 bg-teal-300 animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-teal-400 animate-pulse delay-150" />
              </div>
              <span className="hidden sm:inline capitalize">{soundscapeName}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ambience</span>
            </>
          )}
          <Sliders className="w-3 h-3 opacity-60 ml-0.5" />
        </button>

        {/* Export Script */}
        <button
          id="btn-export-py"
          onClick={onExport}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all"
          title="Download script as .py file"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Reset Code */}
        <button
          id="btn-reset-code"
          onClick={onReset}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all"
          title="Reset to fresh sample"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Stop Button (when running) */}
        {isRunning && (
          <button
            id="btn-header-stop"
            onClick={onStop}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 transition-all active:scale-95 shadow-lg animate-in fade-in"
            title="Interrupt execution (Ctrl + C)"
          >
            <Square className="w-4 h-4 fill-rose-400 text-rose-400" />
            <span>Stop</span>
          </button>
        )}

        {/* Run Button */}
        <button
          id="btn-run-code"
          onClick={onRun}
          disabled={isRunning}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-95 ${
            isRunning
              ? 'bg-emerald-700/50 text-emerald-200 cursor-not-allowed border border-emerald-600/40'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 hover:shadow-emerald-900/60 border border-emerald-400/30'
          }`}
          title="Execute Python Code (Ctrl + Enter or ⌘ + Enter)"
        >
          {isRunning ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-white" />
              <span>Run Code</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] tracking-wider rounded bg-emerald-800/60 text-emerald-200 border border-emerald-700/50 font-mono">
                Ctrl+Enter
              </kbd>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
