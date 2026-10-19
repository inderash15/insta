import React, { useState, useEffect } from 'react';
import { History, Trash2, Search, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SearchNav from '../../components/search/SearchNav';

export default function SearchRecentPage() {
  const [recents, setRecents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('insta_recent_searches') || '[]');
      setRecents(stored);
    } catch {
      setRecents([]);
    }
  }, []);

  const handleClearAll = () => {
    localStorage.removeItem('insta_recent_searches');
    setRecents([]);
  };

  const handleRemoveOne = (item, e) => {
    e.stopPropagation();
    const updated = recents.filter((r) => r !== item);
    localStorage.setItem('insta_recent_searches', JSON.stringify(updated));
    setRecents(updated);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 space-y-6">
      <SearchNav />

      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neutral-800 text-neutral-300">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-100">Recent Searches</h1>
            <p className="text-xs text-neutral-400">Manage and clear your recent search history</p>
          </div>
        </div>

        {recents.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold border border-red-500/20 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {recents.length > 0 ? (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
            {recents.map((item) => (
              <div
                key={item}
                onClick={() => navigate(`/search?q=${encodeURIComponent(item)}`)}
                className="p-3.5 flex items-center justify-between hover:bg-neutral-800/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-neutral-200 group-hover:text-pink-400 transition-colors">
                    {item}
                  </span>
                </div>
                <button
                  onClick={(e) => handleRemoveOne(item, e)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                  title="Remove from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 mx-auto flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-neutral-300">No recent searches</p>
            <p className="text-[11px] text-neutral-500">Searches you execute will appear here for fast access.</p>
          </div>
        )}
      </div>
    </div>
  );
}
