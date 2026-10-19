import React, { useState, useEffect } from 'react';
import { Compass, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ExploreNav from '../../components/explore/ExploreNav';

export default function ExploreLandingPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExplore = async () => {
      setLoading(true);
      try {
        const res = await api.get('/explore');
        if (res.data?.success) {
          setPosts(res.data.posts || []);
        }
      } catch (err) {
        console.error('Explore landing error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExplore();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 space-y-6">
      <ExploreNav />

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-xs text-neutral-500">Discovering trending content...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 mx-auto flex items-center justify-center">
            <Compass className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-neutral-200">No public posts yet</p>
          <p className="text-xs text-neutral-500">Create the first post to illuminate the Explore grid!</p>
          <Link
            to="/create/post"
            className="inline-block px-4 py-2 mt-2 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white"
          >
            Create Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {posts.map((post, idx) => {
            const isFeatured = idx % 7 === 0;
            return (
              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                className={`group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/80 shadow-md ${
                  isFeatured ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
                }`}
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

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5 text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-neutral-800 overflow-hidden text-[10px] flex items-center justify-center font-bold">
                      {post.author?.avatarUrl ? (
                        <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        post.author?.username?.[0]?.toUpperCase()
                      )}
                    </div>
                    <span className="text-xs font-medium">@{post.author?.username}</span>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-white" />
                      <span>{post.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>{post.commentsCount || 0}</span>
                    </div>
                  </div>
                  <div />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
