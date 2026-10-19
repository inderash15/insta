import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FeedTabNav from '../../components/feed/FeedTabNav';
import PostCard from '../../components/feed/PostCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { AtSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MentionsFeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMentions() {
      try {
        setLoading(true);
        const res = await api.get(`/posts/latest?limit=20`);
        if (res.data?.success) {
          // Filter posts where mentions contain user.username
          const mentions = (res.data.posts || []).filter(
            (p) => p.mentions?.includes(user?.username) || p.caption?.includes(`@${user?.username}`)
          );
          setPosts(mentions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMentions();
  }, [user]);

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-2 sm:px-4">
      <FeedTabNav />

      {loading ? (
        <LoadingSkeleton type="card" count={2} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={AtSign}
          title="No mentions yet"
          description={`When friends tag @${user?.username} in post captions or comments, they'll be organized here.`}
          actionLabel="View Activity"
          actionLink="/activity"
        />
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
