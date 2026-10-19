import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Tag } from 'lucide-react';

export default function ProfileTaggedPage() {
  const { user } = useAuth();
  const [taggedPosts, setTaggedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTagged() {
      try {
        setLoading(true);
        const res = await api.get('/posts/latest?limit=20');
        if (res.data?.success) {
          const tagged = (res.data.posts || []).filter(
            (p) => p.mentions?.includes(user?.username) || p.caption?.includes(`@${user?.username}`)
          );
          setTaggedPosts(tagged);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTagged();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 text-neutral-100">
      <PageHeader
        title="Tagged Content"
        subtitle="Photos and videos that other creators have tagged you in."
        showBack
      />

      {loading ? (
        <LoadingSkeleton type="grid" count={6} />
      ) : taggedPosts.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Photos of you"
          description="When people tag you in photos and videos, they'll appear here."
        />
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-4">
          {taggedPosts.map((post) => (
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
                <span>View Tag</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
