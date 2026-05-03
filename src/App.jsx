// import React, { useState, useEffect } from 'react';
// import Auth from './components/Auth';
// import Sidebar from './components/Sidebar';
// import Topbar from './components/Topbar';
// import ContentFeed from './components/ContentFeed';
// import AdminUploadForm from './components/AdminUploadForm';
// import MediaControlPlayer from './components/MediaControlPlayer';

// const initialMedia = [
//   { id: 1, title: "Midnight Echoes", artist: "Luna Shadows", category: "Romantic", type: "music", url: "src/assets/music/midnight.mp3", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500" },
//   { id: 2, title: "The Silent Forest", artist: "Director Hayes", category: "Thriller", type: "movie", url: "src/assets/movies/silent_forest.mp4", thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500" },
//   { id: 3, title: "Electric Dreams", artist: "Syntax Error", category: "Comedy", type: "music", url: "src/assets/music/electric.mp3", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500" },
//   { id: 4, title: "Neon Horizon", artist: "Arcade Runner", category: "Action", type: "movie", url: "src/assets/movies/neon.mp4", thumbnail: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500" },
// ];

// const categories = ["All", "Action", "Comedy", "Thriller", "Romantic", "Drama"];

// export default function App() {
//   const [currentUser, setCurrentUser] = useState(() => {
//     const data = localStorage.getItem('MF_ACTIVE_USER');
//     return data ? JSON.parse(data) : null;
//   });

//   const [activeTab, setActiveTab] = useState('explore');
//   const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
//   const [mediaList, setMediaList] = useState(() => {
//     const data = localStorage.getItem('MF_STORED_MEDIA');
//     return data ? JSON.parse(data) : initialMedia;
//   });

//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [newMedia, setNewMedia] = useState({ title: '', artist: '', category: 'Action', type: 'music', url: '', thumbnail: '' });
//   const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isShuffle, setIsShuffle] = useState(false);

//   useEffect(() => {
//     localStorage.setItem('MF_STORED_MEDIA', JSON.stringify(mediaList));
//   }, [mediaList]);

//   const handleAuthSuccess = (user) => {
//     setCurrentUser(user);
//     localStorage.setItem('MF_ACTIVE_USER', JSON.stringify(user));
//   };

//   const handleLogout = () => {
//     setCurrentUser(null);
//     localStorage.removeItem('MF_ACTIVE_USER');
//     setCurrentlyPlaying(null);
//     setIsPlaying(false);
//   };

//   const filteredMedia = mediaList.filter(item => {
//     const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                           item.artist.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
//     const matchesTab = activeTab === 'explore' || item.type === activeTab.slice(0, -1);
//     return matchesSearch && matchesCategory && matchesTab;
//   });

//   const handleUpload = (e) => {
//     e.preventDefault();
//     if (!newMedia.title || !newMedia.artist) return;
//     const newItem = {
//       ...newMedia,
//       id: Date.now(),
//       thumbnail: newMedia.thumbnail || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500"
//     };
//     setMediaList([newItem, ...mediaList]);
//     setNewMedia({ title: '', artist: '', category: 'Action', type: 'music', url: '', thumbnail: '' });
//   };

//   const handleDelete = (id) => {
//     setMediaList(mediaList.filter(item => item.id !== id));
//     if (currentlyPlaying?.id === id) {
//       setCurrentlyPlaying(null);
//       setIsPlaying(false);
//     }
//   };

//   const togglePlayback = (item) => {
//     if (currentlyPlaying?.id === item.id) {
//       setIsPlaying(!isPlaying);
//     } else {
//       setCurrentlyPlaying(item);
//       setIsPlaying(true);
//     }
//   };

//   const playNext = () => {
//     if (filteredMedia.length === 0) return;
//     if (isShuffle) {
//       const randomIndex = Math.floor(Math.random() * filteredMedia.length);
//       setCurrentlyPlaying(filteredMedia[randomIndex]);
//     } else {
//       const currentIndex = filteredMedia.findIndex(item => item.id === currentlyPlaying?.id);
//       const nextIndex = (currentIndex + 1) % filteredMedia.length;
//       setCurrentlyPlaying(filteredMedia[nextIndex]);
//     }
//     setIsPlaying(true);
//   };

