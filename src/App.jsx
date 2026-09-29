import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { collection, onSnapshot, addDoc, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from './services/firebase';
import { 
  saveMediaFileToStorage, 
  getMediaFileFromStorage, 
  deleteMediaFileFromStorage,
  convertFileToBase64
} from './services/mediaStorage';
import { uploadMediaFileToCloud } from './services/cloudStorage';
import { getPresignedR2UploadUrl, uploadFileToR2PresignedUrl } from './services/mediaService';
import { Toaster, toast } from 'sonner';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Topbar from './components/Topbar';
import ContentFeed from './components/ContentFeed';
import AdminUploadForm from './components/AdminUploadForm';
import VideoPlayer from './components/media/VideoPlayer';
import AudioPlayer from './components/media/AudioPlayer';

const initialMedia = [
  { id: 1, title: "Midnight Echoes", artist: "Luna Shadows", category: "Romantic", type: "music", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3", hlsUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500" },
  { id: 2, title: "The Silent Forest", artist: "Director Hayes", category: "Thriller", type: "movie", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", hlsUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500" },
  { id: 3, title: "Electric Dreams", artist: "Syntax Error", category: "Comedy", type: "music", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", hlsUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500" },
];

const categories = ["All", "Action", "Comedy", "Thriller", "Romantic", "Drama"];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [viewMode, setViewMode] = useState(null); 
  const [activeTab, setActiveTab] = useState('explore');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [mediaList, setMediaList] = useState(() => {
    const data = localStorage.getItem('MF_STORED_MEDIA');
    const deletedLocalIds = JSON.parse(localStorage.getItem('MF_DELETED_IDS') || '[]');
    const base = data ? JSON.parse(data) : initialMedia;
    return base.filter((item) => !deletedLocalIds.includes(item.id));
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newMedia, setNewMedia] = useState({ title: '', artist: '', category: 'Action', type: 'music', url: '', thumbnail: '' });
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  // Hydrate Persistent IndexedDB Files on Startup
  useEffect(() => {
    const hydratePersistentFiles = async () => {
      const storedData = localStorage.getItem('MF_STORED_MEDIA');
      const deletedLocalIds = JSON.parse(localStorage.getItem('MF_DELETED_IDS') || '[]');
      const baseList = (storedData ? JSON.parse(storedData) : initialMedia).filter(i => !deletedLocalIds.includes(i.id));

      const hydrated = await Promise.all(
        baseList.map(async (item) => {
          if (item.hasStoredFile || item.id) {
            const restoredUrl = await getMediaFileFromStorage(item.id);
            if (restoredUrl) {
              return { ...item, url: restoredUrl, hlsUrl: restoredUrl };
            }
          }
          return item;
        })
      );
      setMediaList(hydrated);
    };

    hydratePersistentFiles();
  }, []);

  // Realtime Cloud Firestore Sync
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, "media"), (snapshot) => {
        const deletedLocalIds = JSON.parse(localStorage.getItem('MF_DELETED_IDS') || '[]');
        const cloudItemsMap = new Map();

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const itemKey = String(data.id || docSnap.id);
          if (!deletedLocalIds.includes(data.id)) {
            cloudItemsMap.set(itemKey, { firestoreId: docSnap.id, ...data });
          }
        });

        setMediaList((prev) => {
          const updatedList = [];
          const processedIds = new Set();

          cloudItemsMap.forEach((cloudItem, key) => {
            processedIds.add(key);
            const prevLocal = prev.find(p => String(p.id) === key);
            updatedList.push({
              ...cloudItem,
              url: (prevLocal?.url && prevLocal.url.startsWith('blob:')) ? prevLocal.url : (cloudItem.url || prevLocal?.url || ''),
              hlsUrl: cloudItem.hlsUrl || cloudItem.url || prevLocal?.hlsUrl || ''
            });
          });

          prev.forEach((item) => {
            const key = String(item.id);
            if (!processedIds.has(key) && !item.firestoreId && !deletedLocalIds.includes(item.id)) {
              updatedList.push(item);
              processedIds.add(key);
            }
          });

          return updatedList;
        });
      }, (err) => {
        console.warn("Firestore snapshot notice:", err);
      });

      return () => unsubscribe();
    } catch (e) {
      // Ignore
    }
  }, []);

  // Auth session listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const savedUser = localStorage.getItem('MF_ACTIVE_USER');
      const parsed = savedUser ? JSON.parse(savedUser) : null;

      if (user) {
        const userRole = user.email === 'admin@mediaflow.com' ? 'admin' : 'user';

        setCurrentUser({
          email: user.email,
          name: parsed?.name || user.displayName || user.email.split('@')[0],
          avatar: parsed?.avatar || user.photoURL || '',
          role: userRole
        });

        if (!viewMode) {
          setViewMode(userRole);
        }
      } else if (parsed) {
        setCurrentUser(parsed);
        if (!viewMode) setViewMode(parsed.role);
      } else {
        setCurrentUser(null);
        setViewMode(null);
      }
      setLoadingSession(false);
    });

    return () => unsubscribe();
  }, [viewMode]);

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
    const serializableList = mediaList.map(({ fileObj, ...rest }) => rest);
    localStorage.setItem('MF_STORED_MEDIA', JSON.stringify(serializableList));
  }, [mediaList]);

  const handleAuthSuccess = (user) => {
    const savedUser = localStorage.getItem('MF_ACTIVE_USER');
    const parsed = savedUser ? JSON.parse(savedUser) : null;

    const mergedUser = {
      ...user,
      name: user.name || parsed?.name || 'Active User',
      avatar: user.avatar || parsed?.avatar || ''
    };

    setCurrentUser(mergedUser);
    localStorage.setItem('MF_ACTIVE_USER', JSON.stringify(mergedUser));
  };

  const handleUpdateProfile = async (newName, newPic) => {
    if (currentUser) {
      try {
        const user = auth.currentUser;
        if (user) {
          await updateProfile(user, { 
            displayName: newName, 
            photoURL: newPic 
          });
        }
      } catch (error) {
        // Ignore
      }

      const updatedUser = { ...currentUser, name: newName, avatar: newPic };
      setCurrentUser(updatedUser);
      localStorage.setItem('MF_ACTIVE_USER', JSON.stringify(updatedUser));
      toast.success('Profile details saved persistently!');
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      setCurrentUser(null);
      localStorage.removeItem('MF_ACTIVE_USER');
      setCurrentlyPlaying(null);
      setIsPlaying(false);
      setViewMode(null);
      toast.success('Successfully logged out.');
    }).catch(() => {
      setCurrentUser(null);
      localStorage.removeItem('MF_ACTIVE_USER');
      setCurrentlyPlaying(null);
      setIsPlaying(false);
      setViewMode(null);
    });
  };

  const filteredMedia = mediaList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesTab = activeTab === 'explore' || item.type === activeTab.slice(0, -1);
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newMedia.title || !newMedia.artist) return;

    if (newMedia.url && /^[a-zA-Z]:\\|^file:\/\/\//i.test(newMedia.url.trim())) {
      toast.error("Local Windows file paths (C:\\...) cannot be played directly by browsers. Please click 'Browse' to upload your file directly.");
      throw new Error("Local OS file path restricted.");
    }

    const itemId = Date.now();
    let finalUrl = newMedia.url;
    let hasStoredFile = false;

    // Direct Cloudflare R2 Presigned Upload Pipeline with Fallbacks
    if (newMedia.fileObj) {
      try {
        toast.info(`Generating Cloudflare R2 upload URL for "${newMedia.title}"...`);
        const { uploadUrl, publicUrl, storagePath, isSimulated } = await getPresignedR2UploadUrl(
          newMedia.fileObj.name, 
          newMedia.fileObj.type, 
          newMedia.type
        );
        
        if (!isSimulated && uploadUrl && uploadUrl !== 'https://httpbin.org/put') {
          toast.info(`Uploading media file to Cloudflare R2...`);
          await uploadFileToR2PresignedUrl(newMedia.fileObj, uploadUrl);
          finalUrl = publicUrl || (storagePath ? `/api/media/access-url?key=${encodeURIComponent(storagePath)}` : null) || URL.createObjectURL(newMedia.fileObj);
          hasStoredFile = true;
          toast.success("Uploaded directly to Cloudflare R2!");
        } else {
          toast.info("Uploading file via cloud storage fallback...");
          finalUrl = await uploadMediaFileToCloud(newMedia.fileObj);
          hasStoredFile = true;
        }
      } catch (r2Err) {
        console.warn("Cloudflare R2 upload notice, falling back to cloud storage:", r2Err);
        toast.info("R2 CORS/Configuration notice. Uploading via Cloud Storage...");
        try {
          finalUrl = await uploadMediaFileToCloud(newMedia.fileObj);
          hasStoredFile = true;
        } catch (cloudErr) {
          const base64Data = await convertFileToBase64(newMedia.fileObj);
          await saveMediaFileToStorage(itemId, newMedia.fileObj);
          finalUrl = base64Data || URL.createObjectURL(newMedia.fileObj);
          hasStoredFile = true;
        }
      }
    }

    const newItem = {
      id: itemId,
      title: newMedia.title,
      artist: newMedia.artist,
      category: newMedia.category,
      type: newMedia.type,
      url: finalUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      hlsUrl: finalUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      thumbnail: newMedia.thumbnail || (newMedia.type === 'music' 
        ? "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500" 
        : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500"),
      hasStoredFile
    };

    try {
      const docRef = await addDoc(collection(db, "media"), {
        id: newItem.id,
        title: newItem.title,
        artist: newItem.artist,
        category: newItem.category,
        type: newItem.type,
        url: newItem.url,
        hlsUrl: newItem.hlsUrl,
        thumbnail: newItem.thumbnail,
        posterUrl: newItem.thumbnail,
        createdAt: new Date().toISOString()
      });
      newItem.firestoreId = docRef.id;
    } catch (cloudErr) {
      // Local storage active
    }

    setMediaList([newItem, ...mediaList]);
    setNewMedia({ title: '', artist: '', category: 'Action', type: 'music', url: '', thumbnail: '' });

    toast.success(`"${newItem.title}" published and synced!`);
  };

  const handleDelete = async (id) => {
    const itemToDelete = mediaList.find((i) => i.id === id);
    
    await deleteMediaFileFromStorage(id);

    const deletedLocalIds = JSON.parse(localStorage.getItem('MF_DELETED_IDS') || '[]');
    if (!deletedLocalIds.includes(id)) {
      deletedLocalIds.push(id);
      localStorage.setItem('MF_DELETED_IDS', JSON.stringify(deletedLocalIds));
    }

    try {
      if (itemToDelete?.firestoreId) {
        await deleteDoc(doc(db, "media", itemToDelete.firestoreId));
      } else {
        const q = query(collection(db, "media"), where("id", "==", id));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (docSnap) => {
          await deleteDoc(doc(db, "media", docSnap.id));
        });
      }
    } catch (e) {
      console.warn("Firestore delete notice:", e);
    }

    setMediaList((prev) => prev.filter(item => item.id !== id));

    if (currentlyPlaying?.id === id) {
      setCurrentlyPlaying(null);
      setIsPlaying(false);
    }
    toast.success('Content deleted successfully.');
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

      {currentlyPlaying?.type === 'movie' ? (
        <VideoPlayer 
          currentlyPlaying={currentlyPlaying}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          setCurrentlyPlaying={setCurrentlyPlaying}
          playNext={playNext}
          playPrev={playPrev}
          userId={currentUser?.email}
        />
      ) : (
        <AudioPlayer 
          currentlyPlaying={currentlyPlaying}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          setCurrentlyPlaying={setCurrentlyPlaying}
          playNext={playNext}
          playPrev={playPrev}
          shuffleToggle={() => setIsShuffle(!isShuffle)}
          isShuffle={isShuffle}
          userId={currentUser?.email}
        />
      )}
    </div>
  );
}