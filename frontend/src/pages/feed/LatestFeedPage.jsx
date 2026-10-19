import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FeedTabNav from '../../components/feed/FeedTabNav';
import PostCard from '../../components/feed/PostCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Clock } from 'lucide-react';

export default function LatestFeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLatestFeed() {
      try {
        setLoading(true);
        const res = await api.get('/posts/latest?limit=25');
        if (res.data?.success) {
          setPosts(res.data.posts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLatestFeed();
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-2 sm:px-4">
      <FeedTabNav />

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No recent posts"
          description="Be the first to share a post today!"
          actionLabel="Create Post"
          actionLink="/create/post"
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
