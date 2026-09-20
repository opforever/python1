import React, { useState } from 'react';
import { Sparkles, MessageSquare, Bug, Compass, Send, X, Bot, Loader2, RefreshCw } from 'lucide-react';

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  lastError?: string | null;
}

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: Date;
}

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  isOpen,
  onClose,
  currentCode,
  lastError,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: "Warm greetings, dear friend. I am Zen Sensei, your peaceful Python tutor. Whether you want to understand how a loop works, unpack a confusing error, or explore a gentle challenge, I am here to guide you.",
      timestamp: new Date(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const askTutor = async (action: 'explain' | 'fix' | 'challenge' | 'chat', userQuestion?: string) => {
    if (isLoading) return;

    let userMessageText = userQuestion || '';
    if (action === 'explain') userMessageText = 'Could you please explain what this code does in simple terms?';
    if (action === 'fix') userMessageText = 'Can you help me understand and fix this error?';
    if (action === 'challenge') userMessageText = 'What is a fun, gentle practice step I can try next?';

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userMessageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          question: userQuestion,
          action,
          error: lastError,
        }),
      });

      const data = await res.json();
      const tutorReply = data.reply || 'I am reflecting peacefully. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: 'tutor-' + Date.now(),
          sender: 'tutor',
          text: tutorReply,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'tutor-err-' + Date.now(),
          sender: 'tutor',
          text: "I could not reach the server right now. Take a deep breath and feel free to try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setInputQuery('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    askTutor('chat', inputQuery.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0e1319] border-l border-slate-800 flex flex-col h-full shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800/80 bg-[#0a0e13] flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                Zen Sensei
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-normal">
                  Gemini AI Tutor
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Your calm Python companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Assistant Prompts */}
        <div className="p-3 bg-[#080c10] border-b border-slate-800/70 flex flex-wrap gap-1.5 select-none">
          <button
            onClick={() => askTutor('explain')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Explain This Code</span>
          </button>

          {lastError && (
            <button
              onClick={() => askTutor('fix')}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/50 text-xs text-rose-200 flex items-center gap-1.5 transition-colors disabled:opacity-40 animate-pulse"
            >
              <Bug className="w-3 h-3 text-rose-400" />
              <span>Fix &amp; Explain Error</span>
            </button>
          )}

          <button
            onClick={() => askTutor('challenge')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Compass className="w-3 h-3 text-sky-400" />
            <span>Next Practice Step</span>
          </button>
        </div>

        {/* Conversation Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                    isUser
                      ? 'bg-emerald-700 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Zen Sensei is reflecting peacefully...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-[#0a0e13] border-t border-slate-800/80 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask Sensei anything about Python..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500/70 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors"
            title="Send question"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
