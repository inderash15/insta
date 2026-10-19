import { Report } from '../models/Report.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Reel } from '../models/Reel.js';
import { Comment } from '../models/Comment.js';

// GET /api/admin/stats
export const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalPosts, totalReels, totalReports, pendingReports] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Reel.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' })
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalReels,
        totalReports,
        pendingReports
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/reports
export const getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.targetType) {
      filter.targetType = req.query.targetType;
    }

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('reporter', 'username fullName avatarUrl')
        .populate('resolvedBy', 'username fullName'),
      Report.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      page,
      total,
      hasMore: page * limit < total,
      reports
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/reports/:id
export const resolveReport = async (req, res, next) => {
  try {
    const { status, action, resolutionNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status || 'resolved';
    report.resolvedBy = req.user._id;
    report.resolutionNotes = resolutionNotes || '';
    await report.save();

    // If an action was specified, perform it
    if (action === 'delete_target') {
      if (report.targetType === 'post') await Post.findByIdAndDelete(report.targetId);
      else if (report.targetType === 'reel') await Reel.findByIdAndDelete(report.targetId);
      else if (report.targetType === 'comment') await Comment.findByIdAndDelete(report.targetId);
    } else if (action === 'ban_user') {
      let targetUserId = report.targetId;
      if (report.targetType === 'post') {
        const p = await Post.findById(report.targetId);
        if (p) targetUserId = p.author;
      }
      if (targetUserId) {
        await User.findByIdAndUpdate(targetUserId, { isBanned: true });
      }
    }

    // Write audit log
    await AuditLog.create({
      actor: req.user._id,
      action: action ? `RESOLVE_REPORT_${action.toUpperCase()}` : `RESOLVE_REPORT_${report.status.toUpperCase()}`,
      targetType: report.targetType,
      targetId: report.targetId,
      details: { reportId: report._id, action, resolutionNotes }
    });

    return res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      report
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
export const getAdminUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      const q = req.query.search.trim();
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      page,
      total,
      hasMore: page * limit < total,
      users
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id
export const updateAdminUser = async (req, res, next) => {
  try {
    const { role, isBanned, isVerified } = req.body;
    const target = await User.findById(req.params.id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only admins can change roles
    if (role !== undefined) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admins can modify user roles' });
      }
      target.role = role;
    }

    if (isBanned !== undefined) {
      target.isBanned = Boolean(isBanned);
    }

    if (isVerified !== undefined) {
      target.isVerified = Boolean(isVerified);
    }

    await target.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'UPDATE_USER_MODERATION',
      targetType: 'user',
      targetId: target._id,
      details: { role, isBanned, isVerified }
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: target.toJSON()
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/audit
export const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('actor', 'username fullName avatarUrl'),
      AuditLog.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      page,
      total,
      hasMore: page * limit < total,
      logs
    });
  } catch (err) {
    next(err);
  }
};

