import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FeedTabNav from '../../components/feed/FeedTabNav';
import PostCard from '../../components/feed/PostCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Hash } from 'lucide-react';

export default function HashtagsFeedPage() {
  const [selectedTag, setSelectedTag] = useState('design');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const popularTags = ['design', 'photography', 'travel', 'nature', 'technology', 'art'];

  useEffect(() => {
    async function loadHashtagPosts() {
      try {
        setLoading(true);
        const res = await api.get(`/posts/latest?limit=25`);
        if (res.data?.success) {
          const matching = (res.data.posts || []).filter(
            (p) => p.hashtags?.includes(selectedTag) || p.caption?.toLowerCase().includes(`#${selectedTag}`)
          );
          setPosts(matching.length > 0 ? matching : res.data.posts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHashtagPosts();
  }, [selectedTag]);

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-2 sm:px-4 space-y-4">
      <FeedTabNav />

      {/* Hashtag Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {popularTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              selectedTag === tag
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-500/20'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={2} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Hash}
          title={`No posts tagged #${selectedTag}`}
          description="Create a post with this hashtag to start the discussion!"
          actionLabel="Create Tagged Post"
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
