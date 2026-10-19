import { Story } from '../models/Story.js';
import { Follow } from '../models/Follow.js';
import { User } from '../models/User.js';

// POST /api/stories
export const createStory = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Story media file is required' });
    }

    const mediaUrl = `/uploads/stories/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const story = await Story.create({
      author: req.user._id,
      mediaUrl,
      mediaType,
      expiresAt
    });

    await story.populate('author', 'username fullName avatarUrl isVerified');

    return res.status(201).json({
      success: true,
      message: 'Story created successfully',
      story
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/stories/tray
export const getStoryTray = async (req, res, next) => {
  try {
    const now = new Date();

    // Accounts followed by user
    const follows = await Follow.find({ follower: req.user._id, status: 'accepted' });
    const followedIds = follows.map((f) => f.following);

    const eligibleAuthors = [req.user._id, ...followedIds].filter(
      (id) => !req.user.blockedUsers.some((bId) => bId.equals(id))
    );

    const activeStories = await Story.find({
      author: { $in: eligibleAuthors },
      expiresAt: { $gt: now }
    })
      .sort({ createdAt: 1 })
      .populate('author', 'username fullName avatarUrl isVerified isPrivate');

    // Group stories by author
    const groupsMap = new Map();

    for (const story of activeStories) {
      const authorId = story.author._id.toString();
      if (!groupsMap.has(authorId)) {
        groupsMap.set(authorId, {
          author: story.author,
          stories: [],
          hasUnviewed: false,
          isSelf: story.author._id.equals(req.user._id)
        });
      }

      const group = groupsMap.get(authorId);
      const isViewed = story.viewers.some((v) => v.user.equals(req.user._id));
      if (!isViewed && !group.isSelf) {
        group.hasUnviewed = true;
      }
      group.stories.push(story);
    }

    // Sort: self first, then unviewed, then viewed
    const tray = Array.from(groupsMap.values()).sort((a, b) => {
      if (a.isSelf) return -1;
      if (b.isSelf) return 1;
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return 0;
    });

    return res.status(200).json({
      success: true,
      tray
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/stories/:id/view
export const recordView = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found or expired' });
    }

    if (story.expiresAt <= new Date()) {
      return res.status(410).json({ success: false, message: 'Story has expired' });
    }

    const alreadyViewed = story.viewers.some((v) => v.user.equals(req.user._id));
    if (!alreadyViewed && !story.author.equals(req.user._id)) {
      story.viewers.push({ user: req.user._id, viewedAt: new Date() });
      await story.save();
    }

    return res.status(200).json({ success: true, viewed: true });
  } catch (err) {
    next(err);
  }
};

// POST /api/stories/:id/react
export const reactToStory = async (req, res, next) => {
  try {
    const emoji = req.body.emoji?.trim();
    if (!emoji) {
      return res.status(400).json({ success: false, message: 'Emoji is required' });
    }

    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found or expired' });
    }

    story.reactions.push({ user: req.user._id, emoji, createdAt: new Date() });
    await story.save();

    return res.status(200).json({
      success: true,
      message: 'Reaction recorded',
      reactionsCount: story.reactions.length
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/stories/:id/viewers
export const getStoryViewers = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id).populate(
      'viewers.user',
      'username fullName avatarUrl isVerified'
    );

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Only author can inspect viewers
    if (!story.author.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view story audience' });
    }

    return res.status(200).json({
      success: true,
      viewers: story.viewers
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/stories/:id
export const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    if (!story.author.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this story' });
    }

    await Story.findByIdAndDelete(story._id);
    return res.status(200).json({ success: true, message: 'Story deleted' });
  } catch (err) {
    next(err);
  }
};