//   const playPrev = () => {
//     if (filteredMedia.length === 0) return;
//     const currentIndex = filteredMedia.findIndex(item => item.id === currentlyPlaying?.id);
//     const prevIndex = (currentIndex - 1 + filteredMedia.length) % filteredMedia.length;
//     setCurrentlyPlaying(filteredMedia[prevIndex]);
//     setIsPlaying(true);
//   };

//   if (!currentUser) {
//     return <Auth onAuthSuccess={handleAuthSuccess} />;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100 flex selection:bg-purple-500/30 font-sans">
      
//       {/* 1. Sidebar Hub */}
//       <Sidebar 
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//         isExpanded={isSidebarExpanded}
//         setIsExpanded={setIsSidebarExpanded}
//         logout={handleLogout}
//         role={currentUser.role}
//       />

//       {/* 2. Main Video Feed Frame Canvas */}
//       <main 
//         className={`flex-1 flex flex-col p-6 md:p-8 transition-all duration-300 pb-32 min-h-screen ${
//           isSidebarExpanded ? 'ml-64' : 'ml-20'
//         }`}
//       >
//         <Topbar 
//           searchQuery={searchQuery}
//           setSearchQuery={setSearchQuery}
//           categories={categories}
//           selectedCategory={selectedCategory}
//           setSelectedCategory={setSelectedCategory}
//           activeTab={activeTab}
//         />

//         {currentUser.role === 'admin' && (
//           <AdminUploadForm 
//             newMedia={newMedia}
//             setNewMedia={setNewMedia}
//             categories={categories}
//             handleUpload={handleUpload}
//           />
//         )}

//         <ContentFeed 
//           filteredMedia={filteredMedia}
//           role={currentUser.role}
//           handleDelete={handleDelete}
//           togglePlayback={togglePlayback}
//           currentlyPlaying={currentlyPlaying}
//           isPlaying={isPlaying}
//         />
//       </main>

//       {/* 3. Floating Persistent System Player */}
//       <MediaControlPlayer 
//         currentlyPlaying={currentlyPlaying}
//         isPlaying={isPlaying}
//         setIsPlaying={setIsPlaying}
//         setCurrentlyPlaying={setCurrentlyPlaying}
//         playNext={playNext}
//         playPrev={playPrev}
//         shuffleToggle={() => setIsShuffle(!isShuffle)}
//         isShuffle={isShuffle}
//       />
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
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
  const [currentUser, setCurrentUser] = useState(() => {
    const data = localStorage.getItem('MF_ACTIVE_USER');
    return data ? JSON.parse(data) : null;
  });

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

  // Auto-collapse sidebar on smaller mobile screens
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

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('MF_ACTIVE_USER', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('MF_ACTIVE_USER');
    setCurrentlyPlaying(null);
    setIsPlaying(false);
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

  if (!currentUser) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100 flex flex-col select-none antialiased">
      
      {/* 1. Header Navigation Toolbar */}
      <Header 
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        role={currentUser.role}
        setRole={(newRole) => setCurrentUser({ ...currentUser, role: newRole })}
        userName={currentUser.name}
      />

      <div className="flex flex-1 relative">
        {/* 2. Slide Navigation Drawer */}
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isExpanded={isSidebarExpanded}
          setIsExpanded={setIsSidebarExpanded}
          logout={handleLogout}
          role={currentUser.role}
        />

        {/* 3. Content Display Canvas */}
        <main 
          className={`flex-1 flex flex-col p-4 md:p-8 transition-all duration-300 pb-36 min-h-screen w-full ${
            isSidebarExpanded ? 'lg:ml-64' : 'ml-0 lg:ml-20'
          }`}
        >
          {/* Main Topbar search & category pills row */}
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

          {currentUser.role === 'admin' && (
            <AdminUploadForm 
              newMedia={newMedia}
              setNewMedia={setNewMedia}
              categories={categories}
              handleUpload={handleUpload}
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

      {/* 4. Media Audio/Video Player Controller Overlay */}
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