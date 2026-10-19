import { Reel } from '../models/Reel.js';
import { Like } from '../models/Like.js';
import { User } from '../models/User.js';
import { Follow } from '../models/Follow.js';
import { Comment } from '../models/Comment.js';
import { createNotification } from './notificationController.js';
import { getIO } from '../config/socket.js';

const parseHashtags = (text) => {
  if (!text) return [];
  const matches = text.match(/#([a-zA-Z0-9_]+)/g);
  return matches ? [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))] : [];
};

// POST /api/reels
export const createReel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Reel video file is required' });
    }

    const videoUrl = `/uploads/reels/${req.file.filename}`;
    const caption = req.body.caption || '';
    const audioTitle = req.body.audioTitle?.trim() || 'Original Audio';
    const hashtags = parseHashtags(caption);

    const reel = await Reel.create({
      author: req.user._id,
      videoUrl,
      caption,
      audioTitle,
      hashtags
    });

    await reel.populate('author', 'username fullName avatarUrl isVerified');

    try {
      const io = getIO();
      if (io) {
        io.emit('reel:created', { reel });
      }
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Reel uploaded successfully',
      reel
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/reels
export const getReels = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 20);
    const filter = req.query.filter;

    const blockedIds = req.user?.blockedUsers || [];
    let query = { author: { $nin: blockedIds } };
    let sort = { createdAt: -1 };

    if (filter === 'trending') {
      sort = { viewsCount: -1, likesCount: -1, createdAt: -1 };
    } else if (filter === 'following' && req.user) {
      const followingDocs = await Follow.find({
        follower: req.user._id,
        status: 'accepted'
      }).select('following');
      const followingIds = followingDocs.map((f) => f.following);
      query = { author: { $in: followingIds, $nin: blockedIds } };
    }

    const reels = await Reel.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username fullName avatarUrl isVerified isPrivate');

    let likedSet = new Set();
    if (req.user && reels.length > 0) {
      const reelIds = reels.map((r) => r._id);
      const likes = await Like.find({
        user: req.user._id,
        targetType: 'reel',
        targetId: { $in: reelIds }
      });
      likedSet = new Set(likes.map((l) => l.targetId.toString()));
    }

    const enrichedReels = reels.map((r) => {
      const obj = r.toJSON();
      obj.isLiked = likedSet.has(r._id.toString());
      return obj;
    });

    return res.status(200).json({
      success: true,
      page,
      hasMore: reels.length === limit,
      reels: enrichedReels
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/reels/:id
export const getReelById = async (req, res, next) => {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate('author', 'username fullName avatarUrl isVerified isPrivate');

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    let isLiked = false;
    if (req.user) {
      const like = await Like.findOne({
        user: req.user._id,
        targetType: 'reel',
        targetId: reel._id
      });
      isLiked = !!like;
    }

    const obj = reel.toJSON();
    obj.isLiked = isLiked;

    return res.status(200).json({
      success: true,
      reel: obj
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/reels/:id/view
export const viewReel = async (req, res, next) => {
  try {
    const updated = await Reel.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } }, { new: true });
    try {
      const io = getIO();
      if (io) {
        io.emit('reel:viewed', { reelId: req.params.id, viewsCount: updated?.viewsCount || 1 });
      }
    } catch (e) {}
    return res.status(200).json({ success: true, message: 'View counted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/reels/:id/like
export const toggleLikeReel = async (req, res, next) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const existing = await Like.findOne({
      user: req.user._id,
      targetType: 'reel',
      targetId: reel._id
    });

    if (existing) {
      await Like.findByIdAndDelete(existing._id);
      const updated = await Reel.findByIdAndUpdate(
        reel._id,
        { $inc: { likesCount: -1 } },
        { new: true }
      );
      const newCount = Math.max(0, updated.likesCount);
      try {
        const io = getIO();
        if (io) {
          io.emit('reel:unliked', { reelId: reel._id, likesCount: newCount, userId: req.user._id });
        }
      } catch (e) {}
      return res.status(200).json({ success: true, liked: false, likesCount: newCount });
    }

    await Like.create({
      user: req.user._id,
      targetType: 'reel',
      targetId: reel._id
    });

    const updated = await Reel.findByIdAndUpdate(
      reel._id,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    try {
      const io = getIO();
      if (io) {
        io.emit('reel:liked', { reelId: reel._id, likesCount: updated.likesCount, userId: req.user._id });
      }
    } catch (e) {}

    // Notify author asynchronously
    createNotification({
      recipient: reel.author,
      sender: req.user._id,
      type: 'like_reel',
      reel: reel._id
    });

    return res.status(200).json({ success: true, liked: true, likesCount: updated.likesCount });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reels/:id
export const deleteReel = async (req, res, next) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const isOwner = reel.author.equals(req.user._id);
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'moderator';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this reel' });
    }

    await Reel.findByIdAndDelete(reel._id);
    await Like.deleteMany({ targetType: 'reel', targetId: reel._id });

    try {
      const io = getIO();
      if (io) {
        io.emit('reel:deleted', { reelId: reel._id });
      }
    } catch (e) {}

    return res.status(200).json({ success: true, message: 'Reel deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/reels/:id/comments
export const getReelComments = async (req, res, next) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const comments = await Comment.find({
      $or: [
        { targetType: 'reel', targetId: reel._id },
        { post: reel._id }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username fullName avatarUrl isVerified');

    return res.status(200).json({ success: true, comments });
  } catch (err) {
    next(err);
  }
};

// POST /api/reels/:id/comments
export const addReelComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const comment = await Comment.create({
      targetType: 'reel',
      targetId: reel._id,
      author: req.user._id,
      text: text.trim()
    });

    await comment.populate('author', 'username fullName avatarUrl isVerified');

    try {
      const io = getIO();
      if (io) {
        io.emit('reel:comment_added', { reelId: reel._id, comment });
      }
    } catch (e) {}

    return res.status(201).json({ success: true, comment });
  } catch (err) {
    next(err);
  }
};
