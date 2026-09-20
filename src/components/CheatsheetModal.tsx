import React, { useState } from 'react';
import { X, HelpCircle, Copy, Check } from 'lucide-react';

interface CheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCode?: (snippet: string) => void;
}

interface CheatsheetSection {
  title: string;
  items: {
    label: string;
    code: string;
    explanation: string;
  }[];
}

const CHEATSHEET_DATA: CheatsheetSection[] = [
  {
    title: 'Variables & Printing',
    items: [
      {
        label: 'Print Message',
        code: 'print("Hello, Python!")',
        explanation: 'Outputs text or variables to the terminal screen.',
      },
      {
        label: 'Variables',
        code: 'name = "Aria"\nage = 24\nis_learner = True',
        explanation: 'Store text, numbers, and boolean values without declaring types.',
      },
      {
        label: 'Formatted f-Strings',
        code: 'print(f"Name: {name}, Age: {age}")',
        explanation: 'Embed variable values seamlessly inside strings using f"...".',
      },
    ],
  },
  {
    title: 'Conditionals & Logic',
    items: [
      {
        label: 'if / elif / else',
        code: `if score >= 90:
    print("Flourishing!")
elif score >= 50:
    print("Steadily growing.")
else:
    print("Gentle practice makes perfect.")`,
        explanation: 'Branch decisions. Remember the 4-space indent under each condition.',
      },
      {
        label: 'Comparison Operators',
        code: '# == (equal)\n# != (not equal)\n# <, <=, >, >=',
        explanation: 'Check equalities and numerical relationships.',
      },
    ],
  },
  {
    title: 'Lists & Dictionaries',
    items: [
      {
        label: 'Lists (Ordered)',
        code: `colors = ["sage", "amber", "teal"]
colors.append("lavender")
print(colors[0])  # "sage"`,
        explanation: 'Lists hold sequences of items. Zero-indexed (first item is 0).',
      },
      {
        label: 'Dictionaries (Key-Value)',
        code: `user = {"name": "Zen", "level": 1}
print(user["name"])  # "Zen"
user["score"] = 100`,
        explanation: 'Store associated data pairs with custom descriptive keys.',
      },
    ],
  },
  {
    title: 'Loops',
    items: [
      {
        label: 'For Loop over Range',
        code: `for i in range(5):
    print(f"Step {i}")`,
        explanation: 'Executes 5 times from 0 to 4.',
      },
      {
        label: 'For Loop over List',
        code: `for item in ["sand", "water", "stone"]:
    print(f"Sanctuary element: {item}")`,
        explanation: 'Iterate directly over elements of a collection.',
      },
      {
        label: 'While Loop',
        code: `count = 3
while count > 0:
    print(count)
    count -= 1`,
        explanation: 'Repeats as long as the condition remains true.',
      },
    ],
  },
  {
    title: 'Functions & Modules',
    items: [
      {
        label: 'Custom Function',
        code: `def calculate_peace(hours, tea_cups):
    return hours * 10 + tea_cups * 5`,
        explanation: 'Reusable blocks of logic. Returns a computed value.',
      },
      {
        label: 'Importing Modules',
        code: `import math
import random

roll = random.randint(1, 6)
root = math.sqrt(64)`,
        explanation: 'Access rich built-in libraries included right in Python.',
      },
    ],
  },
];

export const CheatsheetModal: React.FC<CheatsheetModalProps> = ({
  isOpen,
  onClose,
  onInsertCode,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySnippet = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // noop
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] bg-[#0c1117] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-[#090d13] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Beginner Python Reference
              </h2>
              <p className="text-xs text-slate-400">
                Key patterns, syntax reminders, and quick examples at your fingertips
              </p>
            </div>
          </div>

          <button
            id="btn-close-cheatsheet"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {CHEATSHEET_DATA.map((section, sIdx) => (
            <div key={sIdx} className="space-y-3">
              <h3 className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.items.map((item, iIdx) => {
                  const id = `${sIdx}-${iIdx}`;
                  return (
                    <div
                      key={id}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-slate-200">{item.label}</span>
                          <button
                            id={`btn-copy-${id}`}
                            onClick={() => handleCopySnippet(item.code, id)}
                            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 text-[10px] flex items-center gap-1"
                            title="Copy snippet"
                          >
                            {copiedIndex === id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                          {item.explanation}
                        </p>
                      </div>

                      <pre className="p-2 rounded-lg bg-[#070a0e] text-emerald-300/90 font-mono text-[11px] overflow-x-auto border border-slate-800/60">
                        <code>{item.code}</code>
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#080c10] border-t border-slate-800/80 px-5 flex items-center justify-between text-xs text-slate-400">
          <span>Tip: Python uses clean indentation (4 spaces) instead of curly braces {} for blocks.</span>
          <button
            id="btn-close-cheatsheet-footer"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
