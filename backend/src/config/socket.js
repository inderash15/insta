import { Server } from 'socket.io';
import { env } from './env.js';

let ioInstance = null;

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  const onlineUsers = new Map(); // userId -> Set of socket.ids

  ioInstance.on('connection', (socket) => {
    let currentUserId = null;

    // Join user room for targeted notifications and direct messages
    socket.on('join_user', (userId) => {
      if (userId) {
        currentUserId = userId.toString();
        socket.join(`user:${currentUserId}`);

        if (!onlineUsers.has(currentUserId)) {
          onlineUsers.set(currentUserId, new Set());
          ioInstance.emit('user_online', { userId: currentUserId });
        }
        onlineUsers.get(currentUserId).add(socket.id);
      }
    });

    // Join specific conversation room
    socket.on('join_conversation', (conversationId) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    // Typing status
    socket.on('typing_start', ({ conversationId, userId, username }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_start', {
        conversationId,
        userId,
        username
      });
    });

    socket.on('typing_stop', ({ conversationId, userId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_stop', {
        conversationId,
        userId
      });
    });

    socket.on('disconnect', () => {
      if (currentUserId && onlineUsers.has(currentUserId)) {
        const userSockets = onlineUsers.get(currentUserId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(currentUserId);
          ioInstance.emit('user_offline', { userId: currentUserId });
        }
      }
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

