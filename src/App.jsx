import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { auth } from './services/firebase';
import { Toaster, toast } from 'sonner';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Topbar from './components/Topbar';
import ContentFeed from './components/ContentFeed';
import AdminUploadForm from './components/AdminUploadForm';
import MediaControlPlayer from './components/MediaControlPlayer';

const initialMedia = [
  { id: 1, title: "Midnight Echoes", artist: "Luna Shadows", category: "Romantic", type: "music", url: "src/assets/music/midnight.mp3", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500" },
  { id: 2, title: "The Silent Forest", artist: "Director Hayes", category: "Thriller", type: "movie", url: "src/assets/movies/silent_forest.mp4", thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500" },
];

const categories = ["All", "Action", "Comedy", "Thriller", "Romantic", "Drama"];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Added viewMode to track whether admin is viewing as admin or user
  const [viewMode, setViewMode] = useState(null); 
  const [activeTab, setActiveTab] = useState('explore');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [mediaList, setMediaList] = useState(() => {
    const data = localStorage.getItem('MF_STORED_MEDIA');
    return data ? JSON.parse(data) : initialMedia;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newMedia, setNewMedia] = useState({ title: '', artist: '', category: 'Action', type: 'music', url: '', thumbnail: '' });
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  // 🛠️ Updated Cloud-Only State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const savedUser = localStorage.getItem('MF_ACTIVE_USER');
        const parsed = savedUser ? JSON.parse(savedUser) : null;
        
        const userRole = user.email === 'admin@mediaflow.com' ? 'admin' : 'user';

        setCurrentUser({
          email: user.email,
          name: parsed?.name || user.displayName || 'Subscribed User',
          avatar: parsed?.avatar || user.photoURL || '',
          role: userRole
        });

        // Initialize viewMode based on original cloud role
        if (!viewMode) {
          setViewMode(userRole);
        }
      } else {
        const savedUser = localStorage.getItem('MF_ACTIVE_USER');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setCurrentUser(parsed);
          if (!viewMode) setViewMode(parsed.role);
        } else {
          setCurrentUser(null);
          setViewMode(null);
        }
      }
      setLoadingSession(false);
    });

    return () => unsubscribe();
  }, [viewMode]);

  // Set initial sidebar visibility
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarExpanded(false);
      } else {
        setIsSidebarExpanded(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('MF_STORED_MEDIA', JSON.stringify(mediaList));
  }, [mediaList]);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('MF_ACTIVE_USER', JSON.stringify(user));
  };

  // 🛠️ Cloud-Synced Profile Persistence Handler
  const handleUpdateProfile = async (newName, newPic) => {
    if (currentUser) {
      try {
        const user = auth.currentUser;
        if (user) {
          await updateProfile(user, { 
            displayName: newName, 
            photoURL: newPic 
          });

          const updatedUser = { ...currentUser, name: newName, avatar: newPic };
          setCurrentUser(updatedUser);
          localStorage.setItem('MF_ACTIVE_USER', JSON.stringify(updatedUser));
          
          toast.success('Cloud profile and display name updated successfully!');
        }
      } catch (error) {
        toast.error('Failed to sync profile changes to cloud storage.');
      }
    }
  };

  // 🛠️ Synchronize Firebase sign out
  const handleLogout = () => {
    signOut(auth).then(() => {
      setCurrentUser(null);
      localStorage.removeItem('MF_ACTIVE_USER');
      setCurrentlyPlaying(null);
      setIsPlaying(false);
      setViewMode(null);
      toast.success('Successfully logged out.');
    }).catch((error) => {
      console.error("Sign out error:", error);
    });
  };

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
      thumbnail: newMedia.thumbnail || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500"
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

  const playNext = () => {
    if (filteredMedia.length === 0) return;
    const currentIndex = filteredMedia.findIndex(item => item.id === currentlyPlaying?.id);
    const nextIndex = (currentIndex + 1) % filteredMedia.length;
    setCurrentlyPlaying(filteredMedia[nextIndex]);
    setIsPlaying(true);
  };

  const playPrev = () => {
    if (filteredMedia.length === 0) return;
    const currentIndex = filteredMedia.findIndex(item => item.id === currentlyPlaying?.id);
    const prevIndex = (currentIndex - 1 + filteredMedia.length) % filteredMedia.length;
    setCurrentlyPlaying(filteredMedia[prevIndex]);
    setIsPlaying(true);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <span className="text-sm font-bold text-slate-400 tracking-wider animate-pulse">Checking credentials...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Toaster position="top-right" theme="dark" closeButton richColors />
        <Auth onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100 flex flex-col select-none antialiased">
      {/* Premium Sonner Toaster Instance */}
      <Toaster position="top-right" theme="dark" closeButton richColors />

      <Header 
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        role={currentUser.role}
        viewMode={viewMode}
        setViewMode={setViewMode}
        userName={currentUser.name}
        userEmail={currentUser.email}
        userProfilePic={currentUser.avatar}
        onUpdateProfile={handleUpdateProfile}
      />

      <div className="flex flex-1 relative">
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isExpanded={isSidebarExpanded}
          setIsExpanded={setIsSidebarExpanded}
          logout={handleLogout}
          role={currentUser.role}
        />

        <main className={`flex-1 flex flex-col p-4 md:p-8 transition-all duration-300 pb-36 min-h-screen w-full ${
          isSidebarExpanded ? 'lg:ml-64' : 'ml-0 lg:ml-20'
        }`}>
          <div className="mb-6 flex flex-col w-full">
            <Topbar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              activeTab={activeTab}
            />
          </div>

          {currentUser.role === 'admin' && viewMode === 'admin' && (
            <AdminUploadForm 
              newMedia={newMedia}
              setNewMedia={setNewMedia}
              categories={categories}
              handleUpload={handleUpload}
              role={currentUser.role}
              setViewMode={setViewMode}
            />
          )}

          <ContentFeed 
            filteredMedia={filteredMedia}
            role={currentUser.role}
            handleDelete={handleDelete}
            togglePlayback={togglePlayback}
            currentlyPlaying={currentlyPlaying}
            isPlaying={isPlaying}
          />
        </main>
      </div>

      <MediaControlPlayer 
        currentlyPlaying={currentlyPlaying}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        setCurrentlyPlaying={setCurrentlyPlaying}
        playNext={playNext}
        playPrev={playPrev}
        shuffleToggle={() => setIsShuffle(!isShuffle)}
        isShuffle={isShuffle}
      />
    </div>
  );
}