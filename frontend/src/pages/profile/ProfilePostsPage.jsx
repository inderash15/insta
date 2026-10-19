import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Grid, Plus } from 'lucide-react';

export default function ProfilePostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOwnPosts() {
      try {
        setLoading(true);
        if (user?.username) {
          const res = await api.get(`/posts/user/${user.username}`);
          if (res.data?.success) {
            setPosts(res.data.posts || []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOwnPosts();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="My Posts"
        subtitle={`All ${posts.length} published photos and galleries on your profile.`}
        showBack
        actions={
          <Link
            to="/create/post"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl insta-story-gradient text-white text-xs font-semibold shadow-md shadow-pink-500/20 hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Post</span>
          </Link>
        }
      />

      {loading ? (
        <LoadingSkeleton type="grid" count={6} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Grid}
          title="Share Photos"
          description="When you share photos, they will appear on your profile."
          actionLabel="Share your first photo"
          actionLink="/create/post"
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
