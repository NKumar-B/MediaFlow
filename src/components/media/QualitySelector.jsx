import React, { useState, useRef, useEffect } from 'react';
import { Settings, Check } from 'lucide-react';

export default function QualitySelector({ levels = [], currentLevel = -1, onSelectLevel }) {
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

  const getLevelLabel = (index) => {
    if (index === -1) return 'Auto';
    const lvl = levels[index];
    if (!lvl) return 'Auto';
    if (lvl.height) return `${lvl.height}p`;
    if (lvl.bitrate) return `${Math.round(lvl.bitrate / 1000)}k`;
    return `Quality ${index + 1}`;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 rounded-full text-slate-300 hover:text-purple-400 transition active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
        title="Quality Settings"
      >
        <Settings className="w-4 h-4 text-purple-400" />
        <span className="hidden sm:inline-block text-[11px] font-mono text-slate-300">
          {getLevelLabel(currentLevel)}
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-slate-950/95 border border-slate-800/90 rounded-2xl p-2 shadow-2xl backdrop-blur-xl w-36 z-50 animate-fade-in text-xs">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1">
            Video Quality
          </div>
          
          <button
            onClick={() => { onSelectLevel(-1); setIsOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition ${
              currentLevel === -1 ? 'bg-purple-600/20 text-purple-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span>Auto</span>
            {currentLevel === -1 && <Check className="w-3.5 h-3.5 text-purple-400" />}
          </button>

          {levels.map((lvl, index) => {
            const label = lvl.height ? `${lvl.height}p` : `Level ${index + 1}`;
            const isSelected = currentLevel === index;
            return (
              <button
                key={index}
                onClick={() => { onSelectLevel(index); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition ${
                  isSelected ? 'bg-purple-600/20 text-purple-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>{label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
