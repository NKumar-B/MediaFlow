// import React from 'react';
// import { Play, Pause, X } from 'lucide-react';

// export default function MediaControlPlayer({ 
//   currentlyPlaying, 
//   isPlaying, 
//   setIsPlaying, 
//   setCurrentlyPlaying 
// }) {
//   if (!currentlyPlaying) return null;

//   return (
//     <footer className="sticky bottom-0 z-50 backdrop-blur-xl bg-slate-950/80 border-t border-slate-800/80 p-3.5 md:p-4 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto w-full rounded-t-3xl shadow-2xl shadow-purple-500/5">
//       <div className="flex items-center space-x-3.5">
//         <img 
//           src={currentlyPlaying.thumbnail} 
//           alt={currentlyPlaying.title} 
//           className="w-12 h-12 rounded-xl object-cover border border-slate-700/50 shadow-md shadow-black"
//         />
//         <div>
//           <h4 className="text-sm font-bold tracking-wide text-slate-100 line-clamp-1">{currentlyPlaying.title}</h4>
//           <p className="text-xs text-slate-400 font-medium line-clamp-1">{currentlyPlaying.artist}</p>
//         </div>
//       </div>

//       <div className="flex items-center justify-between md:justify-end gap-6">
//         <div className="flex items-center space-x-3">
//           <button 
//             onClick={() => setIsPlaying(!isPlaying)} 
//             className="p-3 bg-white text-black hover:bg-purple-300 hover:scale-105 rounded-full transition shadow-md shadow-white/5">
//             {isPlaying ? (
//               <Pause className="w-5 h-5 fill-black text-black" />
//             ) : (
//               <Play className="w-5 h-5 fill-black text-black" />
//             )}
//           </button>
//           <button 
//             onClick={() => { setCurrentlyPlaying(null); setIsPlaying(false); }} 
//             className="p-2.5 border border-slate-800 rounded-full hover:bg-slate-900 text-slate-400 hover:text-red-400 transition duration-300">
//             <X className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     </footer>
//   );
// }


// import React from 'react';
// import { Play, Pause, X, SkipBack, SkipForward, Shuffle, Volume2 } from 'lucide-react';

// export default function MediaControlPlayer({ 
//   currentlyPlaying, 
//   isPlaying, 
//   setIsPlaying, 
//   setCurrentlyPlaying, 
//   playNext, 
//   playPrev, 
//   shuffleToggle, 
//   isShuffle 
// }) {
//   if (!currentlyPlaying) return null;

//   return (
//     <footer className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-t border-slate-800/80 p-3.5 flex items-center justify-between gap-4 max-w-full w-full select-none shadow-2xl">
//       {/* Target Content Header Thumbnail */}
//       <div className="flex items-center space-x-3.5 max-w-xs md:max-w-md">
//         <img 
//           src={currentlyPlaying.thumbnail} 
//           alt={currentlyPlaying.title} 
//           className="w-12 h-12 rounded-xl object-cover border border-slate-700/50 shadow-md flex-shrink-0"
//         />
//         <div className="overflow-hidden">
//           <h4 className="text-sm font-bold tracking-wide text-slate-100 line-clamp-1">{currentlyPlaying.title}</h4>
//           <p className="text-xs text-slate-400 font-medium line-clamp-1">{currentlyPlaying.artist} • <span className="text-purple-400">{currentlyPlaying.type.toUpperCase()}</span></p>
//         </div>
//       </div>

//       {/* Advanced Control System */}
//       <div className="flex items-center justify-center gap-3">
//         {/* Shuffle Control */}
//         <button 
//           onClick={shuffleToggle} 
//           title="Shuffle Media"
//           className={`p-2 rounded-full border transition hidden sm:inline-block ${
//             isShuffle ? 'bg-purple-600/20 text-purple-400 border-purple-500/40' : 'bg-transparent border-transparent hover:bg-slate-900 text-slate-500 hover:text-slate-200'
//           }`}
//         >
//           <Shuffle className="w-4 h-4" />
//         </button>

