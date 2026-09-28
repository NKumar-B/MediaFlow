import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, X, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Download, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';
import { resolveMediaStreamUrl, saveWatchHistoryPosition } from '../../services/mediaService';

export default function AudioPlayer({
  currentlyPlaying,
  isPlaying,
  setIsPlaying,
  setCurrentlyPlaying,
  playNext,
  playPrev,
  shuffleToggle,
  isShuffle,
  userId
}) {
  const audioRef = useRef(null);
  const hlsRef = useRef(null);
  const watchIntervalRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const activeStreamUrl = resolveMediaStreamUrl(currentlyPlaying);

  // Initialize HLS Audio or Native Audio Element
  useEffect(() => {
    if (!audioRef.current || !currentlyPlaying || currentlyPlaying.type !== 'music') return;

    setCurrentTime(0);
    setDuration(0);

    const audioEl = audioRef.current;
    let hlsInstance = null;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsUrl = activeStreamUrl.includes('.m3u8');

    if (isHlsUrl && Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsRef.current = hlsInstance;
      hlsInstance.loadSource(activeStreamUrl);
      hlsInstance.attachMedia(audioEl);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying) {
          audioEl.play().catch(() => {});
        }
      });

      hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn("HLS Audio Fatal Error, attempting recovery:", data);
          hlsInstance.recoverMediaError();
        }
      });
    } else {
      audioEl.src = activeStreamUrl;
      audioEl.load();
      if (isPlaying) {
        audioEl.play().catch(() => {});
      }
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentlyPlaying?.id, activeStreamUrl]);

  // Sync play/pause state
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.play().catch(() => setIsPlaying(false));
    } else {
      audioEl.pause();
    }
  }, [isPlaying]);

  // Sync mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Save music watch position periodically
  useEffect(() => {
    if (!userId || !currentlyPlaying || !isPlaying) return;
    watchIntervalRef.current = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        saveWatchHistoryPosition(userId, currentlyPlaying.id, audioRef.current.currentTime, audioRef.current.duration);
      }
    }, 15000);

    return () => {
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
    };
  }, [userId, currentlyPlaying?.id, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleEnded = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (playNext) {
      playNext();
    }
  };

  const handleScrub = (e) => {
    const target = Number(e.target.value);
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const handleDownload = (e) => {
    if (e) e.stopPropagation();
    try {
      toast.info(`Preparing song download...`);
      const link = document.createElement('a');
      link.href = activeStreamUrl;
      link.download = `${currentlyPlaying.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast.error("Download unavailable.");
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentlyPlaying || currentlyPlaying.type !== 'music') return null;

  return (
    <>
      {/* Hidden Audio Native Source */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
        className="hidden"
      />

      {/* Expanded Music Player Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-fade-in select-none">
          <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl relative">
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full transition"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            <img
              src={currentlyPlaying.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500'}
              alt={currentlyPlaying.title}
              className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl object-cover shadow-2xl border border-slate-700/50 mb-6"
            />

            <h3 className="text-xl font-black text-slate-100 tracking-wide line-clamp-1">{currentlyPlaying.title}</h3>
            <p className="text-sm font-medium text-slate-400 mt-1 line-clamp-1">{currentlyPlaying.artist} • {currentlyPlaying.category || "Music"}</p>

            {/* Scrub slider */}
            <div className="w-full mt-6 flex flex-col gap-1">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleScrub}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Expanded Controls */}
            <div className="flex items-center justify-center gap-5 mt-6">
              <button
                onClick={shuffleToggle}
                className={`p-2.5 rounded-full border transition ${
                  isShuffle ? 'bg-purple-600/20 text-purple-400 border-purple-500/40' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-200'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button onClick={playPrev} className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-200 hover:bg-slate-800 transition">
                <SkipBack className="w-5 h-5 fill-slate-200" />
              </button>

              <button onClick={() => setIsPlaying(!isPlaying)} className="p-4 bg-white text-black hover:bg-purple-300 rounded-full transition hover:scale-105 active:scale-95 shadow-xl">
                {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black" />}
              </button>

              <button onClick={playNext} className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-200 hover:bg-slate-800 transition">
                <SkipForward className="w-5 h-5 fill-slate-200" />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2.5 rounded-full border transition ${
                  isRepeat ? 'bg-purple-600/20 text-purple-400 border-purple-500/40' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-200'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Docked Sticky Bottom Mini Player */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/85 border-t border-slate-800/80 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-full w-full select-none shadow-2xl">
        
        <div className="flex items-center space-x-3.5 max-w-xs md:max-w-md">
          <img
            src={currentlyPlaying.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
            alt={currentlyPlaying.title}
            className="w-12 h-12 rounded-xl object-cover border border-slate-700/50 shadow-md flex-shrink-0 cursor-pointer"
            onClick={() => setIsExpanded(true)}
          />
          <div className="overflow-hidden cursor-pointer" onClick={() => setIsExpanded(true)}>
            <h4 className="text-sm font-bold tracking-wide text-slate-100 line-clamp-1">{currentlyPlaying.title}</h4>
            <p className="text-xs text-slate-400 font-medium line-clamp-1">{currentlyPlaying.artist} • <span className="text-purple-400">MUSIC</span></p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-lg mx-auto w-full">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={shuffleToggle}
              className={`p-2 rounded-full border transition duration-300 ${
                isShuffle ? 'bg-purple-600/20 text-purple-400 border-purple-500/40' : 'bg-transparent border-transparent hover:bg-slate-900 text-slate-500 hover:text-slate-200'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button onClick={playPrev} className="p-2.5 bg-slate-900 border border-slate-800 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-md">
              <SkipBack className="w-4 h-4 fill-slate-300" />
            </button>

            <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-white text-black hover:bg-purple-300 hover:scale-105 rounded-full transition shadow-lg flex-shrink-0">
              {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black" />}
            </button>

            <button onClick={playNext} className="p-2.5 bg-slate-900 border border-slate-800 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-md">
              <SkipForward className="w-4 h-4 fill-slate-300" />
            </button>
          </div>

          <div className="flex items-center w-full gap-3 text-[10px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleScrub}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none transition"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end md:self-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title="Expand Full Player"
            className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-full text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            title="Download Song"
            className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-full text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-full text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => { setCurrentlyPlaying(null); setIsPlaying(false); }}
            className="p-2.5 border border-slate-800 rounded-full hover:bg-slate-900 text-slate-400 hover:text-red-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </footer>
    </>
  );
}
