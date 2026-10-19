import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import FeedTabNav from '../../components/feed/FeedTabNav';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Eye, Trash2 } from 'lucide-react';

export default function RecentlyViewedFeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecent() {
      try {
        setLoading(true);
        const res = await api.get('/posts/latest?limit=12');
        if (res.data?.success) {
          setPosts(res.data.posts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRecent();
  }, []);

  const handleClearHistory = () => {
    setPosts([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      <FeedTabNav />

      <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Recently Viewed Content</h2>
            <p className="text-[11px] text-neutral-400">Keep track of posts and media you recently inspected</p>
          </div>
        </div>

        {posts.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 hover:text-white transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton type="grid" count={6} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="No viewing history"
          description="Posts and reels you browse will appear in this history log for quick reference."
          actionLabel="Explore Feed"
          actionLink="/home"
        />
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-4">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/posts/${post._id}`}
              className="relative aspect-square group overflow-hidden rounded-xl sm:rounded-2xl bg-neutral-900"
            >
              <img
                src={post.media?.[0]?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-3">
                <span>View</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
