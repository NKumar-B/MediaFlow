import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { X, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import PlayerControls from './PlayerControls';
import { resolveMediaStreamUrl, saveWatchHistoryPosition, getWatchHistoryPosition } from '../../services/mediaService';

export default function VideoPlayer({
  currentlyPlaying,
  isPlaying,
  setIsPlaying,
  setCurrentlyPlaying,
  playNext,
  playPrev,
  userId
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const watchIntervalRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // HLS Adaptive Bitrate Levels (e.g. 720p, 480p)
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  
  // Text Subtitle Tracks
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [activeSubtitleTrack, setActiveSubtitleTrack] = useState(-1);

  const activeStreamUrl = resolveMediaStreamUrl(currentlyPlaying);

  // Initialize HLS / Native Playback
  useEffect(() => {
    if (!videoRef.current || !currentlyPlaying || currentlyPlaying.type !== 'movie') return;

    setHasError(false);
    setErrorMessage('');
    setIsBuffering(true);
    setCurrentTime(0);
    setDuration(0);

    const videoEl = videoRef.current;
    let hlsInstance = null;

    // Destroy existing HLS instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsUrl = activeStreamUrl.includes('.m3u8');

    if (isHlsUrl && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hlsRef.current = hlsInstance;
      hlsInstance.loadSource(activeStreamUrl);
      hlsInstance.attachMedia(videoEl);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsBuffering(false);
        if (data.levels) {
          setLevels(data.levels);
        }
        
        // Restore last watch position
        if (userId && currentlyPlaying.id) {
          getWatchHistoryPosition(userId, currentlyPlaying.id).then((lastPos) => {
            if (lastPos > 0 && videoEl) {
              videoEl.currentTime = lastPos;
              setCurrentTime(lastPos);
              toast.info(`Resumed "${currentlyPlaying.title}" from ${Math.floor(lastPos / 60)}m ${Math.floor(lastPos % 60)}s`);
            }
          });
        }

        if (isPlaying) {
          videoEl.play().catch((e) => console.warn("Autoplay blocked:", e));
        }
      });

      hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentLevel(data.level);
      });

      hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        console.warn("HLS.js Event Error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("HLS Network Error, attempting recovery...");
              hlsInstance.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("HLS Media Error, attempting recovery...");
              hlsInstance.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable HLS error:", data);
              hlsInstance.destroy();
              hlsRef.current = null;
              setHasError(true);
              setErrorMessage("Unable to stream media format. Stream might be offline or blocked.");
              setIsPlaying(false);
              break;
          }
        }
      });
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl') || !isHlsUrl) {
      // Native Safari HLS or direct MP4 stream
      videoEl.src = activeStreamUrl;
      videoEl.addEventListener('loadedmetadata', () => {
        setIsBuffering(false);
        setDuration(videoEl.duration);
        if (userId && currentlyPlaying.id) {
          getWatchHistoryPosition(userId, currentlyPlaying.id).then((lastPos) => {
            if (lastPos > 0 && videoEl) {
              videoEl.currentTime = lastPos;
              setCurrentTime(lastPos);
            }
          });
        }
        if (isPlaying) {
          videoEl.play().catch(() => {});
        }
      });
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentlyPlaying?.id, activeStreamUrl]);

  // Sync Play / Pause state
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (isPlaying) {
      videoEl.play().catch(() => setIsPlaying(false));
    } else {
      videoEl.pause();
    }
  }, [isPlaying]);

  // Sync Mute and Volume
  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.muted = isMuted;
      videoEl.volume = volume;
    }
  }, [isMuted, volume]);

  // Throttled Watch History Synchronization (every 12 seconds)
  useEffect(() => {
    if (!userId || !currentlyPlaying || !isPlaying) {
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
      return;
    }

    watchIntervalRef.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        const cur = videoRef.current.currentTime;
        const dur = videoRef.current.duration;
        saveWatchHistoryPosition(userId, currentlyPlaying.id, cur, dur);
      }
    }, 12000);

    return () => {
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
    };
  }, [userId, currentlyPlaying?.id, isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleScrub = (targetTime) => {
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleSelectLevel = (levelIndex) => {
    setCurrentLevel(levelIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      toast.info(`Quality set to ${levelIndex === -1 ? 'Auto' : levels[levelIndex]?.height + 'p'}`);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleDownload = () => {
    try {
      toast.info(`Downloading "${currentlyPlaying.title}"...`);
      const link = document.createElement('a');
      link.href = activeStreamUrl;
      link.download = `${currentlyPlaying.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      toast.error("Download unavailable for this stream.");
    }
  };

  if (!currentlyPlaying || currentlyPlaying.type !== 'movie') return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6 animate-fade-in select-none">
      <div className="w-full max-w-5xl flex flex-col gap-3">
        
        {/* Top Bar Header */}
        <div className="flex justify-between items-center px-2">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-wide line-clamp-1">{currentlyPlaying.title}</h3>
            <p className="text-xs text-slate-400 font-medium line-clamp-1">
              {currentlyPlaying.artist || "Director"} • {currentlyPlaying.category || "Movie"} Mode
            </p>
          </div>
          <button
            onClick={() => { setCurrentlyPlaying(null); setIsPlaying(false); }}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 text-slate-300 hover:text-red-400 transition"
            title="Close Movie Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas Container */}
        <div ref={containerRef} className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl flex items-center justify-center">
          
          <video
            ref={videoRef}
            onClick={() => setIsPlaying(!isPlaying)}
            onTimeUpdate={handleTimeUpdate}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onEnded={playNext}
            onError={() => {
              setHasError(true);
              setErrorMessage("Unable to play stream format. Check connection or R2 CDN setup.");
              setIsPlaying(false);
            }}
            className="w-full h-full object-contain cursor-pointer"
            preload="metadata"
            playsInline
          />

          {/* Buffering Indicator */}
          {isBuffering && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none z-20">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-10 h-10 text-purple-500 animate-spin" />
                <span className="text-xs font-bold text-slate-300 tracking-wider">Buffering HLS Stream...</span>
              </div>
            </div>
          )}

          {/* Error Message Overlay */}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center z-40">
              <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
              <h4 className="text-base font-bold text-slate-200">Streaming Error</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">{errorMessage}</p>
              <button
                onClick={() => { setHasError(false); setIsPlaying(true); }}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
              >
                Retry Playback
              </button>
            </div>
          )}

          {/* Video Player Controls Bar */}
          {!hasError && (
            <PlayerControls
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              currentTime={currentTime}
              duration={duration}
              onScrub={handleScrub}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              volume={volume}
              onVolumeChange={setVolume}
              onSkipBack={playPrev}
              onSkipForward={playNext}
              onToggleFullscreen={toggleFullscreen}
              onDownload={handleDownload}
              levels={levels}
              currentLevel={currentLevel}
              onSelectLevel={handleSelectLevel}
              subtitleTracks={subtitleTracks}
              activeSubtitleTrack={activeSubtitleTrack}
              onSelectSubtitleTrack={setActiveSubtitleTrack}
              isBuffering={isBuffering}
            />
          )}

        </div>

      </div>
    </div>
  );
}
