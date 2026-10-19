import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, UserPlus } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StoryTray from '../../components/feed/StoryTray';
import PostCard from '../../components/feed/PostCard';
import PostDetailModal from '../../components/modals/PostDetailModal';
import CreateModal from '../../components/modals/CreateModal';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const fetchFeed = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get(`/posts/feed?page=${pageNum}&limit=10`);
      if (res.data?.success) {
        if (pageNum === 1) {
          setPosts(res.data.posts || []);
        } else {
          setPosts((prev) => [...prev, ...(res.data.posts || [])]);
        }
        setHasMore(res.data.hasMore);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Error fetching feed:', err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await api.get('/search/users?q=a');
      if (res.data?.users) {
        setSuggestions(res.data.users.slice(0, 5));
      }
    } catch {}
  };

  useEffect(() => {
    fetchFeed(1);
    fetchSuggestions();
  }, []);

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex gap-8 justify-center py-4 px-2 sm:px-4">
      {/* Left / Center Feed Stream */}
      <div className="w-full max-w-xl">
        {/* Story Tray */}
        <StoryTray onOpenCreateStory={() => setIsCreateOpen(true)} />

        {/* Posts Stream */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
            <p className="text-xs text-neutral-500">Loading your feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-pink-500/10 text-pink-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-100">Welcome to Insta!</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Your feed is quiet right now. Follow other creators or share your first post or reel!
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white insta-story-gradient hover:opacity-90 transition shadow-lg shadow-pink-500/20"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onOpenComments={(id) => setSelectedPostId(id)}
                onPostDeleted={handlePostDeleted}
              />
            ))}

            {hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={() => fetchFeed(page + 1)}
                  disabled={loadingMore}
                  className="px-5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  {loadingMore ? 'Loading more posts...' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Desktop Suggestions Sidebar */}
      <div className="hidden lg:block w-72 shrink-0 space-y-5 pt-2">
        {/* User Mini Profile */}
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full insta-story-gradient p-0.5">
              <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center font-bold text-sm uppercase overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.username?.charAt(0) || 'U'
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-100 flex items-center gap-1">
                <span>{user?.username}</span>
                {user?.isVerified && <span className="text-blue-400 text-[10px]">✓</span>}
              </p>
              <p className="text-[11px] text-neutral-400 truncate max-w-[130px]">{user?.fullName}</p>
            </div>
          </div>
        </div>

        {/* Suggested Accounts */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs px-2">
              <span className="font-bold text-neutral-400">Suggested for you</span>
              <span className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-300 cursor-pointer">See All</span>
            </div>

            <div className="space-y-2">
              {suggestions.map((sug) => (
                <div key={sug._id} className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-900/60 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                      {sug.avatarUrl ? (
                        <img src={sug.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        sug.username?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-200">{sug.username}</p>
                      <p className="text-[10px] text-neutral-500">{sug.fullName}</p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        await api.post(`/users/${sug._id}/follow`);
                        setSuggestions((prev) => prev.filter((u) => u._id !== sug._id));
                      } catch {}
                    }}
                    className="text-xs font-bold text-pink-500 hover:text-pink-400 transition"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subtle Footer */}
        <div className="text-[11px] text-neutral-600 px-2 space-y-2">
          <p>About • Help • Press • API • Jobs • Privacy • Terms</p>
          <p>© 2026 INSTA FROM META</p>
        </div>
      </div>

      {/* Post Detail Comments Modal */}
      {selectedPostId && (
        <PostDetailModal
          postId={selectedPostId}
          isOpen={!!selectedPostId}
          onClose={() => setSelectedPostId(null)}
          onPostDeleted={handlePostDeleted}
        />
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <CreateModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => fetchFeed(1)}
        />
      )}
    </div>
  );
}
