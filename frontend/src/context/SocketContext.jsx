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

    const newSocket = io('/', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      const uId = user._id || user.id;
      newSocket.emit('join_user', uId);
    });

    newSocket.on('new_notification', () => {
      setUnreadNotifications((prev) => prev + 1);
    });

    newSocket.on('conversation_updated', () => {
      setUnreadMessages((prev) => prev + 1);
    });

    newSocket.on('user_online', ({ userId }) => {
      setOnlineUserIds((prev) => new Set([...prev, userId]));
    });

    newSocket.on('user_offline', ({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

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
        onlineUserIds
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
