// import React from 'react';
// import { Compass, Music, Film, LogOut, ChevronRight, LayoutGrid, Flame, Menu } from 'lucide-react';

// export default function Sidebar({ 
//   activeTab, 
//   setActiveTab, 
//   isExpanded, 
//   setIsExpanded, 
//   logout, 
//   role 
// }) {
//   const tabs = [
//     { id: 'explore', label: 'Explore', icon: Compass },
//     { id: 'music', label: 'Music Feed', icon: Music },
//     { id: 'movies', label: 'Movies Feed', icon: Film },
//   ];

//   return (
//     <aside 
//       className={`fixed top-0 left-0 h-full bg-slate-950/70 border-r border-slate-800/60 backdrop-blur-xl z-50 flex flex-col justify-between transition-all duration-300 select-none ${
//         isExpanded ? 'w-64' : 'w-20'
//       }`}
//     >
//       {/* Upper Top Hub Menu Bar */}
//       <div className="flex flex-col">
//         <div className={`h-16 flex items-center px-4 border-b border-slate-800/40 gap-3 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
//           <button 
//             onClick={() => setIsExpanded(!isExpanded)} 
//             className="p-2.5 rounded-full hover:bg-slate-900/80 text-slate-300 hover:text-white transition"
//           >
//             <Menu className="w-6 h-6" />
//           </button>
//           {isExpanded && (
//             <div className="flex items-center space-x-2 animate-fade-in">
//               <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-1.5 rounded-xl">
//                 <Flame className="w-5 h-5 text-white" />
//               </div>
//               <span className="text-lg font-black tracking-wider text-slate-100">
//                 MEDIA<span className="text-purple-400">FLOW</span>
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Active Application Context Controls */}
//         <nav className="flex flex-col p-3 gap-1.5 mt-4">
//           {tabs.map((tab) => {
//             const Icon = tab.icon;
//             const isActive = activeTab === tab.id;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition duration-300 ${
//                   isActive 
//                     ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/10 text-purple-300 border border-purple-500/30' 
//                     : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
//                 }`}
//               >
//                 <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
//                 {isExpanded && <span className="text-sm font-bold tracking-wide animate-fade-in">{tab.label}</span>}
//               </button>
//             );
//           })}
//         </nav>
//       </div>

//       {/* Account Info and Logout Controls */}
//       <div className="p-3 mb-4 flex flex-col gap-2">
//         {isExpanded && (
//           <div className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl mb-2 flex items-center justify-between animate-fade-in">
//             <div className="flex flex-col">
//               <span className="text-xs font-black tracking-widest text-slate-400 uppercase">Current Account</span>
//               <span className="text-xs font-medium text-slate-200 mt-0.5 line-clamp-1">{role.toUpperCase()} View</span>
//             </div>
//             <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
//           </div>
//         )}
//         <button 
//           onClick={logout} 
//           className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent transition"
//         >
//           <LogOut className="w-5 h-5" />
//           {isExpanded && <span className="text-sm font-bold tracking-wide animate-fade-in">Sign Out</span>}
//         </button>
//       </div>
//     </aside>
//   );
// }


import React from 'react';
import { Compass, Music, Film, LogOut, ChevronRight, Flame, Menu, X } from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isExpanded, 
  setIsExpanded, 
  logout, 
  role 
}) {
  const tabs = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'music', label: 'Music Feed', icon: Music },
    { id: 'movies', label: 'Movies Feed', icon: Film },
  ];

  return (
    <>
      {/* Tap outside to close backdrop overlay on mobile */}
      {isExpanded && (
        <div 
          onClick={() => setIsExpanded(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      <aside 
        className={`fixed top-0 left-0 h-full bg-slate-950/80 border-r border-slate-800/60 backdrop-blur-xl z-50 flex flex-col justify-between transition-all duration-300 select-none ${
          isExpanded ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          <div className="h-16 flex items-center px-4 border-b border-slate-800/40 justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-1.5 rounded-xl">
                <Flame className="w-5 h-5 text-white" />
              </div>
              {isExpanded && (
                <span className="text-lg font-black tracking-wider text-slate-100 animate-fade-in">
                  MEDIA<span className="text-purple-400">FLOW</span>
                </span>
              )}
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="p-2.5 rounded-full hover:bg-slate-900/80 text-slate-300 transition"
            >
              {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <nav className="flex flex-col p-3 gap-1.5 mt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (window.innerWidth < 768) setIsExpanded(false);
                  }}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/10 text-purple-300 border border-purple-500/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                  {isExpanded && <span className="text-sm font-bold tracking-wide animate-fade-in">{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 mb-4 flex flex-col gap-2">
          {isExpanded && (
            <div className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-2xl mb-2 flex items-center justify-between animate-fade-in">
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-widest text-slate-400 uppercase">Current Role</span>
                <span className="text-xs font-medium text-slate-200 mt-0.5">{role.toUpperCase()}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </div>
          )}
          <button 
            onClick={logout} 
            className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-300 transition"
          >
            <LogOut className="w-5 h-5" />
            {isExpanded && <span className="text-sm font-bold tracking-wide animate-fade-in">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}