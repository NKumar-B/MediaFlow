import React from 'react';
import { Play, Pause, Trash2, Compass, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function MediaGrid({ 
  filteredMedia, 
  role, 
  handleDelete, 
  togglePlayback, 
  currentlyPlaying, 
  isPlaying 
}) {

  const handleDownload = async (e, item) => {
    e.stopPropagation();
    try {
      toast.info(`Preparing download for "${item.title}"...`);
      
      const link = document.createElement('a');
      link.href = item.url;
      link.download = `${item.title.replace(/[^a-z0-9]/gi, '_')}.${item.type === 'music' ? 'mp3' : 'mp4'}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Download started for "${item.title}"`);
    } catch (err) {
      toast.error(`Unable to download "${item.title}".`);
    }
  };

  if (filteredMedia.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-slate-800/80 rounded-3xl bg-slate-950/10">
        <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mb-4">
          <Compass className="w-8 h-8" />
        </div>
        <p className="text-slate-300 font-medium text-base">No media found matching these parameters</p>
        <p className="text-slate-500 text-xs mt-1">Try resetting your filter categories or typing a different search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {filteredMedia.map((item) => (
        <div 
          key={item.id} 
          onClick={() => togglePlayback(item)}
          className="group relative bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-700/80 hover:bg-slate-900/50 hover:shadow-2xl hover:shadow-purple-500/5 backdrop-blur-xs flex flex-col justify-between cursor-pointer">
          
          {/* Cover Header */}
          <div className="relative aspect-square md:aspect-video w-full overflow-hidden bg-slate-950">
            <img 
              src={item.thumbnail} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-70 transition-all duration-300"></div>

            {/* PLAY BUTTON ALWAYS VISIBLE ON MOBILE AND DESKTOP */}
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlayback(item); }} 
              className="absolute bottom-3 right-3 p-3.5 rounded-full bg-purple-600 text-white hover:bg-purple-500 transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg shadow-purple-600/40 z-20"
              title={currentlyPlaying?.id === item.id && isPlaying ? "Pause" : "Play"}
            >
              {currentlyPlaying?.id === item.id && isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white" />
              )}
            </button>

            {/* Media Dynamic Badge */}
            <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider text-slate-300 uppercase">
              {item.type}
            </div>
          </div>

          {/* Details Body */}
          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-sm md:text-base text-slate-100 tracking-tight leading-snug line-clamp-1 group-hover:text-purple-300 transition duration-300">
                  {item.title}
                </h3>
                {role === 'admin' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} 
                    className="p-1 text-slate-500 hover:text-red-400 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.artist}</p>
            </div>

            <div className="flex items-center justify-between mt-3.5 border-t border-slate-800/60 pt-3">
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-slate-800/90 bg-slate-950/50 text-slate-400 tracking-wider">
                {item.category.toUpperCase()}
              </span>

              <button
                onClick={(e) => handleDownload(e, item)}
                title={`Download ${item.type}`}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950/60 hover:bg-purple-600/20 border border-slate-800 hover:border-purple-500/40 rounded-xl text-slate-300 hover:text-purple-300 text-xs font-semibold transition cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}