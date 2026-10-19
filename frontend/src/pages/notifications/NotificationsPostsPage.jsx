import React, { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import NotificationsNav from '../../components/notifications/NotificationsNav';

export default function NotificationsPostsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await api.get('/notifications?type=posts');
        if (res.data?.success) {
          setNotifications(res.data.notifications || []);
        }
      } catch (err) {
        console.error('Failed to load post notifications:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-4">
      <NotificationsNav />

      <div className="border-b border-neutral-800 pb-3">
        <h1 className="text-base font-bold text-neutral-100 flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span>Post Interactions & Likes</span>
        </h1>
        <p className="text-xs text-neutral-400">Reactions and likes on your content</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-20 text-center space-y-2 text-neutral-500 text-xs">
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
            <Heart className="w-6 h-6" />
          </div>
          <p className="font-semibold text-neutral-300">No post interactions yet</p>
          <p>Likes and reactions on your posts and reels will appear here.</p>
        </div>
      ) : (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
          {notifications.map((n) => (
            <div key={n._id} className="p-3.5 flex items-center justify-between hover:bg-neutral-800/40 transition-colors">
              <Link to={`/users/${n.sender?.username}`} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center font-bold text-xs text-white">
                  {n.sender?.avatarUrl ? (
                    <img src={n.sender.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    n.sender?.username?.[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs text-neutral-200">
                    <span className="font-semibold">@{n.sender?.username}</span> liked your post.
                  </p>
                  <span className="text-[10px] text-neutral-500">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
              {n.post && (
                <Link to={`/posts/${n.post._id || n.post}`}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-800">
                    {n.post.media?.[0]?.url && (
                      <img src={n.post.media[0].url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
