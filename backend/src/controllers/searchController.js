import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Follow } from '../models/Follow.js';

// GET /api/search/users?q=query
export const searchUsers = async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    if (!q) {
      return res.status(200).json({ success: true, users: [] });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 30);
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const blockedFilter = req.user?.blockedUsers?.length ? { _id: { $nin: req.user.blockedUsers } } : {};

    const users = await User.find({
      $and: [
        {
          $or: [
            { username: regex },
            { fullName: regex }
          ]
        },
        blockedFilter
      ]
    })
      .limit(limit)
      .select('username fullName avatarUrl isVerified isPrivate counts');

    return res.status(200).json({
      success: true,
      users
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/search/hashtags?q=query
export const searchHashtags = async (req, res, next) => {
  try {
    const q = req.query.q?.trim().toLowerCase().replace(/^#/, '');
    if (!q) {
      return res.status(200).json({ success: true, hashtags: [] });
    }

    const regex = new RegExp(`^${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');

    // Aggregate matching hashtags with occurrence counts
    const results = await Post.aggregate([
      { $unwind: '$hashtags' },
      { $match: { hashtags: regex, isArchived: false } },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]);

    return res.status(200).json({
      success: true,
      hashtags: results
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/explore
export const getExploreGrid = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 18, 30);

    // Find all private users
    const privateUsers = await User.find({ isPrivate: true }).select('_id');
    let allowedPrivateIds = [];

    if (req.user) {
      const acceptedFollows = await Follow.find({
        follower: req.user._id,
        status: 'accepted'
      }).select('following');
      allowedPrivateIds = acceptedFollows.map((f) => f.following);
    }

    const disallowedPrivateIds = privateUsers
      .map((u) => u._id)
      .filter((id) => !req.user || (!req.user._id.equals(id) && !allowedPrivateIds.some((aId) => aId.equals(id))));

    const blockedIds = req.user?.blockedUsers || [];
    const excludedAuthorIds = [...new Set([...disallowedPrivateIds, ...blockedIds])];

    const posts = await Post.find({
      author: { $nin: excludedAuthorIds },
      isArchived: false
    })
      .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username fullName avatarUrl isVerified');

    return res.status(200).json({
      success: true,
      page,
      hasMore: posts.length === limit,
      posts
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/search/tag/:tag
export const getPostsByTag = async (req, res, next) => {
  try {
    const tag = req.params.tag.toLowerCase().trim().replace(/^#/, '');
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 18;

    // Find private users
    const privateUsers = await User.find({ isPrivate: true }).select('_id');
    let allowedPrivateIds = [];
    if (req.user) {
      const acceptedFollows = await Follow.find({
        follower: req.user._id,
        status: 'accepted'
      }).select('following');
      allowedPrivateIds = acceptedFollows.map((f) => f.following);
    }

    const disallowedPrivateIds = privateUsers
      .map((u) => u._id)
      .filter((id) => !req.user || (!req.user._id.equals(id) && !allowedPrivateIds.some((aId) => aId.equals(id))));

    const blockedIds = req.user?.blockedUsers || [];
    const excludedAuthorIds = [...new Set([...disallowedPrivateIds, ...blockedIds])];

    const posts = await Post.find({
      hashtags: tag,
      author: { $nin: excludedAuthorIds },
      isArchived: false
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username fullName avatarUrl isVerified');

    return res.status(200).json({
      success: true,
      tag,
      page,
      posts
    });
  } catch (err) {
    next(err);
  }
};
