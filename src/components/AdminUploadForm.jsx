// import React from 'react';
// import { Upload, Plus } from 'lucide-react';

// export default function AdminUploadForm({ 
//   newMedia, 
//   setNewMedia, 
//   categories, 
//   handleUpload 
// }) {
//   return (
//     <section className="bg-gradient-to-r from-slate-900/40 to-slate-800/20 border border-slate-800/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 animate-fade-in">
//       <h2 className="text-lg font-bold tracking-tight text-white mb-4 flex items-center space-x-2">
//         <Upload className="w-5 h-5 text-purple-400" />
//         <span>Admin Studio - Add Premium Media</span>
//       </h2>
      
//       <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <input 
//           type="text" 
//           placeholder="Media Title"
//           value={newMedia.title}
//           onChange={(e) => setNewMedia({...newMedia, title: e.target.value})}
//           className="bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200 placeholder-slate-600"
//           required
//         />
//         <input 
//           type="text" 
//           placeholder="Artist/Director Name"
//           value={newMedia.artist}
//           onChange={(e) => setNewMedia({...newMedia, artist: e.target.value})}
//           className="bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200 placeholder-slate-600"
//           required
//         />
//         <div className="grid grid-cols-2 gap-2">
//           <select 
//             value={newMedia.type}
//             onChange={(e) => setNewMedia({...newMedia, type: e.target.value})}
//             className="bg-slate-950/60 border border-slate-800/60 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-300">
//             <option value="music">Music</option>
//             <option value="movie">Movie</option>
//           </select>
//           <select 
//             value={newMedia.category}
//             onChange={(e) => setNewMedia({...newMedia, category: e.target.value})}
//             className="bg-slate-950/60 border border-slate-800/60 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-300">
//             {categories.filter(c => c !== 'All').map(c => (
//               <option key={c} value={c}>{c}</option>
//             ))}
//           </select>
//         </div>
//         <input 
//           type="text" 
//           placeholder="Image / Thumbnail URL"
//           value={newMedia.thumbnail}
//           onChange={(e) => setNewMedia({...newMedia, thumbnail: e.target.value})}
//           className="bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200 placeholder-slate-600 md:col-span-2"
//         />
//         <button 
//           type="submit" 
//           className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-purple-600/20 text-sm flex items-center justify-center space-x-2">
//           <Plus className="w-5 h-5" /> <span>Publish Now</span>
//         </button>
//       </form>
//     </section>
//   );
// }

// import React from 'react';
// import { Upload, Plus } from 'lucide-react';

// export default function AdminUploadForm({ 
//   newMedia, 
//   setNewMedia, 
//   categories, 
//   handleUpload 
// }) {
//   return (
//     <section className="bg-gradient-to-r from-slate-900/40 to-slate-800/20 border border-slate-800/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 mb-8 animate-fade-in select-none">
//       <h2 className="text-lg font-bold tracking-wider text-white mb-4 flex items-center space-x-2">
//         <Upload className="w-5 h-5 text-purple-400" />
//         <span>Admin Studio - Add Premium Content</span>
//       </h2>
//       <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <input 
//           type="text" 
//           placeholder="File Title"
//           value={newMedia.title}
//           onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
//           className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
//           required
//         />
//         <input 
//           type="text" 
//           placeholder="Artist / Director Name"
//           value={newMedia.artist}
//           onChange={(e) => setNewMedia({ ...newMedia, artist: e.target.value })}
//           className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
//           required
//         />
//         <div className="grid grid-cols-2 gap-2">
//           <select 
//             value={newMedia.type}
//             onChange={(e) => setNewMedia({ ...newMedia, type: e.target.value })}
//             className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-3.5 text-sm text-slate-300 focus:outline-none focus:border-purple-500">
//             <option value="music">Music</option>
//             <option value="movie">Movie</option>
//           </select>
//           <select 
//             value={newMedia.category}
//             onChange={(e) => setNewMedia({ ...newMedia, category: e.target.value })}
//             className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-3.5 text-sm text-slate-300 focus:outline-none focus:border-purple-500">
//             {categories.filter(c => c !== 'All').map(c => (
//               <option key={c} value={c}>{c}</option>
//             ))}
//           </select>
//         </div>
//         <input 
//           type="text" 
//           placeholder="Direct Media Path (Ex: src/assets/music/song.mp3)"
//           value={newMedia.url}
//           onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
//           className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
//         />
//         <input 
//           type="text" 
//           placeholder="Thumbnail Image URL"
//           value={newMedia.thumbnail}
//           onChange={(e) => setNewMedia({ ...newMedia, thumbnail: e.target.value })}
//           className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
//         />
//         <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition text-sm flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/10">
//           <Plus className="w-5 h-5" /> <span>Add To System</span>
//         </button>
//       </form>
//     </section>
//   );
// }


