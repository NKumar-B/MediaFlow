import React from 'react';
import { Search } from 'lucide-react';

export default function SubHeaderFilters({ 
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  categories, 
  selectedCategory, 
  setSelectedCategory 
}) {
  return (
    <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Field */}
      <div className="relative w-full md:w-96">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder={`Search ${activeTab === 'explore' ? 'everything' : activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/60 focus:bg-slate-900/60 focus:ring-4 focus:ring-purple-500/10 transition-all text-slate-200 placeholder-slate-500"
        />
      </div>

      {/* Category Scrolling Bar */}
      <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap ${
              selectedCategory === cat 
                ? 'bg-purple-500/10 border-purple-400/50 text-purple-300' 
                : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}>
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
}