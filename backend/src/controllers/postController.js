import mongoose from 'mongoose';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Like } from '../models/Like.js';
import { Bookmark } from '../models/Bookmark.js';
import { Follow } from '../models/Follow.js';
import { User } from '../models/User.js';
import { createNotification } from './notificationController.js';
import { getIO } from '../config/socket.js';


const parseHashtags = (text) => {
  if (!text) return [];
  const matches = text.match(/#([a-zA-Z0-9_]+)/g);
  return matches ? [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))] : [];
};

const parseMentions = (text) => {
  if (!text) return [];
  const matches = text.match(/@([a-zA-Z0-9._]+)/g);
  return matches ? [...new Set(matches.map((m) => m.slice(1).toLowerCase()))] : [];
};

// POST /api/posts
export const createPost = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one media file is required' });
    }

    const media = req.files.map((file) => ({
      url: `/uploads/posts/${file.filename}`,
      type: file.mimetype.startsWith('video') ? 'video' : 'image',
      width: 1080,
      height: 1080,
      aspectRatio: '1:1'
    }));

    const caption = req.body.caption || '';
    const hashtags = parseHashtags(caption);
    const mentions = parseMentions(caption);

    const post = await Post.create({
      author: req.user._id,
      caption,
      media,
      hashtags,
      mentions
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { 'counts.posts': 1 } });

    await post.populate('author', 'username fullName avatarUrl isVerified');

    try {
      const io = getIO();
      if (io) {
        io.emit('post:created', { post });
      }
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/feed
export const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Get accounts followed by user
    const follows = await Follow.find({ follower: req.user._id, status: 'accepted' });
    const followedIds = follows.map((f) => f.following);

    // Eligible authors: self + followed accounts, excluding blocked users
    const eligibleAuthors = [req.user._id, ...followedIds].filter(
      (id) => !req.user.blockedUsers.some((bId) => bId.equals(id))
    );

    const posts = await Post.find({
      author: { $in: eligibleAuthors },
      isArchived: false
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username fullName avatarUrl isVerified isPrivate');

    // Attach isLiked & isBookmarked flags
    const postIds = posts.map((p) => p._id);
    const [likes, bookmarks] = await Promise.all([
      Like.find({ user: req.user._id, targetType: 'post', targetId: { $in: postIds } }),
      Bookmark.find({ user: req.user._id, post: { $in: postIds } })
    ]);

    const likedSet = new Set(likes.map((l) => l.targetId.toString()));
    const bookmarkedSet = new Set(bookmarks.map((b) => b.post.toString()));

    const enrichedPosts = posts.map((p) => {
      const obj = p.toJSON();
      obj.isLiked = likedSet.has(p._id.toString());
      obj.isBookmarked = bookmarkedSet.has(p._id.toString());
      return obj;
    });

    return res.status(200).json({
      success: true,
      page,
      hasMore: posts.length === limit,
      posts: enrichedPosts
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id
export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'username fullName avatarUrl isVerified isPrivate'
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check privacy
    if (post.author.isPrivate && (!req.user || (!req.user._id.equals(post.author._id) && !(await Follow.exists({ follower: req.user._id, following: post.author._id, status: 'accepted' }))))) {
      return res.status(403).json({ success: false, message: 'This post is from a private account' });
    }

    const obj = post.toJSON();
    if (req.user) {
      const [liked, bookmarked] = await Promise.all([
        Like.exists({ user: req.user._id, targetType: 'post', targetId: post._id }),
        Bookmark.exists({ user: req.user._id, post: post._id })
      ]);
      obj.isLiked = !!liked;
      obj.isBookmarked = !!bookmarked;
    }

    return res.status(200).json({ success: true, post: obj });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Ownership check: author or moderator/admin
    const isOwner = post.author.equals(req.user._id);
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'moderator';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this post' });
    }

    await Post.findByIdAndDelete(post._id);
    await User.findByIdAndUpdate(post.author, { $inc: { 'counts.posts': -1 } });

    // Clean up associated likes, comments, and bookmarks
    await Promise.all([
      Like.deleteMany({ targetType: 'post', targetId: post._id }),
      Comment.deleteMany({ post: post._id }),
      Bookmark.deleteMany({ post: post._id })
    ]);

    try {
      const io = getIO();
      if (io) {
        io.emit('post:deleted', { postId: post._id, authorId: post.author });
      }
    } catch (e) {}

    return res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/like
export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const existing = await Like.findOne({
      user: req.user._id,
      targetType: 'post',
      targetId: post._id
    });

    let liked = false;
    if (existing) {
      // Unlike
      await Like.findByIdAndDelete(existing._id);
      liked = false;
    } else {
      // Like
      try {
        await Like.create({
          user: req.user._id,
          targetType: 'post',
          targetId: post._id
        });
        liked = true;
      } catch (err) {
        if (err.code === 11000) {
          liked = true;
        } else {
          throw err;
        }
      }
    }

    // Authoritative like count from database
    const likesCount = await Like.countDocuments({
      targetType: 'post',
      targetId: post._id
    });

    await Post.findByIdAndUpdate(post._id, { likesCount });

    try {
      const io = getIO();
      if (io) {
        io.emit(liked ? 'post:liked' : 'post:unliked', {
          postId: post._id,
          likesCount,
          userId: req.user._id
        });
      }
    } catch (e) {}

    if (liked) {
      createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: 'like_post',
        post: post._id
      });
    }

    return res.status(200).json({ success: true, liked, likesCount });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/bookmark
export const toggleBookmark = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const existing = await Bookmark.findOne({
      user: req.user._id,
      post: post._id
    });

    let bookmarked = false;
    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      bookmarked = false;
    } else {
      try {
        await Bookmark.create({
          user: req.user._id,
          post: post._id
        });
        bookmarked = true;
      } catch (err) {
        if (err.code === 11000) {
          bookmarked = true;
        } else {
          throw err;
        }
      }
    }

    try {
      const io = getIO();
      if (io) {
        io.to(`user:${req.user._id}`).emit(bookmarked ? 'post:saved' : 'post:unsaved', {
          postId: post._id,
          userId: req.user._id
        });
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      bookmarked,
      message: bookmarked ? 'Post saved' : 'Post removed from saved'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/saved
export const getSavedPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;

    const bookmarks = await Bookmark.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'post',
        populate: { path: 'author', select: 'username fullName avatarUrl isVerified' }
      });

    const posts = bookmarks.filter((b) => b.post !== null).map((b) => b.post);

    return res.status(200).json({
      success: true,
      page,
      posts
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/comments
export const addComment = async (req, res, next) => {
  try {
    const text = (req.body.text || req.body.content)?.trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.commentsDisabled) {
      return res.status(403).json({ success: false, message: 'Comments are disabled on this post' });
    }

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      text,
      parentComment: req.body.parentComment || null
    });

    const updatedPost = await Post.findByIdAndUpdate(
      post._id,
      { $inc: { commentsCount: 1 } },
      { new: true }
    );

    await comment.populate('author', 'username fullName avatarUrl isVerified');

    try {
      const io = getIO();
      if (io) {
        io.emit('comment:created', {
          postId: post._id,
          comment,
          commentsCount: updatedPost?.commentsCount || ((post.commentsCount || 0) + 1)
        });
      }
    } catch (e) {}

    // Notify post author asynchronously
    createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: 'comment',
      post: post._id,
      comment: comment._id,
      text: text.slice(0, 60)
    });

    return res.status(201).json({
      success: true,
      message: 'Comment added',
      comment
    });

  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id/comments
