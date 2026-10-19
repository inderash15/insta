import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { getIO } from '../config/socket.js';

// GET /api/conversations
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId
    })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'username fullName avatarUrl isVerified isPrivate')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username fullName avatarUrl' }
      });

    const formatted = conversations.map((c) => {
      const obj = c.toJSON();
      const unreadMap = c.unreadCounts || new Map();
      obj.unreadCount = (typeof unreadMap.get === 'function' ? unreadMap.get(userId.toString()) : unreadMap[userId.toString()]) || 0;
      return obj;
    });

    return res.status(200).json({
      success: true,
      conversations: formatted
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/conversations
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID is required' });
    }

    if (recipientId.toString() === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    // Check if blocked
    if (req.user.blockedUsers?.some((id) => id.toString() === recipientId.toString())) {
      return res.status(403).json({ success: false, message: 'You have blocked this user' });
    }
    if (recipient.blockedUsers?.some((id) => id.toString() === currentUserId.toString())) {
      return res.status(403).json({ success: false, message: 'You cannot message this user' });
    }

    // Find existing 2-party conversation
    let conv = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId], $size: 2 }
    })
      .populate('participants', 'username fullName avatarUrl isVerified isPrivate')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username fullName avatarUrl' }
      });

    if (!conv) {
      conv = await Conversation.create({
        participants: [currentUserId, recipientId],
        unreadCounts: {
          [currentUserId.toString()]: 0,
          [recipientId.toString()]: 0
        }
      });

      conv = await Conversation.findById(conv._id)
        .populate('participants', 'username fullName avatarUrl isVerified isPrivate');
    }

    const obj = conv.toJSON();
    const unreadMap = conv.unreadCounts || new Map();
    obj.unreadCount = (typeof unreadMap.get === 'function' ? unreadMap.get(currentUserId.toString()) : unreadMap[currentUserId.toString()]) || 0;

    return res.status(200).json({
      success: true,
      conversation: obj
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/conversations/:id/messages
export const getMessages = async (req, res, next) => {
  try {
    const { id: conversationId } = req.params;
    const currentUserId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);

    const conv = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId
    });

    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found or unauthorized' });
    }

    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'username fullName avatarUrl isVerified');

    // Reset unread count for current user
    const unreadKey = `unreadCounts.${currentUserId.toString()}`;
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [unreadKey]: 0 }
    });

    return res.status(200).json({
      success: true,
      page,
      hasMore: messages.length === limit,
      messages: messages.reverse()
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/conversations/:id/messages
export const sendMessage = async (req, res, next) => {
  try {
    const { id: conversationId } = req.params;
    const currentUserId = req.user._id;
    const text = req.body.text?.trim() || '';

    const conv = await Conversation.findOne({
      _id: conversationId,
      participants: currentUserId
    });

    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found or unauthorized' });
    }

    let mediaUrl = null;
    let mediaType = null;
    if (req.file) {
      mediaUrl = `/uploads/posts/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    if (!text && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Message text or media is required' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: currentUserId,
      text,
      mediaUrl,
      mediaType,
      readBy: [{ user: currentUserId, readAt: new Date() }]
    });

    await message.populate('sender', 'username fullName avatarUrl isVerified');

    // Update conversation metadata and increment unread counts for others
    const incObj = {};
    for (const p of conv.participants) {
      const pStr = p.toString();
      if (pStr !== currentUserId.toString()) {
        incObj[`unreadCounts.${pStr}`] = 1;
      }
    }

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
      $inc: incObj
    });

    // Real-time broadcast
    try {
      const io = getIO();
      if (io) {
        // Emit to conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', {
          conversationId,
          message
        });

        // Notify other participants for unread badges and conversation list updates
        for (const p of conv.participants) {
          const pStr = p.toString();
          if (pStr !== currentUserId.toString()) {
            io.to(`user:${pStr}`).emit('conversation_updated', {
              conversationId,
              lastMessage: message
            });
          }
        }
      }
    } catch (socketErr) {
      // Non-fatal if socket is offline
    }

    return res.status(201).json({
      success: true,
      message
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/conversations/:id/read
export const markConversationRead = async (req, res, next) => {
  try {
    const { id: conversationId } = req.params;
    const currentUserId = req.user._id;

    const unreadKey = `unreadCounts.${currentUserId.toString()}`;
    await Conversation.findOneAndUpdate(
      { _id: conversationId, participants: currentUserId },
      { $set: { [unreadKey]: 0 } }
    );

    return res.status(200).json({ success: true, message: 'Conversation marked as read' });
  } catch (err) {
    next(err);
  }
};
