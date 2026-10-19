import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Bookmark } from '../models/Bookmark.js';
import { Collection } from '../models/Collection.js';
import { Session } from '../models/Session.js';
import { ContactSubmission } from '../models/ContactSubmission.js';

// GET /api/settings/preferences
export const getPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({
      success: true,
      preferences: user.preferences || {
        theme: 'dark',
        notifications: { pauseAll: false, postsLikes: true, comments: true, follows: true, messages: true },
        accessibility: { highContrast: false, reduceMotion: false, captions: true },
        language: 'en'
      }
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings/preferences
export const updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.preferences) user.preferences = {};

    const { theme, notifications, accessibility, language } = req.body;
    if (theme) user.preferences.theme = theme;
    if (notifications) user.preferences.notifications = { ...user.preferences.notifications, ...notifications };
    if (accessibility) user.preferences.accessibility = { ...user.preferences.accessibility, ...accessibility };
    if (language) user.preferences.language = language;

    user.markModified('preferences');
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/settings/sessions
export const getSessions = async (req, res, next) => {
  try {
    let sessions = await Session.find({ user: req.user._id, isValid: true }).sort({ lastActive: -1 });
    
    // If no session objects recorded yet, return current session
    if (sessions.length === 0) {
      sessions = [
        {
          _id: req.user._id,
          deviceType: 'Current Browser / Desktop',
          ip: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Modern Web Browser',
          lastActive: new Date(),
          isCurrent: true
        }
      ];
    }

    return res.status(200).json({
      success: true,
      sessions
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/settings/sessions/:id
export const revokeSession = async (req, res, next) => {
  try {
    await Session.findByIdAndUpdate(req.params.id, { isValid: false });
    return res.status(200).json({ success: true, message: 'Session revoked successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/settings/data-export
export const exportUserData = async (req, res, next) => {
  try {
    const [user, posts, bookmarks] = await Promise.all([
      User.findById(req.user._id),
      Post.find({ author: req.user._id }),
      Bookmark.find({ user: req.user._id }).populate('post')
    ]);

    const exportBundle = {
      exportDate: new Date().toISOString(),
      account: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        website: user.website,
        isPrivate: user.isPrivate,
        createdAt: user.createdAt
      },
      postsCount: posts.length,
      posts: posts.map((p) => ({
        id: p._id,
        caption: p.caption,
        media: p.media,
        hashtags: p.hashtags,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
        createdAt: p.createdAt
      })),
      savedPostsCount: bookmarks.length,
      savedPosts: bookmarks.map((b) => b.post)
    };

    return res.status(200).json({
      success: true,
      message: 'User data generated successfully',
      data: exportBundle
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/settings/delete-account
export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Current password is required to delete account' });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // Clean up user's posts, bookmarks, sessions
    await Promise.all([
      Post.deleteMany({ author: user._id }),
      Bookmark.deleteMany({ user: user._id }),
      Session.deleteMany({ user: user._id }),
      User.findByIdAndDelete(user._id)
    ]);

    res.clearCookie('insta_session', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    });

    return res.status(200).json({
      success: true,
      message: 'Account permanently deleted. Thank you for using Insta.'
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/settings/contact
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, category, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, subject, and message are required' });
    }

    const submission = await ContactSubmission.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      category: category || 'account',
      message: message.trim(),
      user: req.user ? req.user._id : null
    });

    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted. Our support team will get in touch.',
      ticketId: submission._id
    });
  } catch (err) {
    next(err);
  }
};

// Collections Management
export const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({ user: req.user._id })
      .populate('posts')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, collections });
  } catch (err) {
    next(err);
  }
};

export const createCollection = async (req, res, next) => {
  try {
    const { name, postId } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Collection name is required' });
    }

    const posts = postId ? [postId] : [];
    const collection = await Collection.create({
      user: req.user._id,
      name: name.trim(),
      posts
    });

    return res.status(201).json({ success: true, collection });
  } catch (err) {
    next(err);
  }
};

export const getCollectionById = async (req, res, next) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id })
      .populate('posts');

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    return res.status(200).json({ success: true, collection });
  } catch (err) {
    next(err);
  }
};

export const deleteCollection = async (req, res, next) => {
  try {
    await Collection.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    return res.status(200).json({ success: true, message: 'Collection deleted' });
  } catch (err) {
    next(err);
  }
};
