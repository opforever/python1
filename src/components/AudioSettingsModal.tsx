import React from 'react';
import { Volume2, VolumeX, CloudRain, Waves, Bell, Wind, Sparkles, X, Eye } from 'lucide-react';
import { zenAudio, SoundscapeType } from '../utils/zenAudio';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  currentSoundscape: SoundscapeType;
  volume: number;
  visualRain: boolean;
  onTogglePlay: () => void;
  onSelectSoundscape: (type: SoundscapeType) => void;
  onChangeVolume: (vol: number) => void;
  onToggleVisualRain: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  isPlaying,
  currentSoundscape,
  volume,
  visualRain,
  onTogglePlay,
  onSelectSoundscape,
  onChangeVolume,
  onToggleVisualRain,
}) => {
  if (!isOpen) return null;

  const soundscapes: { id: SoundscapeType; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'rain',
      label: 'Gentle Rain',
      desc: 'Soft rhythmic raindrops with subtle droplet resonance',
      icon: <CloudRain className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'ocean',
      label: 'Ocean Waves',
      desc: 'Slow breathing rolling waves that ease the mind',
      icon: <Waves className="w-4 h-4 text-sky-400" />,
    },
    {
      id: 'chimes',
      label: 'Zen Chimes',
      desc: 'Gentle forest breeze with intermittent singing crystal bells',
      icon: <Bell className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'brown-noise',
      label: 'Cozy Focus Noise',
      desc: 'Warm, grounding low-frequency brown noise for deep focus',
      icon: <Wind className="w-4 h-4 text-teal-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0e1318] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Zen Ambience & Soundscapes</h3>
              <p className="text-[11px] text-slate-400">Procedural calming acoustic sanctuary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Main Power Toggle Button */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isPlaying ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isPlaying ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-200">
                  {isPlaying ? 'Ambience Playing' : 'Ambience Paused'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isPlaying ? 'Synthesizing natural background frequencies' : 'Click play to start calming audio'}
                </p>
              </div>
            </div>
            <button
              id="btn-modal-toggle-audio"
              onClick={onTogglePlay}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isPlaying
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {isPlaying ? 'Pause' : 'Play Audio'}
            </button>
          </div>

          {/* Soundscapes Selector */}
          <div>
            <label className="text-xs font-medium text-slate-300 mb-2 block">Select Soundscape</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {soundscapes.map((s) => {
                const isSelected = currentSoundscape === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelectSoundscape(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-slate-100 shadow-sm'
                        : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {s.icon}
                      <span className="text-xs font-semibold">{s.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{s.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Volume Level</span>
              <span className="font-mono text-emerald-400 text-xs">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Visual Rain Effect Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-medium text-slate-200">Subtle Background Raindrops</p>
                <p className="text-[11px] text-slate-400">Gentle falling particles overlay on the canvas</p>
              </div>
            </div>
            <button
              onClick={onToggleVisualRain}
              className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                visualRain ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  visualRain ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <button
            onClick={() => zenAudio.playSuccessChime()}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test Meditation Chime</span>
          </button>
          <span>Web Audio API</span>
        </div>
      </div>
    </div>
  );
};
