import mongoose from 'mongoose';
import { z } from 'zod';
import { User } from '../models/User.js';
import { Follow } from '../models/Follow.js';
import { createNotification } from './notificationController.js';
import { getIO } from '../config/socket.js';


const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name cannot be empty').max(60).optional(),
  bio: z.string().max(150, 'Bio cannot exceed 150 characters').optional(),
  website: z.string().max(200, 'Website cannot exceed 200 characters').optional(),
  isPrivate: z.boolean().optional()
});

// GET /api/users/:username
export const getProfile = async (req, res, next) => {
  try {
    const targetUsername = req.params.username.toLowerCase().trim();
    const targetUser = await User.findOne({ username: targetUsername });

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const requesterId = req.user?._id;
    let relationship = {
      isSelf: false,
      isFollowing: false,
      isPending: false,
      isFollower: false,
      isBlocked: false,
      canViewContent: !targetUser.isPrivate
    };

    if (requesterId) {
      if (requesterId.equals(targetUser._id)) {
        relationship = {
          isSelf: true,
          isFollowing: false,
          isPending: false,
          isFollower: false,
          isBlocked: false,
          canViewContent: true
        };
      } else {
        // Check blocks
        const isBlockedByTarget = targetUser.blockedUsers.includes(requesterId);
        const hasBlockedTarget = req.user.blockedUsers.includes(targetUser._id);

        if (isBlockedByTarget || hasBlockedTarget) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if requester follows target
        const followDoc = await Follow.findOne({
          follower: requesterId,
          following: targetUser._id
        });

        if (followDoc) {
          relationship.isFollowing = followDoc.status === 'accepted';
          relationship.isPending = followDoc.status === 'pending';
        }

        // Check if target follows requester
        const reverseFollow = await Follow.findOne({
          follower: targetUser._id,
          following: requesterId,
          status: 'accepted'
        });
        relationship.isFollower = !!reverseFollow;

        // Content viewing permissions
        relationship.canViewContent = !targetUser.isPrivate || relationship.isFollowing;
      }
    }

    const profileData = targetUser.toJSON();
    if (!relationship.isSelf && targetUser.preferences?.showActivityStatus === false) {
      delete profileData.lastActiveAt;
    }
    return res.status(200).json({
      success: true,
      profile: {
        ...profileData,
        relationship
      }
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const user = req.user;

    if (validated.fullName !== undefined) user.fullName = validated.fullName;
    if (validated.bio !== undefined) user.bio = validated.bio;
    if (validated.website !== undefined) user.website = validated.website;
    if (validated.isPrivate !== undefined) user.isPrivate = validated.isPrivate;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: err.errors[0]?.message || 'Validation error'
      });
    }
    next(err);
  }
};

// POST /api/users/avatar
export const uploadAvatarHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file uploaded or file format rejected'
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    req.user.avatarUrl = avatarUrl;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      avatarUrl,
      user: req.user.toJSON()
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/:id/follow
export const followUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ success: false, message: 'Invalid target user ID' });
    }

    if (req.user._id.equals(targetId)) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check blocks
    if (targetUser.blockedUsers.includes(req.user._id) || req.user.blockedUsers.includes(targetUser._id)) {
      return res.status(403).json({ success: false, message: 'Action not allowed' });
    }

    // Check existing follow
    const existing = await Follow.findOne({
      follower: req.user._id,
      following: targetUser._id
    });

    if (existing) {
      if (existing.status === 'pending') {
        return res.status(409).json({ success: false, message: 'Follow request already pending' });
      }
      return res.status(409).json({ success: false, message: 'You are already following this user' });
    }

    const status = targetUser.isPrivate ? 'pending' : 'accepted';

    await Follow.create({
      follower: req.user._id,
      following: targetUser._id,
      status
    });

    if (status === 'accepted') {
      await User.findByIdAndUpdate(targetUser._id, { $inc: { 'counts.followers': 1 } });
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'counts.following': 1 } });
    }

    try {
      const io = getIO();
      if (io) {
        if (status === 'accepted') {
          io.to(`user:${targetUser._id}`).emit('follower_count_updated', {
            userId: targetUser._id,
            countChange: 1
          });
          io.to(`user:${req.user._id}`).emit('following_count_updated', {
            userId: req.user._id,
            countChange: 1
          });
        }
        io.emit('follow:created', {
          followerId: req.user._id,
          followingId: targetUser._id,
          status
        });
      }
    } catch (e) {}

    // Send notification
    createNotification({
      recipient: targetUser._id,
      sender: req.user._id,
      type: status === 'pending' ? 'follow_request' : 'follow'
    });

    return res.status(200).json({
      success: true,
      status,
      message: status === 'pending' ? 'Follow request sent' : 'Now following user'
    });

  } catch (err) {
    next(err);
  }
};

