import React, { useRef, useState } from 'react';
import { Upload, Plus, FileAudio, FileVideo, Eye, ShieldAlert, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUploadForm({ 
  newMedia, 
  setNewMedia, 
  categories, 
  handleUpload,
  role,
  setViewMode
}) {
  const fileInputRef = useRef(null);
  const [showCorsGuide, setShowCorsGuide] = useState(false);
  const [copiedCors, setCopiedCors] = useState(false);

  const handleToggleView = () => {
    if (setViewMode) {
      setViewMode('user');
      toast.success('Switched to User Mode view. Switch back via the Header anytime.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileObjectURL = URL.createObjectURL(file);
    const extractedTitle = newMedia.title || file.name.replace(/\.[^/.]+$/, "");

    setNewMedia({
      ...newMedia,
      title: extractedTitle,
      url: fileObjectURL,
      fileName: file.name,
      fileObj: file
    });

    toast.success(`Loaded "${file.name}"! Ready for publication.`);
  };

  const corsJson = JSON.stringify([
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD", "DELETE", "OPTIONS"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ], null, 2);

  const handleCopyCors = () => {
    navigator.clipboard.writeText(corsJson);
    setCopiedCors(true);
    toast.success("Cloudflare R2 CORS JSON copied to clipboard!");
    setTimeout(() => setCopiedCors(false), 3000);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!newMedia.title.trim()) {
      return toast.error('FAILURE: A content title is required.');
    }
    if (!newMedia.artist.trim()) {
      return toast.error('FAILURE: Artist or Director Name is required.');
    }
    if (!newMedia.url.trim() && !newMedia.fileObj) {
      return toast.error('FAILURE: Please select a file or specify a valid media source path/URL.');
    }

    try {
      await handleUpload(e);
      setNewMedia({ title: '', artist: '', category: 'Action', type: 'music', url: '', thumbnail: '', fileName: '', fileObj: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      toast.error(`FAILURE: Unable to add media item. ${err.message || ''}`);
    }
  };

  return (
    <section className="bg-gradient-to-r from-slate-900/40 to-slate-800/20 border border-slate-800/60 backdrop-blur-sm rounded-3xl p-4 sm:p-6 md:p-8 mb-8 animate-fade-in select-none">
      
      {/* Dynamic Administrative Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-800/60 pb-4">
        <div className="flex items-center space-x-2">
          <Upload className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold tracking-wider text-white">
            Admin Studio - Add Premium Content
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCorsGuide(!showCorsGuide)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 font-bold text-xs transition cursor-pointer"
            title="Cloudflare R2 CORS Setup Instructions"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>R2 CORS Setup</span>
          </button>

          <button
            type="button"
            onClick={handleToggleView}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl text-purple-400 hover:text-purple-300 font-bold text-xs transition duration-200 cursor-pointer select-none"
          >
            <Eye className="w-4 h-4" />
            <span>Switch to User View</span>
          </button>
        </div>
      </div>

      {/* Cloudflare R2 CORS Helper Banner */}
      {showCorsGuide && (
        <div className="mb-6 bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 sm:p-5 text-xs animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Cloudflare R2 CORS Configuration Instructions
            </h4>
            <button
              onClick={handleCopyCors}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 rounded-lg text-purple-300 font-semibold text-[11px] transition cursor-pointer"
            >
              {copiedCors ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCors ? "Copied JSON!" : "Copy CORS JSON"}</span>
            </button>
          </div>
          
          <p className="text-slate-300 leading-relaxed mb-3">
            To allow your browser to stream & upload directly to Cloudflare R2 without CORS blocks:
          </p>

          <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono text-[11px] mb-3">
            <li>Open Cloudflare Dashboard → R2 Object Storage → <span className="text-purple-300 font-bold">mediaflow-media</span></li>
            <li>Click the <span className="text-amber-300 font-bold">Settings</span> tab (right next to Objects and Metrics)</li>
            <li>Scroll to <span className="text-amber-300 font-bold">CORS Policy</span> and click <span className="text-purple-300 font-bold">Edit CORS Policy</span></li>
            <li>Paste the JSON rule below and click <span className="text-green-400 font-bold">Save</span></li>
          </ol>

          <pre className="bg-slate-900 border border-slate-800 p-3 rounded-xl overflow-x-auto text-purple-300 font-mono text-[11px]">
            {corsJson}
          </pre>
        </div>
      )}
      
      {/* File Upload Form */}
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input 
          type="text" 
          placeholder="File Title"
          value={newMedia.title}
          onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
          className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200 transition"
          required
        />

        <input 
          type="text" 
          placeholder="Artist / Director Name"
          value={newMedia.artist}
          onChange={(e) => setNewMedia({ ...newMedia, artist: e.target.value })}
          className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200 transition"
          required
        />

        <div className="grid grid-cols-2 gap-2">
          <select 
            value={newMedia.type}
            onChange={(e) => setNewMedia({ ...newMedia, type: e.target.value, url: '', fileName: '' })}
            className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-3 text-sm text-slate-300 focus:outline-none focus:border-purple-500 transition cursor-pointer"
          >
            <option value="music">Music</option>
            <option value="movie">Movie</option>
          </select>
          <select 
            value={newMedia.category}
            onChange={(e) => setNewMedia({ ...newMedia, category: e.target.value })}
            className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-3 text-sm text-slate-300 focus:outline-none focus:border-purple-500 transition cursor-pointer"
          >
            {categories.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <input 
          type="text" 
          placeholder={`Direct asset path (e.g., /src/assets/${newMedia.type === 'music' ? 'music/song.mp3' : 'movies/film.mp4'})`}
          value={newMedia.url}
          onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value, fileName: e.target.value.split('/').pop() })}
          className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200 transition md:col-span-1"
        />

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
            className="w-full h-full bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl px-4 py-3.5 text-sm text-left text-slate-400 focus:outline-none hover:text-slate-300 transition flex items-center justify-between"
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
          className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-slate-200 transition"
        />

        <button type="submit" className="w-full md:col-span-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition text-sm flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-600/20 active:scale-[0.99]">
          <Plus className="w-5 h-5" /> <span>Add To System</span>
        </button>
      </form>
    </section>
  );
}