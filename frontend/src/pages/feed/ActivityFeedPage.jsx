import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import FeedTabNav from '../../components/feed/FeedTabNav';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Activity, Heart, MessageCircle, UserPlus, Bookmark } from 'lucide-react';

export default function ActivityFeedPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      try {
        setLoading(true);
        const res = await api.get('/notifications');
        if (res.data?.success) {
          setNotifications(res.data.notifications || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-2 sm:px-4 space-y-4">
      <FeedTabNav />

      {loading ? (
        <LoadingSkeleton type="list" count={4} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No recent activity"
          description="When friends interact with your content or when you interact across Insta, timeline logs show here."
          actionLabel="Explore Feed"
          actionLink="/home"
        />
      ) : (
        <div className="divide-y divide-neutral-800 rounded-3xl border border-neutral-800 bg-neutral-900/40 p-2 overflow-hidden">
          {notifications.map((notif) => (
            <div key={notif._id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 shrink-0">
                  {notif.sender?.avatarUrl ? (
                    <img src={notif.sender.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400">
                      {notif.sender?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white">
                    <span className="font-semibold">@{notif.sender?.username}</span>{' '}
                    <span className="text-neutral-400">
                      {notif.type === 'like_post' && 'liked your post'}
                      {notif.type === 'comment' && 'commented on your photo'}
                      {notif.type === 'follow' && 'started following you'}
                      {notif.type === 'mention' && 'mentioned you'}
                    </span>
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {notif.post?.media?.[0]?.url && (
                <Link to={`/posts/${notif.post._id}`} className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-neutral-800">
                  <img src={notif.post.media[0].url} alt="" className="w-full h-full object-cover" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
