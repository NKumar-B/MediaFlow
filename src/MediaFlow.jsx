import React, { useState } from 'react';
import { Compass, Music, Film } from 'lucide-react';
import Header from './components/Header';
import SubHeaderFilters from './components/SubHeaderFilters';
import AdminUploadForm from './components/AdminUploadForm';
import MediaGrid from './components/MediaGrid';
import MediaControlPlayer from './components/MediaControlPlayer';

const initialMedia = [
  { id: 1, title: "Midnight Echoes", artist: "Luna Shadows", category: "Romantic", type: "music", url: "#", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60" },
  { id: 2, title: "The Silent Forest", artist: "Director Hayes", category: "Thriller", type: "movie", url: "#", thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60" },
  { id: 3, title: "Electric Dreams", artist: "Syntax Error", category: "Comedy", type: "music", url: "#", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60" },
  { id: 4, title: "Neon Horizon", artist: "Arcade Runner", category: "Action", type: "movie", url: "#", thumbnail: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&auto=format&fit=crop&q=60" },
];

const categories = ["All", "Action", "Comedy", "Thriller", "Romantic", "Drama"];

export default function MediaFlow() {
  const [role, setRole] = useState('user'); 
  const [activeTab, setActiveTab] = useState('explore'); 
  const [mediaList, setMediaList] = useState(initialMedia);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [newMedia, setNewMedia] = useState({ title: '', artist: '', category: 'Action', type: 'music', url: '', thumbnail: '' });
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sorting Context Data Filtering
  const filteredMedia = mediaList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesTab = activeTab === 'explore' || item.type === activeTab.slice(0, -1);
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!newMedia.title || !newMedia.artist) return;
    
    const newItem = {
      ...newMedia,
      id: Date.now(),
      thumbnail: newMedia.thumbnail || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60"
    };
    
    setMediaList([newItem, ...mediaList]);
    setNewMedia({ title: '', artist: '', category: 'Action', type: 'music', url: '', thumbnail: '' });
  };

  const handleDelete = (id) => {
    setMediaList(mediaList.filter(item => item.id !== id));
    if (currentlyPlaying?.id === id) {
      setCurrentlyPlaying(null);
      setIsPlaying(false);
    }
  };

  const togglePlayback = (item) => {
    if (currentlyPlaying?.id === item.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentlyPlaying(item);
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100 flex flex-col justify-between select-none">
      
      {/* 1. Header */}
      <Header 
        role={role}
        setRole={setRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden flex flex-col p-4 bg-slate-900 border-b border-slate-800 space-y-2 animate-fade-in">
          <button 
            onClick={() => { setActiveTab('explore'); setMobileMenuOpen(false); }} 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition ${activeTab === 'explore' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400'}`}>
            <Compass className="w-5 h-5" /> <span>Explore</span>
          </button>
          <button 
            onClick={() => { setActiveTab('music'); setMobileMenuOpen(false); }} 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition ${activeTab === 'music' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400'}`}>
            <Music className="w-5 h-5" /> <span>Music</span>
          </button>
          <button 
            onClick={() => { setActiveTab('movies'); setMobileMenuOpen(false); }} 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition ${activeTab === 'movies' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400'}`}>
            <Film className="w-5 h-5" /> <span>Movies</span>
          </button>
        </div>
      )}

      {/* Main Context Grid Canvas */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 gap-8">
        
        {/* 2. Top Controls - Search & Filters */}
        <SubHeaderFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* 3. Add Media Control Panel (Admin Exclusive) */}
        {role === 'admin' && (
          <AdminUploadForm 
            newMedia={newMedia}
            setNewMedia={setNewMedia}
            categories={categories}
            handleUpload={handleUpload}
          />
        )}

        {/* 4. Filtered Video/Audio Media Card Layouts */}
        <MediaGrid 
          filteredMedia={filteredMedia}
          role={role}
          handleDelete={handleDelete}
          togglePlayback={togglePlayback}
          currentlyPlaying={currentlyPlaying}
          isPlaying={isPlaying}
        />

      </main>

      {/* 5. Fixed System Player Component */}
      <MediaControlPlayer 
        currentlyPlaying={currentlyPlaying}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        setCurrentlyPlaying={setCurrentlyPlaying}
      />
    </div>
  );
}