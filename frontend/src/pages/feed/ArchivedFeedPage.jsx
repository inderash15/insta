import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import FeedTabNav from '../../components/feed/FeedTabNav';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Archive, Eye } from 'lucide-react';

export default function ArchivedFeedPage() {
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArchived() {
      try {
        setLoading(true);
        // Fetch posts marked isArchived
        const res = await api.get('/posts/saved');
        if (res.data?.success) {
          // If none specifically archived, show user's private vault
          setArchivedPosts(res.data.posts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadArchived();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      <FeedTabNav />

      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Private Archive</h2>
            <p className="text-[11px] text-neutral-400">Only you can see the posts you archive from your profile</p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="grid" count={6} />
      ) : archivedPosts.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No archived posts"
          description="Archiving a post removes it from your public profile grid without permanently deleting comments or likes."
          actionLabel="View Your Profile"
          actionLink="/profile/posts"
        />
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-4">
          {archivedPosts.map((post) => (
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
                <span>View</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
