import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import FeedTabNav from '../../components/feed/FeedTabNav';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Bookmark, FolderPlus, Layers } from 'lucide-react';

export default function SavedFeedPage() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedData() {
      try {
        setLoading(true);
        const [postsRes, colRes] = await Promise.all([
          api.get('/posts/saved'),
          api.get('/settings/collections').catch(() => ({ data: { collections: [] } }))
        ]);
        if (postsRes.data?.success) {
          setSavedPosts(postsRes.data.posts || []);
        }
        if (colRes.data?.success) {
          setCollections(colRes.data.collections || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSavedData();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      <FeedTabNav />

      {/* Collections Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-500 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Collections</h2>
            <p className="text-[11px] text-neutral-400">{collections.length} custom folders organized</p>
          </div>
        </div>
        <Link
          to="/collections"
          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition"
        >
          Manage Collections
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton type="grid" count={6} />
      ) : savedPosts.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Save posts you love"
          description="Bookmark photos and videos to revisit them anytime. Saved posts are strictly private to you."
          actionLabel="Explore Posts"
          actionLink="/explore"
        />
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-4">
          {savedPosts.map((post) => (
            <Link
              key={post._id}
              to={`/posts/${post._id}`}
              className="relative aspect-square group overflow-hidden rounded-xl sm:rounded-2xl bg-neutral-900"
            >
              <img
                src={post.media?.[0]?.url || ''}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-3">
                <span>❤️ {post.likesCount || 0}</span>
                <span>💬 {post.commentsCount || 0}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
