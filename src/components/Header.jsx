import React, { useState, useRef } from 'react';
import { Menu, X, Flame, ShieldAlert, Lock, User, Check, Mail, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function Header({ 
  isExpanded, 
  setIsExpanded, 
  role,         // Permanent true role ('admin' | 'user')
  viewMode,     // Active layout viewing mode ('admin' | 'user')
  setViewMode,  // State callback for dynamic layout toggling
  userName,
  userEmail,
  userProfilePic,
  onUpdateProfile
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newName, setNewName] = useState(userName || '');
  const fileInputRef = useRef(null);

  const [imgError, setImgError] = useState(false);

  const handleToggleView = () => {
    if (role !== 'admin') {
      return toast.error('Access Denied. Admin privileges are required to toggle views.');
    }
    const targetMode = viewMode === 'user' ? 'admin' : 'user';
    setViewMode(targetMode);
    toast.success(`Switched viewing layout to ${targetMode.toUpperCase()} mode.`);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      return toast.error('Profile name cannot be empty.');
    }
    onUpdateProfile(newName.trim(), userProfilePic);
    setIsDropdownOpen(false);
    toast.success('Profile details updated successfully!');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload a valid image file.');
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result;
      setImgError(false);
      onUpdateProfile(newName.trim() || userName, base64Image);
      toast.success('Profile picture updated!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/60 px-4 md:px-8 h-16 flex items-center justify-between select-none">
      
      {/* Left side: Hamburger menu & Brand */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="p-2 rounded-xl hover:bg-slate-900/80 text-slate-300 hover:text-white transition focus:outline-none"
          title="Toggle Navigation Sidebar"
        >
          {isExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className="flex items-center space-x-2 animate-fade-in duration-300">
          <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-1.5 rounded-xl">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-wider text-slate-100">
            MEDIA<span className="text-purple-400">FLOW</span>
          </span>
        </div>
      </div>

      {/* Right side: Account details dropdown & view toggler */}
      <div className="flex items-center space-x-4 relative">
        
        {/* Profile Card Trigger */}
        <div 
          onClick={() => { setIsDropdownOpen(!isDropdownOpen); setNewName(userName || ''); }} 
          className="flex items-center space-x-3 bg-slate-900/40 border border-slate-800/60 hover:bg-slate-800/40 px-3 py-1.5 rounded-2xl cursor-pointer hover:border-slate-700 transition select-none"
          title="Manage Account Profile"
        >
          {userProfilePic && !imgError ? (
            <img 
              src={userProfilePic} 
              alt={userName || 'User'} 
              onError={() => setImgError(true)}
              className="w-8 h-8 rounded-xl object-cover border border-slate-700/80" 
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-slate-700/80 flex items-center justify-center text-purple-400 text-sm font-black uppercase">
              {userName ? userName.charAt(0) : <User className="w-4 h-4" />}
            </div>
          )}

          <div className="flex flex-col items-end leading-tight pr-1">
            <span className="text-xs font-bold text-slate-200 line-clamp-1">{userName || 'Active User'}</span>
            <span className="text-[9px] font-extrabold tracking-wider text-purple-400 uppercase leading-normal">
              {viewMode || role}
            </span>
          </div>
        </div>

        {/* --- PERSISTENT PROFILE DROPDOWN CARD OVERLAY --- */}
        {isDropdownOpen && (
          <div className="absolute right-14 top-14 w-72 z-50 bg-slate-950/95 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl animate-fade-in flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
              <h3 className="text-sm font-black text-slate-100 tracking-wide">Account Settings</h3>
              <button onClick={() => setIsDropdownOpen(false)} className="text-slate-500 hover:text-slate-300 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile image picker */}
            <div className="flex flex-col items-center gap-2">
              <div 
                onClick={() => fileInputRef.current && fileInputRef.current.click()} 
                className="relative group cursor-pointer"
                title="Change Avatar"
              >
                {userProfilePic && !imgError ? (
                  <img src={userProfilePic} alt="Avatar" onError={() => setImgError(true)} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-800 group-hover:border-purple-500 transition" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/10 to-pink-500/10 border-2 border-slate-800 group-hover:border-purple-500 transition flex items-center justify-center text-purple-400 text-2xl font-black uppercase">
                    {userName ? userName.charAt(0) : 'U'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <Camera className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Click image to change</span>

              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>

            {/* Inline Editor Form */}
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3.5">
              {/* Account Email: Always Disabled */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verified Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={userEmail || 'standard@mediaflow.com'} 
                    disabled 
                    className="w-full bg-slate-900/40 border border-slate-800/40 text-slate-500 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none cursor-not-allowed select-none font-medium"
                  />
                </div>
              </div>

              {/* Account Name: Editable */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    placeholder="Add account name"
                    maxLength={25}
                    className="w-full bg-slate-900/80 border border-slate-800 text-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-purple-500 transition font-medium"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/10 select-none"
              >
                <Check className="w-4 h-4" /> <span>Save Changes</span>
              </button>
            </form>
          </div>
        )}

        {/* Dynamic Admin View Toggler Button */}
        <button 
          onClick={handleToggleView} 
          title={role === 'admin' ? `Switch view mode` : `Admin View Locked`}
          className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
            role === 'admin' 
              ? 'bg-slate-900/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-purple-400 hover:text-purple-300 cursor-pointer hover:scale-105' 
              : 'bg-slate-900/20 border-slate-800/40 text-slate-600 cursor-not-allowed'
          }`}
        >
          {role === 'admin' ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <Lock className="w-4 h-4" />}
        </button>
      </div>

    </header>
  );
}