export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 })
      .populate('author', 'username fullName avatarUrl isVerified');

    return res.status(200).json({
      success: true,
      comments
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/comments/:id
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const post = await Post.findById(comment.post);
    const isCommentAuthor = comment.author.equals(req.user._id);
    const isPostAuthor = post && post.author.equals(req.user._id);
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'moderator';

    if (!isCommentAuthor && !isPostAuthor && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(comment._id);
    let updatedCommentsCount = 0;
    if (post) {
      const updatedPost = await Post.findByIdAndUpdate(
        post._id,
        { $inc: { commentsCount: -1 } },
        { new: true }
      );
      updatedCommentsCount = Math.max(0, updatedPost?.commentsCount || 0);
    }

    try {
      const io = getIO();
      if (io) {
        io.emit('comment:deleted', {
          postId: comment.post,
          commentId: comment._id,
          commentsCount: updatedCommentsCount
        });
      }
    } catch (e) {}

    return res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/user/:username
export const getUserPosts = async (req, res, next) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check privacy
    if (targetUser.isPrivate && (!req.user || (!req.user._id.equals(targetUser._id) && !(await Follow.exists({ follower: req.user._id, following: targetUser._id, status: 'accepted' }))))) {
      return res.status(403).json({ success: false, message: 'This account is private' });
    }

    const posts = await Post.find({ author: targetUser._id, isArchived: false })
      .sort({ createdAt: -1 })
      .populate('author', 'username fullName avatarUrl isVerified');

    return res.status(200).json({ success: true, posts });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id/likers
export const getPostLikers = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const likes = await Like.find({
      targetType: 'post',
      targetId: post._id
    })
      .populate('user', 'username fullName avatarUrl isVerified isPrivate')
      .sort({ createdAt: -1 })
      .limit(50);

    const likers = likes.map((l) => l.user).filter(Boolean);
    return res.status(200).json({ success: true, likers });
  } catch (err) {
    next(err);
  }
};
