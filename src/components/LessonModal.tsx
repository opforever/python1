import React from 'react';
import { PRACTICE_LESSONS } from '../data/lessons';
import { PracticeLesson } from '../types';
import { X, BookOpen, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLesson: (lesson: PracticeLesson) => void;
  currentLessonId?: string;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  onSelectLesson,
  currentLessonId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] bg-[#0c1117] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 bg-[#090d13] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Beginner Practice Lessons
              </h2>
              <p className="text-xs text-slate-400">
                Curated calm exercises to learn and test real Python step-by-step
              </p>
            </div>
          </div>

          <button
            id="btn-close-lessons-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lessons Grid */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PRACTICE_LESSONS.map((lesson) => {
              const isSelected = currentLessonId === lesson.id;
              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    onSelectLesson(lesson);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-sm shadow-emerald-950/40'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                        {lesson.category}
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {lesson.difficulty}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors mb-1">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      {lesson.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">
                    <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {lesson.hint}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-[11px]">
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <span>Load</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#080c10] border-t border-slate-800/80 px-5 flex items-center justify-between text-xs text-slate-400">
          <span>Click any card to load the code into the editor without losing your progress.</span>
          <button
            id="btn-close-lessons-modal-footer"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
