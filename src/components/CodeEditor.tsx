import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Copy, Check, Trash2, ZoomIn, ZoomOut, Code2, Sparkles, Plus, X, Edit2 } from 'lucide-react';
import { ScriptFile } from '../types';

interface CodeEditorProps {
  code: string;
  files: ScriptFile[];
  activeFileId: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onSelectFile: (id: string) => void;
  onAddFile: () => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  activeLessonTitle?: string;
  errorLine?: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  files,
  activeFileId,
  onChange,
  onRun,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onRenameFile,
  activeLessonTitle,
  errorLine,
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState<string>('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear current code in editor?')) {
      onChange('');
    }
  };

  const startRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileId(id);
    setRenamingValue(currentName);
  };

  const saveRename = () => {
    if (editingFileId && renamingValue.trim()) {
      let finalName = renamingValue.trim();
      if (!finalName.endsWith('.py')) {
        finalName += '.py';
      }
      onRenameFile(editingFileId, finalName);
    }
    setEditingFileId(null);
  };

  const lineCount = code.split('\n').length;
  const charCount = code.length;

  return (
    <div className="flex flex-col h-full bg-[#0d1217] border-r border-slate-800/80">
      {/* File Tabs Bar */}
      <div className="h-10 border-b border-slate-800/80 bg-[#070a0e] px-2 flex items-center justify-between select-none overflow-x-auto">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-t-lg text-xs font-mono cursor-pointer border-t-2 transition-colors shrink-0 ${
                  isActive
                    ? 'bg-[#0d1217] border-emerald-500 text-slate-100 font-medium'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-850'
                }`}
              >
                <Code2 className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />

                {editingFileId === file.id ? (
                  <input
                    type="text"
                    value={renamingValue}
                    onChange={(e) => setRenamingValue(e.target.value)}
                    onBlur={saveRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename();
                      if (e.key === 'Escape') setEditingFileId(null);
                    }}
                    autoFocus
                    className="bg-slate-900 text-xs px-1 py-0.5 rounded border border-emerald-500 outline-none w-24 text-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => startRename(file.id, file.name, e)}
                    title="Double-click to rename"
                  >
                    {file.name}
                  </span>
                )}

                {/* Edit rename button */}
                <button
                  onClick={(e) => startRename(file.id, file.name, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-emerald-300 transition-opacity"
                  title="Rename tab"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>

                {/* Delete tab button (only if > 1 tab) */}
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(file.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 transition-opacity"
                    title="Close tab"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add New Tab */}
          <button
            id="btn-add-script-tab"
            onClick={onAddFile}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
            title="Create new practice script tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeLessonTitle && (
          <span className="hidden xl:inline-flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-xs pr-2">
            <Sparkles className="w-3 h-3 text-amber-400/80" />
            <span>{activeLessonTitle}</span>
          </span>
        )}
      </div>

      {/* Editor secondary toolbar */}
      <div className="h-9 border-b border-slate-800/80 bg-[#090d12] px-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>{lineCount} lines • {charCount} chars</span>
          {errorLine && (
            <span className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300 text-[10px]">
              Error on line {errorLine}
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Font size adjustments */}
          <div className="flex items-center bg-slate-800/60 border border-slate-700/60 rounded p-0.5">
            <button
              id="btn-font-decrease"
              onClick={() => setFontSize((s) => Math.max(12, s - 1))}
              disabled={fontSize <= 12}
              className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 disabled:opacity-30"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono px-1 text-slate-400 min-w-[20px] text-center">
              {fontSize}
            </span>
            <button
              id="btn-font-increase"
              onClick={() => setFontSize((s) => Math.min(22, s + 1))}
              disabled={fontSize >= 22}
              className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 disabled:opacity-30"
              title="Increase Font Size"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Copy Code */}
          <button
            id="btn-copy-code"
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Code */}
          <button
            id="btn-clear-code"
            onClick={handleClear}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear Code"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div
        className="flex-1 overflow-auto relative font-mono text-sm focus:outline-none"
        style={{ fontSize: `${fontSize}px` }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onRun();
          }
        }}
      >
        <CodeMirror
          value={code}
          height="100%"
          theme="dark"
          extensions={[python()]}
          onChange={(val) => onChange(val)}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
          className="h-full min-h-[300px]"
        />
      </div>

      {/* Footer hint */}
      <div className="px-4 py-1.5 bg-[#090d12]/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
          Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl+Enter</kbd> to execute
        </span>
        <span className="hidden sm:inline text-slate-400">Python 3.12 • UTF-8</span>
      </div>
    </div>
  );
};
