import { Report } from '../models/Report.js';
import { Post } from '../models/Post.js';
import { Reel } from '../models/Reel.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';

// POST /api/reports
export const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'targetType, targetId, and reason are required'
      });
    }

    // Verify target exists
    let targetExists = false;
    if (targetType === 'post') targetExists = await Post.exists({ _id: targetId });
    else if (targetType === 'reel') targetExists = await Reel.exists({ _id: targetId });
    else if (targetType === 'comment') targetExists = await Comment.exists({ _id: targetId });
    else if (targetType === 'user') targetExists = await User.exists({ _id: targetId });

    if (!targetExists) {
      return res.status(404).json({ success: false, message: 'Reported item not found' });
    }

    // Check if user already reported this item
    const existing = await Report.findOne({
      reporter: req.user._id,
      targetType,
      targetId,
      status: 'pending'
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a pending report for this item'
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      description: description?.trim() || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our moderation team will review it.',
      reportId: report._id
    });
  } catch (err) {
    next(err);
  }
};
