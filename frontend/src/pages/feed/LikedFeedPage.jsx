import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import FeedTabNav from '../../components/feed/FeedTabNav';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Heart } from 'lucide-react';

export default function LikedFeedPage() {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLikedPosts() {
      try {
        setLoading(true);
        const res = await api.get('/posts/liked');
        if (res.data?.success) {
          setLikedPosts(res.data.posts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLikedPosts();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      <FeedTabNav />

      {loading ? (
        <LoadingSkeleton type="grid" count={6} />
      ) : likedPosts.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Posts you've liked"
          description="When you like photos and reels, they will appear in this private archive."
          actionLabel="Go to Feed"
          actionLink="/home"
        />
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-4">
          {likedPosts.map((post) => (
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
                <span className="text-red-400">❤️ {post.likesCount || 0}</span>
                <span>💬 {post.commentsCount || 0}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
