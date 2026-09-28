import React, { useState, useRef, useEffect } from 'react';
import { Subtitles, Check } from 'lucide-react';

export default function SubtitleSelector({ tracks = [], activeTrack = -1, onSelectTrack }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!tracks || tracks.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 rounded-full text-slate-300 hover:text-purple-400 transition active:scale-95"
        title="Subtitles"
      >
        <Subtitles className={`w-4 h-4 ${activeTrack !== -1 ? 'text-purple-400' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-slate-950/95 border border-slate-800/90 rounded-2xl p-2 shadow-2xl backdrop-blur-xl w-36 z-50 animate-fade-in text-xs">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1">
            Subtitles
          </div>

          <button
            onClick={() => { onSelectTrack(-1); setIsOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition ${
              activeTrack === -1 ? 'bg-purple-600/20 text-purple-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span>Off</span>
            {activeTrack === -1 && <Check className="w-3.5 h-3.5 text-purple-400" />}
          </button>

          {tracks.map((track, idx) => (
            <button
              key={idx}
              onClick={() => { onSelectTrack(idx); setIsOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition ${
                activeTrack === idx ? 'bg-purple-600/20 text-purple-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span className="truncate">{track.name || track.lang || `Track ${idx + 1}`}</span>
              {activeTrack === idx && <Check className="w-3.5 h-3.5 text-purple-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
