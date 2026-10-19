import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass, Heart, MessageCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function ExploreCategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryPosts = async () => {
      setLoading(true);
      try {
        // Look up by tag matching category or explore grid
        const res = await api.get(`/search/tag/${encodeURIComponent(category)}`);
        if (res.data?.success && res.data.posts?.length > 0) {
          setPosts(res.data.posts);
        } else {
          // fallback to explore grid
          const expRes = await api.get('/explore');
          setPosts(expRes.data?.posts || []);
        }
      } catch (err) {
        console.error('Category feed error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchCategoryPosts();
    }
  }, [category]);

  const formattedTitle = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Topic';

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <button
          onClick={() => navigate('/explore/topics')}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-pink-500" />
            <span>{formattedTitle} Discovery</span>
          </h1>
          <p className="text-xs text-neutral-400">Trending media in #{category}</p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-xs text-neutral-500">Loading {formattedTitle} posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-24 text-center space-y-2">
          <p className="text-xs text-neutral-400">No posts found in #{category} yet</p>
          <Link
            to="/create/post"
            className="inline-block px-4 py-2 mt-2 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white"
          >
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/posts/${post._id}`}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-md"
            >
              {post.media?.[0]?.type === 'video' ? (
                <video src={post.media[0].url} className="w-full h-full object-cover" muted />
              ) : (
                <img
                  src={post.media?.[0]?.url || '/placeholder.png'}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{post.likesCount || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{post.commentsCount || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