// POST /api/users/:id/unfollow
export const unfollowUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ success: false, message: 'Invalid target user ID' });
    }

    const follow = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: targetId
    });

    if (!follow) {
      return res.status(404).json({ success: false, message: 'You are not following this user' });
    }

    if (follow.status === 'accepted') {
      await User.findByIdAndUpdate(targetId, { $inc: { 'counts.followers': -1 } });
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'counts.following': -1 } });
    }

    try {
      const io = getIO();
      if (io) {
        if (follow.status === 'accepted') {
          io.to(`user:${targetId}`).emit('follower_count_updated', {
            userId: targetId,
            countChange: -1
          });
          io.to(`user:${req.user._id}`).emit('following_count_updated', {
            userId: req.user._id,
            countChange: -1
          });
        }
        io.emit('follow:removed', {
          followerId: req.user._id,
          followingId: targetId
        });
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: follow.status === 'pending' ? 'Follow request canceled' : 'Unfollowed user successfully'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/requests/pending
export const getPendingRequests = async (req, res, next) => {
  try {
    const requests = await Follow.find({
      following: req.user._id,
      status: 'pending'
    })
      .populate('follower', 'username fullName avatarUrl isVerified')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      requests
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/requests/:id/accept
export const acceptFollowRequest = async (req, res, next) => {
  try {
    const requesterUserId = req.params.id;
    const follow = await Follow.findOne({
      follower: requesterUserId,
      following: req.user._id,
      status: 'pending'
    });

    if (!follow) {
      return res.status(404).json({ success: false, message: 'Pending follow request not found' });
    }

    follow.status = 'accepted';
    await follow.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { 'counts.followers': 1 } });
    await User.findByIdAndUpdate(requesterUserId, { $inc: { 'counts.following': 1 } });

    try {
      const io = getIO();
      if (io) {
        io.to(`user:${req.user._id}`).emit('follower_count_updated', {
          userId: req.user._id,
          countChange: 1
        });
        io.to(`user:${requesterUserId}`).emit('following_count_updated', {
          userId: requesterUserId,
          countChange: 1
        });
        io.to(`user:${requesterUserId}`).emit('follow:accepted', {
          userId: req.user._id
        });
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Follow request accepted'
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/requests/:id/reject
export const rejectFollowRequest = async (req, res, next) => {
  try {
    const requesterUserId = req.params.id;
    const follow = await Follow.findOneAndDelete({
      follower: requesterUserId,
      following: req.user._id,
      status: 'pending'
    });

    if (!follow) {
      return res.status(404).json({ success: false, message: 'Pending follow request not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Follow request rejected'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/followers
export const getFollowers = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check privacy
    if (targetUser.isPrivate && (!req.user || (!req.user._id.equals(targetUser._id) && !(await Follow.exists({ follower: req.user._id, following: targetId, status: 'accepted' }))))) {
      return res.status(403).json({ success: false, message: 'This account is private' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const followers = await Follow.find({ following: targetId, status: 'accepted' })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('follower', 'username fullName avatarUrl isVerified')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, page, followers: followers.map((f) => f.follower) });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/following
export const getFollowing = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check privacy
    if (targetUser.isPrivate && (!req.user || (!req.user._id.equals(targetUser._id) && !(await Follow.exists({ follower: req.user._id, following: targetId, status: 'accepted' }))))) {
      return res.status(403).json({ success: false, message: 'This account is private' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const following = await Follow.find({ follower: targetId, status: 'accepted' })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('following', 'username fullName avatarUrl isVerified')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, page, following: following.map((f) => f.following) });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/:id/block
export const blockUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (req.user._id.equals(targetId)) {
      return res.status(400).json({ success: false, message: 'You cannot block yourself' });
    }

    if (!req.user.blockedUsers.includes(targetId)) {
      req.user.blockedUsers.push(targetId);
      await req.user.save();
    }

    // Sever any mutual follows
    const mutualFollows = await Follow.find({
      $or: [
        { follower: req.user._id, following: targetId },
        { follower: targetId, following: req.user._id }
      ]
    });

    for (const f of mutualFollows) {
      if (f.status === 'accepted') {
        await User.findByIdAndUpdate(f.following, { $inc: { 'counts.followers': -1 } });
        await User.findByIdAndUpdate(f.follower, { $inc: { 'counts.following': -1 } });
      }
      await Follow.findByIdAndDelete(f._id);
    }

    return res.status(200).json({ success: true, message: 'User blocked' });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/:id/unblock
export const unblockUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    req.user.blockedUsers = req.user.blockedUsers.filter((id) => !id.equals(targetId));
    await req.user.save();

    return res.status(200).json({ success: true, message: 'User unblocked' });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/profile/blocked
export const getBlockedUsers = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'blockedUsers',
      'username fullName avatarUrl isVerified'
    );
    return res.status(200).json({
      success: true,
      blockedUsers: user?.blockedUsers || []
    });
  } catch (err) {
    next(err);
  }
};
