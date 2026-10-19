import React, { useState, useEffect } from 'react';
import { Search, Users, Hash, Image, Loader2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import SearchNav from '../../components/search/SearchNav';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setHashtags([]);
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [uRes, hRes, pRes] = await Promise.all([
          api.get(`/search/users?q=${encodeURIComponent(query.trim())}&limit=5`),
          api.get(`/search/hashtags?q=${encodeURIComponent(query.trim())}`),
          api.get(`/search/posts?q=${encodeURIComponent(query.trim())}&limit=6`)
        ]);

        setUsers(uRes.data?.users || []);
        setHashtags(hRes.data?.hashtags || []);
        setPosts(pRes.data?.posts || []);

        // Record in recent searches
        try {
          const recents = JSON.parse(localStorage.getItem('insta_recent_searches') || '[]');
          const updated = [query.trim(), ...recents.filter((item) => item !== query.trim())].slice(0, 10);
          localStorage.setItem('insta_recent_searches', JSON.stringify(updated));
        } catch {}
      } catch (err) {
        console.error('Unified search error:', err.message);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 space-y-6">
      <SearchNav />

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people, tags, keywords, or topics..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-pink-500 shadow-md transition-colors"
          autoFocus
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
          </div>
        )}
      </div>

      {!query.trim() ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-neutral-200">Search Insta</p>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Find friends, trending hashtags, photos, videos, and discover vibrant creators.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* People Section */}
          {users.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  <span>People</span>
                </span>
                <Link to={`/search/people?q=${encodeURIComponent(query)}`} className="text-pink-400 hover:underline text-[11px]">
                  View all
                </Link>
              </div>
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60">
                {users.map((u) => (
                  <Link
                    key={u._id}
                    to={`/users/${u.username}`}
                    className="p-3 flex items-center gap-3 hover:bg-neutral-800/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-xs text-white">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        u.username[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-200">@{u.username}</p>
                      <p className="text-[11px] text-neutral-400">{u.fullName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Hashtags Section */}
          {hashtags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hashtags</span>
                </span>
                <Link to={`/search/hashtags?q=${encodeURIComponent(query)}`} className="text-pink-400 hover:underline text-[11px]">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {hashtags.slice(0, 6).map((h) => (
                  <Link
                    key={h.tag}
                    to={`/feed/hashtags?tag=${encodeURIComponent(h.tag)}`}
                    className="p-3 bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 rounded-xl flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-medium text-neutral-200 truncate">#{h.tag}</span>
                    <span className="text-[10px] text-neutral-500 shrink-0">{h.count} posts</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {posts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-sky-400" />
                  <span>Posts</span>
                </span>
                <Link to={`/search/posts?q=${encodeURIComponent(query)}`} className="text-pink-400 hover:underline text-[11px]">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {posts.map((p) => (
                  <Link
                    key={p._id}
                    to={`/posts/${p._id}`}
                    className="aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 group relative"
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
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!loading && users.length === 0 && hashtags.length === 0 && posts.length === 0 && (
            <div className="py-12 text-center text-xs text-neutral-500">
              No results found for &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
