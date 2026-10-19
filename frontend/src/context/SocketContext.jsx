import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  const [lastSeenMap, setLastSeenMap] = useState({});

  // Fetch initial badge counts
  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      setUnreadMessages(0);
      return;
    }

    const fetchCounts = async () => {
      try {
        const [notifRes, convRes] = await Promise.all([
          api.get('/notifications?limit=1'),
          api.get('/conversations')
        ]);
        if (notifRes.data?.unreadCount !== undefined) {
          setUnreadNotifications(notifRes.data.unreadCount);
        }
        if (convRes.data?.conversations) {
          const totalUnread = convRes.data.conversations.reduce(
            (acc, c) => acc + (c.unreadCount || 0),
            0
          );
          setUnreadMessages(totalUnread);
        }
      } catch (err) {
        // Silent fail
      }
    };

    fetchCounts();
  }, [user]);

  // Connect socket
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketEndpoint =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '/');

    let token = null;
    try {
      token = localStorage.getItem('insta_token');
    } catch {}

    const newSocket = io(socketEndpoint, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      const uId = user._id || user.id;
      newSocket.emit('join_user', uId);
      newSocket.emit('presence:subscribe', { userId: uId });
    });

    newSocket.io.on('reconnect', () => {
      const uId = user._id || user.id;
      newSocket.emit('join_user', uId);
      newSocket.emit('presence:subscribe', { userId: uId });
      // Recover latest badge counts on reconnect
      api.get('/notifications?limit=1')
        .then((res) => {
          if (res.data?.unreadCount !== undefined) {
            setUnreadNotifications(res.data.unreadCount);
          }
        })
        .catch(() => {});
      api.get('/conversations')
        .then((res) => {
          if (res.data?.conversations) {
            const totalUnread = res.data.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
            setUnreadMessages(totalUnread);
          }
        })
        .catch(() => {});
    });

    newSocket.on('new_notification', () => {
      setUnreadNotifications((prev) => prev + 1);
    });

    newSocket.on('notification:created', () => {
      setUnreadNotifications((prev) => prev + 1);
    });

    newSocket.on('notification_count_reset', () => {
      setUnreadNotifications(0);
    });

    newSocket.on('notifications_marked_read', () => {
      setUnreadNotifications(0);
    });

    newSocket.on('notification:read', () => {
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
    });

    newSocket.on('conversation_updated', () => {
      setUnreadMessages((prev) => prev + 1);
    });

    newSocket.on('messages_read', ({ userId }) => {
      const uId = (user._id || user.id)?.toString();
      if (userId === uId) {
        setUnreadMessages((prev) => Math.max(0, prev - 1));
      }
    });

    const handleOnlineList = ({ userIds, onlineUserIds: list }) => {
      setOnlineUserIds(new Set(userIds || list || []));
    };

    const handleUserOnline = ({ userId }) => {
      if (userId) {
        setOnlineUserIds((prev) => new Set([...prev, userId.toString()]));
      }
    };

    const handleUserOffline = ({ userId, lastActiveAt }) => {
      if (userId) {
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.delete(userId.toString());
          return next;
        });
        if (lastActiveAt) {
          setLastSeenMap((prev) => ({ ...prev, [userId.toString()]: lastActiveAt }));
        }
      }
    };

    newSocket.on('online_users_list', handleOnlineList);
    newSocket.on('presence:update', handleOnlineList);
    newSocket.on('user_online', handleUserOnline);
    newSocket.on('presence:online', handleUserOnline);
    newSocket.on('user_offline', handleUserOffline);
    newSocket.on('presence:offline', handleUserOffline);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        unreadNotifications,
        setUnreadNotifications,
        unreadMessages,
        setUnreadMessages,
        onlineUserIds,
        lastSeenMap
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
