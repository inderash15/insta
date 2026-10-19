import { Notification } from '../models/Notification.js';
import { getIO } from '../config/socket.js';

// Helper to create and emit notification asynchronously
export const createNotification = async ({ recipient, sender, type, post = null, reel = null, comment = null, text = '' }) => {
  try {
    if (!recipient || !sender || recipient.toString() === sender.toString()) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post,
      reel,
      comment,
      text
    });

    const populated = await Notification.findById(notification._id)
      .populate('sender', 'username fullName avatarUrl isVerified')
      .populate('post', 'media')
      .populate('reel', 'videoUrl');

    try {
      const io = getIO();
      if (io) {
        io.to(`user:${recipient.toString()}`).emit('new_notification', populated);
      }
    } catch (e) {
      // Non-fatal if socket is not initialized
    }

    return populated;
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
};

// GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('sender', 'username fullName avatarUrl isVerified')
        .populate('post', 'media')
        .populate('reel', 'videoUrl'),
      Notification.countDocuments({ recipient: req.user._id, isRead: false })
    ]);

    return res.status(200).json({
      success: true,
      unreadCount,
      page,
      hasMore: notifications.length === limit,
      notifications
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/read-all
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read
export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({
      success: true,
      notification
    });
  } catch (err) {
    next(err);
  }
};
