import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageCircle, Hash, User, Loader2, Sparkles } from 'lucide-react';
import api from '../../services/api';
import PostDetailModal from '../../components/modals/PostDetailModal';

export default function ExplorePage({ onSelectUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], hashtags: [] });
  const [trendingTags, setTrendingTags] = useState([]);
  const [explorePosts, setExplorePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Fetch explore grid & trending hashtags
  useEffect(() => {
    const fetchExplore = async () => {
      setLoading(true);
      try {
        const [postsRes, tagsRes] = await Promise.all([
          api.get('/explore'),
          api.get('/explore/trending-hashtags')
        ]);
        setExplorePosts(postsRes.data?.posts || []);
        setTrendingTags(tagsRes.data?.hashtags || []);
      } catch (err) {
        console.error('Error fetching explore:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExplore();
  }, []);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ users: [], hashtags: [] });
      setSearching(false);
      return;
    }

    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const [usersRes, tagsRes] = await Promise.all([
          api.get(`/search/users?q=${encodeURIComponent(searchQuery.trim())}`),
          api.get(`/search/hashtags?q=${encodeURIComponent(searchQuery.trim())}`)
        ]);
        setSearchResults({
          users: usersRes.data?.users || [],
          hashtags: tagsRes.data?.hashtags || []
        });
      } catch (err) {
        console.error('Search error:', err.message);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Search Header Bar */}
      <div className="relative max-w-lg mx-auto">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts or #hashtags..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-pink-500 transition shadow-inner"
          />
          {searching && (
            <Loader2 className="w-4 h-4 text-pink-500 animate-spin absolute right-3.5" />
          )}
        </div>

        {/* Live Search Autocomplete Dropdown */}
        {searchQuery.trim() && (
          <div className="absolute top-12 inset-x-0 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 max-h-80 overflow-y-auto">
            {searchResults.users.length === 0 && searchResults.hashtags.length === 0 && !searching ? (
              <div className="p-4 text-center text-xs text-neutral-500">No results found for "{searchQuery}"</div>
            ) : (
              <>
                {searchResults.users.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => {
                      if (onSelectUser) onSelectUser(u.username);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-800/80 cursor-pointer transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        u.username?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-100 flex items-center gap-1">
                        <span>{u.username}</span>
                        {u.isVerified && <span className="text-blue-400 text-[10px]">✓</span>}
                      </p>
                      <p className="text-[10px] text-neutral-400">{u.fullName}</p>
                    </div>
                  </div>
                ))}

                {searchResults.hashtags.map((tag) => (
                  <div
                    key={tag}
                    onClick={() => {
                      setSearchQuery('#' + tag);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-800/80 cursor-pointer transition text-xs text-blue-400"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Hash className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold">#{tag}</p>
                      <p className="text-[10px] text-neutral-500">Trending tag</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Trending Tags Chips */}
      {trendingTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1 text-xs font-bold text-neutral-400 pl-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Trending:</span>
          </div>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery('#' + tag)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-pink-500 transition shrink-0"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Explore Media Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
          <p className="text-xs text-neutral-500">Curating explore grid...</p>
        </div>
      ) : explorePosts.length === 0 ? (
        <div className="py-20 text-center text-xs text-neutral-500">
          No explore posts yet. Be the first to share something exciting!
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
          {explorePosts.map((post) => (
            <div
              key={post._id}
              onClick={() => setSelectedPostId(post._id)}
              className="relative aspect-square bg-neutral-900 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer group"
            >
              {post.media?.[0]?.type === 'video' ? (
                <video src={post.media[0].url} className="w-full h-full object-cover" />
              ) : (
                <img src={post.media?.[0]?.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              )}

              {/* Hover overlay with Like & Comment counters */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white text-xs sm:text-sm font-bold transition duration-200">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{post.likesCount || 0}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{post.commentsCount || 0}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPostId && (
        <PostDetailModal
          postId={selectedPostId}
          isOpen={!!selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </div>
  );
}
