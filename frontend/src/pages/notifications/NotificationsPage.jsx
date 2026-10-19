import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Clock, 
  CheckCheck, 
  Loader2, 
  Bell 
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import NotificationsNav from '../../components/notifications/NotificationsNav';

export default function NotificationsPage({ onSelectUser }) {
  const { socket, setUnreadNotifications } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications?limit=30');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotif = (notif) => {
      if (notif) {
        setNotifications((prev) => [notif, ...prev.filter((n) => n._id !== notif._id)]);
      }
    };
    const handleReset = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };
    socket.on('new_notification', handleNewNotif);
    socket.on('notification:created', handleNewNotif);
    socket.on('notification_count_reset', handleReset);
    socket.on('notifications_marked_read', handleReset);
    return () => {
      socket.off('new_notification', handleNewNotif);
      socket.off('notification:created', handleNewNotif);
      socket.off('notification_count_reset', handleReset);
      socket.off('notifications_marked_read', handleReset);
    };
  }, [socket]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like_post':
      case 'like_reel':
      case 'like_comment':
        return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-purple-400" />;
      case 'follow_request':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-pink-400" />;
    }
  };

  const getText = (n) => {
    switch (n.type) {
      case 'like_post':
        return 'liked your post.';
      case 'like_reel':
        return 'liked your reel.';
      case 'comment':
        return `commented: "${n.text}"`;
      case 'follow':
        return 'started following you.';
      case 'follow_request':
        return 'requested to follow you.';
      default:
        return 'interacted with your account.';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4 space-y-4">
      <NotificationsNav />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
          <span>All Notifications</span>
        </h2>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-pink-500 font-semibold hover:text-pink-400 transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-500">
            <Bell className="w-6 h-6 stroke-[1.5]" />
          </div>
          <p className="text-sm font-semibold text-neutral-300">No notifications yet</p>
          <p className="text-xs text-neutral-500">When someone likes or comments on your posts, you'll see it here.</p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-800/60 bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                if (n.sender?.username && onSelectUser) {
                  onSelectUser(n.sender.username);
                }
              }}
              className={`flex items-center justify-between p-4 cursor-pointer transition ${
                n.isRead ? 'hover:bg-neutral-850/60' : 'bg-pink-500/5 hover:bg-pink-500/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                    {n.sender?.avatarUrl ? (
                      <img src={n.sender.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      n.sender?.username?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-neutral-900 border border-neutral-800 shadow">
                    {getIcon(n.type)}
                  </div>
                </div>

                <div className="text-xs leading-relaxed">
                  <p className="text-neutral-200">
                    <span className="font-bold text-neutral-100 mr-1.5">{n.sender?.username}</span>
                    <span>{getText(n)}</span>
                  </p>
                  <span className="text-[10px] text-neutral-500">
                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Media Thumbnail if notification relates to a post */}
              {n.post?.media?.[0]?.url && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-800 shrink-0">
                  <img src={n.post.media[0].url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
