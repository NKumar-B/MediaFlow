import React from 'react';
import { Play, Pause, Trash2, Disc, Clapperboard, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentFeed({ 
  filteredMedia, 
  role, 
  handleDelete, 
  togglePlayback, 
  currentlyPlaying, 
  isPlaying 
}) {
  
  const songsList = filteredMedia.filter(item => item.type === 'music');
  const moviesList = filteredMedia.filter(item => item.type === 'movie');

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
      <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-950/10">
        <p className="text-slate-400 font-medium">No files matching your search filters</p>
      </div>
    );
  }

  const renderSection = (title, dataList, Icon) => {
    if (dataList.length === 0) return null;
    return (
      <div className="mb-10 animate-fade-in select-none">
        <div className="flex items-center space-x-2 mb-4">
          <Icon className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-slate-200 tracking-wider">{title}</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dataList.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-700/80 hover:bg-slate-900/50 backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent opacity-60 group-hover:opacity-80 transition-all duration-300"></div>

                <button 
                  onClick={() => togglePlayback(item)} 
                  className="absolute bottom-3.5 right-3.5 p-3.5 rounded-full bg-purple-500/90 text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-purple-600 hover:scale-110 backdrop-blur-md shadow-xl shadow-purple-600/30"
                >
                  {currentlyPlaying?.id === item.id && isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                </button>

                <div className="absolute top-3 left-3 bg-slate-950/70 border border-slate-800/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider text-slate-300 uppercase">
                  {item.type}
                </div>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-base text-slate-100 tracking-tight leading-snug line-clamp-1 group-hover:text-purple-300 transition duration-300">
                      {item.title}
                    </h3>
                    {role === 'admin' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} 
                        className="p-1 text-slate-500 hover:text-red-400 transition"
                        title="Delete Content"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-medium">{item.artist}</p>
                </div>

                <div className="flex items-center justify-between mt-3.5 border-t border-slate-800/60 pt-3">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-slate-800 bg-slate-950/50 text-slate-400 tracking-wider">
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
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {renderSection("Featured Music Tracks", songsList, Disc)}
      {renderSection("Premium Movies & Shorts", moviesList, Clapperboard)}
    </div>
  );
}