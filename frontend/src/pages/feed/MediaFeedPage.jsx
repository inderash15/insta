import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import FeedTabNav from '../../components/feed/FeedTabNav';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Image as ImageIcon } from 'lucide-react';

export default function MediaFeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMediaFeed() {
      try {
        setLoading(true);
        const res = await api.get('/posts/latest?limit=30');
        if (res.data?.success) {
          setPosts(res.data.posts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMediaFeed();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      <FeedTabNav />

      {loading ? (
        <LoadingSkeleton type="grid" count={9} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No visual media found"
          description="Upload high-resolution photography to view them in the media gallery."
          actionLabel="Upload Media"
          actionLink="/create/post"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/posts/${post._id}`}
              className="relative aspect-square group overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800/80 shadow-sm"
            >
              <img
                src={post.media?.[0]?.url || ''}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-3 flex flex-col justify-end text-white text-xs">
                <p className="font-semibold truncate">@{post.author?.username}</p>
                <p className="text-[10px] text-neutral-300 truncate">{post.caption || 'No caption'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
