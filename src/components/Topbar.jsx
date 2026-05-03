import React from 'react';
import { Search } from 'lucide-react';

export default function Topbar({ 
  searchQuery, 
  setSearchQuery, 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  activeTab 
}) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Responsive Large Context Search bar */}
        <div className="relative w-full md:w-[450px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab === 'explore' ? 'everything' : activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-purple-500 focus:bg-slate-900 transition text-slate-200 placeholder-slate-500"
          />
        </div>

        {/* Scrollable Category Filter Chips */}
        <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-purple-500/10 border-purple-400/50 text-purple-300' 
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}