import React, { useRef } from 'react';
import { Upload, Plus, FileAudio, FileVideo } from 'lucide-react';

export default function AdminUploadForm({ 
  newMedia, 
  setNewMedia, 
  categories, 
  handleUpload 
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Creates a valid temporary URL for direct testing
    const fileObjectURL = URL.createObjectURL(file);
    const extractedTitle = newMedia.title || file.name.replace(/\.[^/.]+$/, "");

    setNewMedia({
      ...newMedia,
      title: extractedTitle,
      url: fileObjectURL,
      fileName: file.name
    });
  };

  return (
    <section className="bg-gradient-to-r from-slate-900/40 to-slate-800/20 border border-slate-800/60 backdrop-blur-sm rounded-3xl p-4 sm:p-6 md:p-8 mb-8 animate-fade-in select-none">
      <h2 className="text-lg font-bold tracking-wider text-white mb-4 flex items-center space-x-2">
        <Upload className="w-5 h-5 text-purple-400" />
        <span>Admin Studio - Add Premium Content</span>
      </h2>
      
      <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input 
          type="text" 
          placeholder="File Title"
          value={newMedia.title}
          onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
          className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
          required
        />
        <input 
          type="text" 
          placeholder="Artist / Director Name"
          value={newMedia.artist}
          onChange={(e) => setNewMedia({ ...newMedia, artist: e.target.value })}
          className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <select 
            value={newMedia.type}
            onChange={(e) => setNewMedia({ ...newMedia, type: e.target.value, url: '', fileName: '' })}
            className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-3 text-sm text-slate-300 focus:outline-none focus:border-purple-500">
            <option value="music">Music</option>
            <option value="movie">Movie</option>
          </select>
          <select 
            value={newMedia.category}
            onChange={(e) => setNewMedia({ ...newMedia, category: e.target.value })}
            className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-3 text-sm text-slate-300 focus:outline-none focus:border-purple-500">
            {categories.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Option A: Direct relative path input (Safest across reboots) */}
        <input 
          type="text" 
          placeholder={`Direct asset path (e.g., /src/assets/${newMedia.type === 'music' ? 'music/song.mp3' : 'movies/film.mp4'})`}
          value={newMedia.url}
          onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value, fileName: e.target.value.split('/').pop() })}
          className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200 md:col-span-1"
        />

        {/* Option B: Local File browser picker */}
        <div className="relative md:col-span-1">
          <input 
            type="file" 
            ref={fileInputRef}
            accept={newMedia.type === 'music' ? 'audio/mp3,audio/wav,audio/*' : 'video/mp4,video/mkv,video/*'}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="w-full bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl px-4 py-3.5 text-sm text-left text-slate-400 focus:outline-none hover:text-slate-300 transition flex items-center justify-between"
          >
            <span className="truncate">
              {newMedia.fileName ? newMedia.fileName : `Browse for ${newMedia.type}...`}
            </span>
            {newMedia.type === 'music' ? <FileAudio className="w-4 h-4 flex-shrink-0" /> : <FileVideo className="w-4 h-4 flex-shrink-0" />}
          </button>
        </div>

        <input 
          type="text" 
          placeholder="Thumbnail Image URL"
          value={newMedia.thumbnail}
          onChange={(e) => setNewMedia({ ...newMedia, thumbnail: e.target.value })}
          className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200"
        />

        <button type="submit" className="w-full md:col-span-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition text-sm flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/10">
          <Plus className="w-5 h-5" /> <span>Add To System</span>
        </button>
      </form>
    </section>
  );
}