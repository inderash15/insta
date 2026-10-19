import { Server } from 'socket.io';
import { env } from './env.js';
import { corsOptions } from './cors.js';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { verifyToken } from '../utils/token.js';

let ioInstance = null;
const onlineUsers = new Map(); // userId (string) -> Set of socket.ids

/**
 * Returns whether a given user currently has at least one active Socket.IO connection.
 */
export const isUserOnline = (userId) => {
  if (!userId) return false;
  const uId = (userId._id || userId.id || userId).toString();
  return onlineUsers.has(uId) && onlineUsers.get(uId).size > 0;
};

/**
 * Returns array of currently online user IDs.
 */
export const getOnlineUserIds = () => {
  return Array.from(onlineUsers.keys());
};

/**
 * Returns number of active socket connections for a user.
 */
export const getUserSocketCount = (userId) => {
  if (!userId) return 0;
  const uId = (userId._id || userId.id || userId).toString();
  return onlineUsers.get(uId)?.size || 0;
};

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authenticate socket handshake using session token if present
  ioInstance.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token;
      if (!token && socket.handshake.headers.cookie) {
        const match = socket.handshake.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
        if (match) token = match[1];
      }
      if (token) {
        try {
          const decoded = verifyToken(token);
          if (decoded?.userId) {
            socket.userId = decoded.userId.toString();
          }
        } catch (e) {
          // Token invalid or expired; proceed unauthenticated
        }
      }
      next();
    } catch (err) {
      next();
    }
  });

  ioInstance.on('connection', (socket) => {
    let currentUserId = socket.userId || null;

    // Helper: Register user presence
    const handleUserJoin = async (userId) => {
      if (!userId) return;

      // Prevent forged identity if socket already authenticated via handshake
      if (socket.userId && socket.userId !== userId.toString()) {
        return;
      }

      currentUserId = userId.toString();
      socket.join(`user:${currentUserId}`);

      const wasAlreadyOnline = onlineUsers.has(currentUserId) && onlineUsers.get(currentUserId).size > 0;
      if (!onlineUsers.has(currentUserId)) {
        onlineUsers.set(currentUserId, new Set());
      }
      onlineUsers.get(currentUserId).add(socket.id);

      // Check user privacy settings for showActivityStatus
      try {
        const userDoc = await User.findById(currentUserId).select('preferences lastActiveAt');
        if (userDoc?.preferences?.showActivityStatus === false) {
          // User opted out of sharing activity status: still track connection, but suppress online broadcast
          socket.emit('online_users_list', { userIds: Array.from(onlineUsers.keys()) });
          socket.emit('presence:update', { onlineUserIds: Array.from(onlineUsers.keys()) });
          return;
        }
      } catch (e) {}

      // Broadcast presence only if this is the user's FIRST active connection
      if (!wasAlreadyOnline) {
        ioInstance.emit('user_online', { userId: currentUserId });
        ioInstance.emit('presence:online', { userId: currentUserId });
      }

      // Send online list snapshot to newly connected client
      socket.emit('online_users_list', {
        userIds: Array.from(onlineUsers.keys())
      });
      socket.emit('presence:update', {
        onlineUserIds: Array.from(onlineUsers.keys())
      });

      // Update lastActiveAt in database
      try {
        await User.findByIdAndUpdate(currentUserId, { lastActiveAt: new Date() });
      } catch (e) {}
    };

    // If handshake identified user, auto-join
    if (currentUserId) {
      handleUserJoin(currentUserId);
    }

    // Join user presence
    socket.on('join_user', handleUserJoin);
    socket.on('presence:subscribe', (payload) => {
      if (payload?.userId) {
        handleUserJoin(payload.userId);
      } else {
        socket.emit('presence:update', { onlineUserIds: Array.from(onlineUsers.keys()) });
      }
    });

    // Join conversation room with participant authorization
    const handleJoinConversation = async (convId) => {
      if (!convId) return;
      if (currentUserId) {
        const isParticipant = await Conversation.exists({
          _id: convId,
          participants: currentUserId
        });
        if (!isParticipant) return;
      }
      socket.join(`conversation:${convId}`);
    };

    socket.on('join_conversation', handleJoinConversation);
    socket.on('conversation:join', ({ conversationId }) => handleJoinConversation(conversationId));

    // Leave conversation room
    socket.on('leave_conversation', (convId) => {
      if (convId) socket.leave(`conversation:${convId}`);
    });
    socket.on('conversation:leave', ({ conversationId }) => {
      if (conversationId) socket.leave(`conversation:${conversationId}`);
    });

    // Direct message sending over socket
    socket.on('message:send', async (payload, callback) => {
      try {
        const { conversationId, text, mediaUrl, mediaType } = payload || {};
        if (!conversationId || (!text?.trim() && !mediaUrl)) {
          if (callback) callback({ success: false, message: 'Message text or media is required' });
          return;
        }

        const senderId = currentUserId;
        if (!senderId) {
          if (callback) callback({ success: false, message: 'Authentication required' });
          return;
        }

        const conv = await Conversation.findOne({
          _id: conversationId,
          participants: senderId
        });
        if (!conv) {
          if (callback) callback({ success: false, message: 'Conversation not found or unauthorized' });
          return;
        }

        const now = new Date();
        const deliveredTo = [];
        const recipients = conv.participants.filter((p) => p.toString() !== senderId);
        for (const rId of recipients) {
          if (isUserOnline(rId)) {
            deliveredTo.push({ user: rId, deliveredAt: now });
          }
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          text: text ? text.trim() : '',
          mediaUrl: mediaUrl || null,
          mediaType: mediaType || null,
          sentAt: now,
          deliveredTo,
          readBy: []
        });

        await message.populate('sender', 'username fullName avatarUrl isVerified');

        // Update conversation
        conv.lastMessage = message._id;
        conv.lastMessageAt = now;
        const unreadMap = conv.unreadCounts || new Map();
        for (const rId of recipients) {
          const rStr = rId.toString();
          const currentCount = (typeof unreadMap.get === 'function' ? unreadMap.get(rStr) : unreadMap[rStr]) || 0;
          if (typeof unreadMap.set === 'function') {
            unreadMap.set(rStr, currentCount + 1);
          } else {
            unreadMap[rStr] = currentCount + 1;
          }
        }
        conv.unreadCounts = unreadMap;
        await conv.save();

        // Broadcast to conversation
        ioInstance.to(`conversation:${conversationId}`).emit('new_message', {
          conversationId,
          message
        });

        // Sent confirmation directly to sender
        socket.emit('message:sent', {
          conversationId,
          message
        });

        // Delivery receipt if online
        if (deliveredTo.length > 0) {
          ioInstance.to(`conversation:${conversationId}`).emit('message:delivered', {
            conversationId,
            messageId: message._id,
            deliveredTo
          });
        }

        // Notify other participants for unread count updates
        for (const rId of recipients) {
          ioInstance.to(`user:${rId.toString()}`).emit('conversation_updated', {
            conversationId,
            lastMessage: message
          });
        }

        if (callback) callback({ success: true, message });
      } catch (err) {
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // Mark messages read in conversation
    const handleMarkRead = async ({ conversationId, userId }) => {
      const readerId = (currentUserId || userId)?.toString();
      if (!conversationId || !readerId) return;

      const now = new Date();
      try {
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: readerId }, 'readBy.user': { $ne: readerId } },
          { $push: { readBy: { user: readerId, readAt: now } } }
        );
        const unreadKey = `unreadCounts.${readerId}`;
        await Conversation.findByIdAndUpdate(conversationId, {
          $set: { [unreadKey]: 0 }
        });
      } catch (e) {}

      // Broadcast read receipt to the conversation room
      ioInstance.to(`conversation:${conversationId}`).emit('messages_read', {
        conversationId,
        userId: readerId,
        readAt: now
      });
      ioInstance.to(`conversation:${conversationId}`).emit('message:receipt', {
        conversationId,
        userId: readerId,
        readAt: now,
        status: 'seen'
      });
    };

    socket.on('mark_read', handleMarkRead);
    socket.on('message:read', handleMarkRead);

    // Typing status
    socket.on('typing_start', ({ conversationId, userId, username }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_start', {
        conversationId,
        userId: currentUserId || userId,
        username
      });
    });

    socket.on('typing_stop', ({ conversationId, userId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_stop', {
        conversationId,
        userId: currentUserId || userId
      });
    });

    // Disconnect handling with multi-connection presence registry
    socket.on('disconnect', async () => {
      if (currentUserId && onlineUsers.has(currentUserId)) {
        const userSockets = onlineUsers.get(currentUserId);
        userSockets.delete(socket.id);

        // Only mark offline if this was the user's LAST active socket connection
        if (userSockets.size === 0) {
          onlineUsers.delete(currentUserId);
          const lastActiveAt = new Date();
          try {
            await User.findByIdAndUpdate(currentUserId, { lastActiveAt });
          } catch (e) {}

          ioInstance.emit('user_offline', { userId: currentUserId, lastActiveAt });
          ioInstance.emit('presence:offline', { userId: currentUserId, lastActiveAt });
        }
      }
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};
