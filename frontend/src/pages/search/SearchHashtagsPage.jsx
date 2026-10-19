import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Hash, Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import SearchNav from '../../components/search/SearchNav';

export default function SearchHashtagsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setHashtags([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/search/hashtags?q=${encodeURIComponent(query.trim())}`);
        setHashtags(res.data?.hashtags || []);
      } catch (err) {
        console.error('Hashtags search error:', err.message);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 space-y-6">
      <SearchNav />

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Hash className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchParams(e.target.value ? { q: e.target.value } : {});
          }}
          placeholder="Search hashtags (e.g. photography, travel, art)..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-pink-500 shadow-md transition-colors"
          autoFocus
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {hashtags.length > 0 ? (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
            {hashtags.map((h) => (
              <Link
                key={h.tag}
                to={`/feed/hashtags?tag=${encodeURIComponent(h.tag)}`}
                className="p-3.5 flex items-center justify-between hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                    #
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-200">#{h.tag}</p>
                    <p className="text-[11px] text-neutral-400">{h.count} public posts</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500" />
              </Link>
            ))}
          </div>
        ) : query.trim() && !loading ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-xs text-neutral-400">No hashtags found matching #{query}</p>
            <p className="text-[11px] text-neutral-500">Try a different keyword</p>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-neutral-500">
            Search for hashtags to explore trending themes.
          </div>
        )}
      </div>
    </div>
  );
}
