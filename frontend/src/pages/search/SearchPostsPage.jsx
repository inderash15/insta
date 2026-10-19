import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Image, Loader2, Heart, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import SearchNav from '../../components/search/SearchNav';

export default function SearchPostsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/search/posts?q=${encodeURIComponent(query.trim())}&limit=30`);
        setPosts(res.data?.posts || []);
      } catch (err) {
        console.error('Posts search error:', err.message);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      <SearchNav />

      <div className="max-w-xl mx-auto relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchParams(e.target.value ? { q: e.target.value } : {});
          }}
          placeholder="Search posts by keywords, captions, or subjects..."
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
        {posts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {posts.map((p) => (
              <Link
                key={p._id}
                to={`/posts/${p._id}`}
                className="group relative aspect-square bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800"
              >
                {p.media?.[0]?.type === 'video' ? (
                  <video src={p.media[0].url} className="w-full h-full object-cover" muted />
                ) : (
                  <img
                    src={p.media?.[0]?.url || '/placeholder.png'}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-semibold">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{p.likesCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>{p.commentsCount || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : query.trim() && !loading ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-xs text-neutral-400">No posts found containing &ldquo;{query}&rdquo;</p>
            <p className="text-[11px] text-neutral-500">Try searching for broader keywords</p>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-neutral-500">
            Type keywords to search published posts.
          </div>
        )}
      </div>
    </div>
  );
}
