import { Reel } from '../models/Reel.js';
import { Like } from '../models/Like.js';
import { User } from '../models/User.js';
import { createNotification } from './notificationController.js';


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

    const blockedIds = req.user?.blockedUsers || [];

    const reels = await Reel.find({
      author: { $nin: blockedIds }
    })
      .sort({ createdAt: -1 })
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

// POST /api/reels/:id/view
export const viewReel = async (req, res, next) => {
  try {
    await Reel.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });
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
      return res.status(200).json({ success: true, liked: false, likesCount: Math.max(0, updated.likesCount) });
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

    return res.status(200).json({ success: true, message: 'Reel deleted' });
  } catch (err) {
    next(err);
  }
};