//         {/* Previous Playback Control */}
//         <button 
//           onClick={playPrev} 
//           title="Previous Item"
//           className="p-2.5 bg-slate-900 border border-slate-800 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-md"
//         >
//           <SkipBack className="w-5 h-5 fill-slate-300" />
//         </button>

//         {/* Master Active Context Play Trigger */}
//         <button 
//           onClick={() => setIsPlaying(!isPlaying)} 
//           className="p-3 bg-white text-black hover:bg-purple-300 hover:scale-105 rounded-full transition shadow-lg flex-shrink-0"
//         >
//           {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black" />}
//         </button>

//         {/* Forward Media Skip Trigger */}
//         <button 
//           onClick={playNext} 
//           title="Next Item"
//           className="p-2.5 bg-slate-900 border border-slate-800 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-md"
//         >
//           <SkipForward className="w-5 h-5 fill-slate-300" />
//         </button>
//       </div>

//       {/* Extra Action Toggles */}
//       <div className="flex items-center space-x-3">
//         <Volume2 className="w-4 h-4 text-slate-400 hidden md:block" />
//         <button 
//           onClick={() => { setCurrentlyPlaying(null); setIsPlaying(false); }} 
//           className="p-2.5 border border-slate-800 rounded-full hover:bg-slate-900 text-slate-400 hover:text-red-400 transition"
//         >
//           <X className="w-4 h-4" />
//         </button>
//       </div>
//     </footer>
//   );
// }


// import React, { useEffect, useRef, useState } from 'react';
// import { Play, Pause, X, SkipBack, SkipForward, Shuffle, Volume2 } from 'lucide-react';

// export default function MediaControlPlayer({ 
//   currentlyPlaying, 
//   isPlaying, 
//   setIsPlaying, 
//   setCurrentlyPlaying, 
//   playNext, 
//   playPrev, 
//   shuffleToggle, 
//   isShuffle 
// }) {
//   const audioRef = useRef(null);
//   const videoRef = useRef(null);

//   // Status Bar States
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);

//   // Sync Audio Playback cleanly
//   useEffect(() => {
//     if (audioRef.current && currentlyPlaying?.type === 'music') {
//       if (isPlaying) {
//         // We use a silent promise check to bypass browser auto-play restrictions
//         const playPromise = audioRef.current.play();
//         if (playPromise !== undefined) {
//           playPromise.catch((error) => {
//             console.log("Audio playback was blocked or interrupted:", error);
//             setIsPlaying(false);
//           });
//         }
//       } else {
//         audioRef.current.pause();
//       }
//     }
//   }, [isPlaying, currentlyPlaying, setIsPlaying]);

//   // Handle Fullscreen for Movies
//   useEffect(() => {
//     if (currentlyPlaying?.type === 'movie' && videoRef.current) {
//       if (isPlaying) {
//         videoRef.current.play().catch(() => setIsPlaying(false));
//         if (videoRef.current.requestFullscreen) {
//           videoRef.current.requestFullscreen();
//         } else if (videoRef.current.webkitRequestFullscreen) {
//           videoRef.current.webkitRequestFullscreen();
//         }
//       } else {
//         videoRef.current.pause();
//       }
//     }
//   }, [isPlaying, currentlyPlaying, setIsPlaying]);

//   // Update real-time track progress
//   const handleTimeUpdate = () => {
//     if (audioRef.current) {
//       setCurrentTime(audioRef.current.currentTime);
//     }
//   };

//   // Set the duration once the audio metadata is fully loaded
//   const handleLoadedMetadata = () => {
//     if (audioRef.current) {
//       setDuration(audioRef.current.duration);
//     }
//   };

//   // Scrub through the progress bar
//   const handleScrub = (e) => {
//     const scrubTime = Number(e.target.value);
//     if (audioRef.current) {
//       audioRef.current.currentTime = scrubTime;
//       setCurrentTime(scrubTime);
//     }
//   };

