import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Download, RefreshCw } from 'lucide-react';
import QualitySelector from './QualitySelector';
import SubtitleSelector from './SubtitleSelector';

export default function PlayerControls({
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onScrub,
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
  onSkipBack,
  onSkipForward,
  onToggleFullscreen,
  onDownload,
  levels = [],
  currentLevel = -1,
  onSelectLevel,
  subtitleTracks = [],
  activeSubtitleTrack = -1,
  onSelectSubtitleTrack,
  isBuffering = false
}) {
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-6 gap-3 z-30 pointer-events-auto select-none">
      
      {/* Scrub bar & time displays */}
      <div className="flex items-center w-full gap-3 text-xs text-slate-200 font-mono">
        <span>{formatTime(currentTime)}</span>
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={(e) => onScrub(Number(e.target.value))}
            className="w-full h-1 bg-slate-800/90 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition"
          />
          {isBuffering && (
            <div className="absolute right-0 p-1">
              <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            </div>
          )}
        </div>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Primary control triggers */}
      <div className="flex items-center justify-between">
        
        {/* Left: Prev, Play/Pause, Next */}
        <div className="flex items-center gap-3">
          {onSkipBack && (
            <button
              onClick={onSkipBack}
              className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 rounded-full text-slate-200 transition active:scale-95"
              title="Previous"
            >
              <SkipBack className="w-4 h-4 fill-slate-200" />
            </button>
          )}

          <button
            onClick={onTogglePlay}
            className="p-3 bg-white text-black hover:bg-purple-300 rounded-full transition hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black" />}
          </button>

          {onSkipForward && (
            <button
              onClick={onSkipForward}
              className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 rounded-full text-slate-200 transition active:scale-95"
              title="Next"
            >
              <SkipForward className="w-4 h-4 fill-slate-200" />
            </button>
          )}
        </div>

        {/* Right: Quality, Subtitles, Download, Mute, Fullscreen */}
        <div className="flex items-center gap-2.5">
          {levels.length > 0 && onSelectLevel && (
            <QualitySelector
              levels={levels}
              currentLevel={currentLevel}
              onSelectLevel={onSelectLevel}
            />
          )}

          {subtitleTracks.length > 0 && onSelectSubtitleTrack && (
            <SubtitleSelector
              tracks={subtitleTracks}
              activeTrack={activeSubtitleTrack}
              onSelectTrack={onSelectSubtitleTrack}
            />
          )}

          {onDownload && (
            <button
              onClick={onDownload}
              title="Download Media"
              className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 rounded-full text-slate-300 hover:text-purple-400 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/50 rounded-full p-1 px-2">
            <button onClick={onToggleMute} className="text-slate-300 hover:text-purple-400 transition">
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
            </button>
            {onVolumeChange && (
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : (volume ?? 1)}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hidden sm:inline-block"
              />
            )}
          </div>

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 rounded-full text-slate-300 transition active:scale-95"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
