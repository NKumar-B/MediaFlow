// import React from 'react';
// import { Compass, Music, Film, ShieldAlert, Menu, X, Flame } from 'lucide-react';

// export default function Header({ 
//   role, 
//   setRole, 
//   activeTab, 
//   setActiveTab, 
//   mobileMenuOpen, 
//   setMobileMenuOpen 
// }) {
//   return (
//     <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/60 border-b border-slate-800/80 px-4 md:px-8 py-4 flex items-center justify-between">
//       {/* Branding */}
//       <div className="flex items-center space-x-3">
//         <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-2 rounded-xl shadow-lg shadow-purple-500/20">
//           <Flame className="w-6 h-6 text-white" />
//         </div>
//         <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
//           MEDIA<span className="text-purple-400">FLOW</span>
//         </span>
//       </div>

//       {/* Desktop Navigation Tabs */}
//       <nav className="hidden md:flex bg-slate-900/50 border border-slate-800 p-1 rounded-full items-center">
//         <button 
//           onClick={() => setActiveTab('explore')} 
//           className={`flex items-center space-x-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
//             activeTab === 'explore' 
//               ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
//               : 'text-slate-400 hover:text-slate-200'
//           }`}>
//           <Compass className="w-4 h-4" /> <span>Explore</span>
//         </button>
//         <button 
//           onClick={() => setActiveTab('music')} 
//           className={`flex items-center space-x-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
//             activeTab === 'music' 
//               ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
//               : 'text-slate-400 hover:text-slate-200'
//           }`}>
//           <Music className="w-4 h-4" /> <span>Music</span>
//         </button>
//         <button 
//           onClick={() => setActiveTab('movies')} 
//           className={`flex items-center space-x-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
//             activeTab === 'movies' 
//               ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
//               : 'text-slate-400 hover:text-slate-200'
//           }`}>
//           <Film className="w-4 h-4" /> <span>Movies</span>
//         </button>
//       </nav>

//       {/* Control Panel */}
//       <div className="flex items-center space-x-3">
//         <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 hidden sm:inline-block">
//           {role.toUpperCase()}
//         </span>
//         <button 
//           onClick={() => setRole(role === 'user' ? 'admin' : 'user')} 
//           title="Toggle Role View"
//           className="p-2.5 rounded-full border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition">
//           <ShieldAlert className="w-5 h-5 text-purple-400" />
//         </button>
//         <button 
//           onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
//           className="md:hidden p-2.5 rounded-full border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white transition">
//           {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//         </button>
//       </div>
//     </header>
//   );
// }

import React from 'react';
import { Menu, X, Flame, ShieldAlert } from 'lucide-react';

export default function Header({ 
  isExpanded, 
  setIsExpanded, 
  role, 
  setRole,
  userName
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/60 px-4 md:px-8 h-16 flex items-center justify-between select-none">
      
      {/* Left side: Pure Hamburger Menu + Brand Name */}
      <div className="flex items-center space-x-3">
        {/* On Desktop: No website icon appears before the hamburger menu */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="p-2 rounded-xl hover:bg-slate-900/80 text-slate-300 hover:text-white transition focus:outline-none"
          title="Toggle Navigation Sidebar"
        >
          {isExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Dynamic Desktop/Mobile Name Branding */}
        <div className="flex items-center space-x-2 animate-fade-in duration-300">
          <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-1.5 rounded-xl">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-wider text-slate-100">
            MEDIA<span className="text-purple-400">FLOW</span>
          </span>
        </div>
      </div>

      {/* Right side: Role toggle and Account information */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex flex-col items-end leading-tight mr-1">
          <span className="text-xs font-bold text-slate-200 line-clamp-1">{userName || 'Active User'}</span>
          <span className="text-[10px] font-extrabold tracking-wider text-purple-400 uppercase leading-normal">{role}</span>
        </div>

        <button 
          onClick={() => setRole(role === 'user' ? 'admin' : 'user')} 
          title={`Switch to ${role === 'user' ? 'Admin' : 'User'} view`}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 hover:border-slate-700 text-purple-400 hover:text-purple-300 transition"
        >
          <ShieldAlert className="w-5 h-5" />
        </button>
      </div>

    </header>
  );
}