//   // Format time (e.g. seconds to 02:45)
//   const formatTime = (timeInSeconds) => {
//     if (isNaN(timeInSeconds)) return "0:00";
//     const minutes = Math.floor(timeInSeconds / 60);
//     const seconds = Math.floor(timeInSeconds % 60);
//     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//   };

//   if (!currentlyPlaying) return null;

//   return (
//     <>
//       {/* Real-time Web Native Audio Source */}
//       {currentlyPlaying.type === 'music' && (
//         <audio 
//           ref={audioRef} 
//           src={currentlyPlaying.url} 
//           onEnded={playNext}
//           onTimeUpdate={handleTimeUpdate}
//           onLoadedMetadata={handleLoadedMetadata}
//           className="hidden"
//           preload="auto"
//         />
//       )}

//       {/* Real-time Web Native Video Source */}
//       {currentlyPlaying.type === 'movie' && (
//         <video 
//           ref={videoRef}
//           src={currentlyPlaying.url}
//           onEnded={playNext}
//           className="hidden"
//           controls
//         />
//       )}

//       {/* Premium Dark Mode Dashboard Media Controller Overlay */}
//       <footer className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/85 border-t border-slate-800/80 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-full w-full select-none shadow-2xl">
        
//         {/* Left Side: Thumbnail metadata info */}
//         <div className="flex items-center space-x-3.5 max-w-xs md:max-w-md">
//           <img 
//             src={currentlyPlaying.thumbnail || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=100'} 
//             alt={currentlyPlaying.title} 
//             className="w-12 h-12 rounded-xl object-cover border border-slate-700/50 shadow-md flex-shrink-0"
//           />
//           <div className="overflow-hidden">
//             <h4 className="text-sm font-bold tracking-wide text-slate-100 line-clamp-1">{currentlyPlaying.title}</h4>
//             <p className="text-xs text-slate-400 font-medium line-clamp-1">{currentlyPlaying.artist} • <span className="text-purple-400">{currentlyPlaying.type.toUpperCase()}</span></p>
//           </div>
//         </div>

//         {/* Center: Real-time Duration Slider & Controls */}
//         <div className="flex flex-col items-center gap-2 flex-1 max-w-lg mx-auto w-full">
//           {/* Top Control Buttons */}
//           <div className="flex items-center justify-center gap-4">
//             <button 
//               onClick={shuffleToggle} 
//               className={`p-2 rounded-full border transition duration-300 ${
//                 isShuffle ? 'bg-purple-600/20 text-purple-400 border-purple-500/40' : 'bg-transparent border-transparent hover:bg-slate-900 text-slate-500 hover:text-slate-200'
//               }`}
//             >
//               <Shuffle className="w-4 h-4" />
//             </button>

//             <button 
//               onClick={playPrev} 
//               className="p-2.5 bg-slate-900 border border-slate-800 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-md"
//             >
//               <SkipBack className="w-4 h-4 fill-slate-300" />
//             </button>

//             <button 
//               onClick={() => setIsPlaying(!isPlaying)} 
//               className="p-3 bg-white text-black hover:bg-purple-300 hover:scale-105 rounded-full transition shadow-lg flex-shrink-0"
//             >
//               {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black" />}
//             </button>

//             <button 
//               onClick={playNext} 
//               className="p-2.5 bg-slate-900 border border-slate-800 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-md"
//             >
//               <SkipForward className="w-4 h-4 fill-slate-300" />
//             </button>
//           </div>

//           {/* Bottom Duration Status Slider Bar */}
//           {currentlyPlaying.type === 'music' && (
//             <div className="flex items-center w-full gap-3 text-[10px] text-slate-400 font-mono">
//               <span>{formatTime(currentTime)}</span>
//               <input 
//                 type="range" 
//                 min={0} 
//                 max={duration || 0} 
//                 value={currentTime} 
//                 onChange={handleScrub}
//                 className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 focus:outline-none transition"
//               />
//               <span>{formatTime(duration)}</span>
//             </div>
//           )}
//         </div>

