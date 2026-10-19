import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FeedTabNav from '../../components/feed/FeedTabNav';
import PostCard from '../../components/feed/PostCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Users } from 'lucide-react';

export default function FollowingFeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFollowingFeed() {
      try {
        setLoading(true);
        const res = await api.get('/posts/feed?limit=20');
        if (res.data?.success) {
          setPosts(res.data.posts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFollowingFeed();
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-2 sm:px-4">
      <FeedTabNav />

      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No posts from accounts you follow"
          description="Follow creators from the Explore page to populate your following feed."
          actionLabel="Explore Creators"
          actionLink="/explore/people"
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