//         {/* Right Side: Extra volume indicator and clear actions */}
//         <div className="flex items-center space-x-3 self-end md:self-auto">
//           <Volume2 className="w-4 h-4 text-slate-400 hidden md:block" />
//           <button 
//             onClick={() => { setCurrentlyPlaying(null); setIsPlaying(false); }} 
//             className="p-2.5 border border-slate-800 rounded-full hover:bg-slate-900 text-slate-400 hover:text-red-400 transition"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>
//       </footer>
//     </>
//   );
// }



import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, X, SkipBack, SkipForward, Shuffle, Volume2, VolumeX, Maximize, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function MediaControlPlayer({ 
  currentlyPlaying, 
  isPlaying, 
  setIsPlaying, 
  setCurrentlyPlaying, 
  playNext, 
  playPrev, 
  shuffleToggle, 
  isShuffle 
}) {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Reset progress slider whenever the file changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [currentlyPlaying?.id]);

  // Load new audio source whenever track ID or URL changes
  useEffect(() => {
    if (audioRef.current && currentlyPlaying?.type === 'music') {
      try {
        audioRef.current.load();
        if (isPlaying) {
          const promise = audioRef.current.play();
          if (promise !== undefined) {
            promise.catch((err) => {
              console.warn("Audio autoplay blocked by browser policy:", err);
            });
          }
        }
      } catch (err) {
        console.error("Audio load error:", err);
      }
    }
  }, [currentlyPlaying?.id, currentlyPlaying?.url]);

  // Load new video source whenever movie ID or URL changes
  useEffect(() => {
    if (videoRef.current && currentlyPlaying?.type === 'movie') {
      try {
        videoRef.current.load();
        if (isPlaying) {
          const promise = videoRef.current.play();
          if (promise !== undefined) {
            promise.catch((err) => {
              console.warn("Video autoplay blocked by browser policy:", err);
            });
          }
        }
      } catch (err) {
        console.error("Video load error:", err);
      }
    }
  }, [currentlyPlaying?.id, currentlyPlaying?.url]);

  // Sync play/pause state and volume mute toggles
  useEffect(() => {
    if (audioRef.current && currentlyPlaying?.type === 'music') {
      audioRef.current.muted = isMuted;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isMuted]);

  useEffect(() => {
    if (videoRef.current && currentlyPlaying?.type === 'movie') {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isMuted]);

  const handleTimeUpdate = (ref) => {
    if (ref.current) {
      setCurrentTime(ref.current.currentTime);
    }
  };

  const handleLoadedMetadata = (ref) => {
    if (ref.current) {
      setDuration(ref.current.duration);
    }
  };

  const handleAudioError = () => {
    console.error("Media error on URL:", currentlyPlaying?.url);
    toast.error(`Unable to play "${currentlyPlaying?.title}". The media source URL is invalid or blocked.`);
    setIsPlaying(false);
  };

  const handleScrub = (e, ref) => {
    const scrubTime = Number(e.target.value);
    if (ref.current) {
      ref.current.currentTime = scrubTime;
      setCurrentTime(scrubTime);
    }
  };

  const toggleFullScreen = () => {
    if (videoContainerRef.current) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      } else if (videoContainerRef.current.webkitRequestFullscreen) {
        videoContainerRef.current.webkitRequestFullscreen();
      }
    }
  };

  const handleDownloadMedia = (e) => {
    if (e) e.stopPropagation();
    if (!currentlyPlaying) return;
    try {
      toast.info(`Preparing download for "${currentlyPlaying.title}"...`);
      const link = document.createElement('a');
      link.href = currentlyPlaying.url;
      link.download = `${currentlyPlaying.title.replace(/[^a-z0-9]/gi, '_')}.${currentlyPlaying.type === 'music' ? 'mp3' : 'mp4'}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Started download for "${currentlyPlaying.title}"`);
    } catch (err) {
      toast.error(`Unable to download "${currentlyPlaying.title}".`);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentlyPlaying) return null;

  return (
    <>
      {/* Background Audio Player */}
      {currentlyPlaying.type === 'music' && (
        <audio 
          ref={audioRef} 
          src={currentlyPlaying.url || "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"} 
          onEnded={playNext}
          onError={handleAudioError}
          onTimeUpdate={() => handleTimeUpdate(audioRef)}
          onLoadedMetadata={() => handleLoadedMetadata(audioRef)}
          className="hidden"
          preload="auto"
        />
      )}

      {/* --- VIDEO PLAYER MODAL OVERLAY --- */}
      {currentlyPlaying.type === 'movie' && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in select-none">
          <div className="w-full max-w-5xl flex flex-col gap-4">
            
            <div className="flex justify-between items-center px-2">
              <div>
                <h3 className="text-lg font-black text-slate-100 tracking-wide">{currentlyPlaying.title}</h3>
                <p className="text-xs text-slate-400 font-medium">{currentlyPlaying.artist} • Movie Mode</p>
              </div>
              <button 
                onClick={() => { setCurrentlyPlaying(null); setIsPlaying(false); }} 
                className="p-3 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 text-slate-300 hover:text-red-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={videoContainerRef} className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl flex items-center justify-center">
              <video 
                ref={videoRef}
                src={currentlyPlaying.url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                onClick={() => setIsPlaying(!isPlaying)}
                onEnded={playNext}
                onTimeUpdate={() => handleTimeUpdate(videoRef)}
                onLoadedMetadata={() => handleLoadedMetadata(videoRef)}
                className="w-full h-full object-contain cursor-pointer"
                preload="auto"
                playsInline
              />

              {/* Control Overlays: ALWAYS VISIBLE ON MOBILE & DESKTOP */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4 md:p-6 gap-3 z-30">
                <div className="flex items-center w-full gap-3 text-xs text-slate-200 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <input 
                    type="range" 
                    min={0} 
                    max={duration || 0} 
                    value={currentTime} 
                    onChange={(e) => handleScrub(e, videoRef)}
                    className="w-full h-1 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-purple-500 transition"
                  />
                  <span>{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={playPrev} className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 rounded-full text-slate-200 transition active:scale-95">
                      <SkipBack className="w-5 h-5 fill-slate-200" />
                    </button>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-white text-black hover:bg-purple-300 rounded-full transition hover:scale-105 active:scale-95 shadow-lg shadow-white/10">
                      {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black" />}
                    </button>
                    <button onClick={playNext} className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 rounded-full text-slate-200 transition active:scale-95">
                      <SkipForward className="w-5 h-5 fill-slate-200" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={handleDownloadMedia} title="Download Movie" className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 rounded-full text-slate-300 hover:text-purple-400 transition active:scale-95">
                      <Download className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 rounded-full text-slate-300 transition active:scale-95">
                      {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-purple-400" />}
                    </button>
                    <button onClick={toggleFullScreen} className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 rounded-full text-slate-300 transition active:scale-95">
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- FIXED BOTTOM BAR FOR MUSIC --- */}
      {currentlyPlaying.type === 'music' && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/85 border-t border-slate-800/80 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-full w-full select-none shadow-2xl">
          
          <div className="flex items-center space-x-3.5 max-w-xs md:max-w-md">
            <img 
              src={currentlyPlaying.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'} 
              alt={currentlyPlaying.title} 
              className="w-12 h-12 rounded-xl object-cover border border-slate-700/50 shadow-md flex-shrink-0"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold tracking-wide text-slate-100 line-clamp-1">{currentlyPlaying.title}</h4>
              <p className="text-xs text-slate-400 font-medium line-clamp-1">{currentlyPlaying.artist} • <span className="text-purple-400">{currentlyPlaying.type.toUpperCase()}</span></p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 flex-1 max-w-lg mx-auto w-full">
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
                onChange={(e) => handleScrub(e, audioRef)}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none transition"
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end md:self-auto">
            <button 
              onClick={handleDownloadMedia}
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
      )}
    </>
  );
}