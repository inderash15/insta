import { Story } from '../models/Story.js';
import { Follow } from '../models/Follow.js';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Highlight } from '../models/Highlight.js';
import { getIO } from '../config/socket.js';

// POST /api/stories
export const createStory = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Story media file is required' });
    }

    const mediaUrl = `/uploads/stories/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const audience = req.body.audience === 'close_friends' ? 'close_friends' : 'everyone';
    const caption = req.body.caption ? String(req.body.caption).trim().slice(0, 300) : '';

    const story = await Story.create({
      author: req.user._id,
      mediaUrl,
      mediaType,
      audience,
      caption,
      expiresAt
    });

    await story.populate('author', 'username fullName avatarUrl isVerified closeFriends');

    try {
      const io = getIO();
      if (io) {
        io.emit('story:created', { story, author: story.author });
      }
    } catch (e) {}

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
      .populate('author', 'username fullName avatarUrl isVerified isPrivate closeFriends');

    // Group stories by author while enforcing audience visibility
    const groupsMap = new Map();

    for (const story of activeStories) {
      const isSelf = story.author._id.equals(req.user._id);

      // If story is close_friends, only author or approved close friends can view
      if (story.audience === 'close_friends' && !isSelf) {
        const isCloseFriend = story.author.closeFriends?.some((cfId) =>
          cfId.equals(req.user._id)
        );
        if (!isCloseFriend) {
          continue; // Skip this story for viewer
        }
      }

      const authorId = story.author._id.toString();
      if (!groupsMap.has(authorId)) {
        groupsMap.set(authorId, {
          author: story.author,
          stories: [],
          hasUnviewed: false,
          hasCloseFriends: false,
          isSelf
        });
      }

      const group = groupsMap.get(authorId);
      const isViewed = story.viewers.some((v) => v.user.equals(req.user._id));
      if (!isViewed && !group.isSelf) {
        group.hasUnviewed = true;
      }
      if (story.audience === 'close_friends') {
        group.hasCloseFriends = true;
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

      try {
        const io = getIO();
        if (io) {
          io.to(`user:${story.author.toString()}`).emit('story:viewed', {
            storyId: story._id,
            viewersCount: story.viewers.length,
            viewerId: req.user._id
          });
        }
      } catch (e) {}
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

    try {
      const io = getIO();
      if (io) {
        io.to(`user:${story.author.toString()}`).emit('story:reaction', {
          storyId: story._id,
          emoji,
          user: req.user._id
        });
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Reaction recorded',
      reactionsCount: story.reactions.length
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/stories/:id/reply
export const replyToStory = async (req, res, next) => {
  try {
    const text = req.body.text?.trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    const story = await Story.findById(req.params.id).populate('author');
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found or expired' });
    }

    if (story.expiresAt <= new Date()) {
      return res.status(410).json({ success: false, message: 'Story has expired' });
    }

    // Check blocking
    if (story.author.blockedUsers?.some((bId) => bId.equals(req.user._id))) {
      return res.status(403).json({ success: false, message: 'Cannot reply to this user' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, story.author._id], $size: 2 }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, story.author._id]
      });
    }

    // Create message with storyReply context
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
      storyReply: {
        storyId: story._id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType
      }
    });

    await message.populate('sender', 'username fullName avatarUrl');

    // Update conversation metadata
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.sentAt;
    const authorIdStr = story.author._id.toString();
    const currentUnread = conversation.unreadCounts.get(authorIdStr) || 0;
    conversation.unreadCounts.set(authorIdStr, currentUnread + 1);
    await conversation.save();

    try {
      const io = getIO();
      if (io) {
        io.to(`conversation:${conversation._id}`).emit('message:created', {
          message,
          conversationId: conversation._id
        });
        io.to(`user:${authorIdStr}`).emit('message:created', {
          message,
          conversationId: conversation._id
        });
      }
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: message
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

    try {
      const io = getIO();
      if (io) {
        io.emit('story:deleted', { storyId: story._id });
      }
    } catch (e) {}

    return res.status(200).json({ success: true, message: 'Story deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/stories/:id
export const getStoryById = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'username fullName avatarUrl isVerified');
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found or expired' });
    }
    return res.status(200).json({ success: true, story });
  } catch (err) {
    next(err);
  }
};

// Highlights Controllers
export const createHighlight = async (req, res, next) => {
  try {
    const { title, coverUrl, stories } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Highlight title is required' });
    }

    const highlight = await Highlight.create({
      user: req.user._id,
      title: title.trim(),
      coverUrl: coverUrl || '',
      stories: stories || []
    });

    await highlight.populate('stories');

    return res.status(201).json({
      success: true,
      highlight
    });
  } catch (err) {
    next(err);
  }
};

export const getUserHighlights = async (req, res, next) => {
  try {
    const highlights = await Highlight.find({ user: req.params.userId })
      .populate('stories')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      highlights
    });
  } catch (err) {
    next(err);
  }
};

export const deleteHighlight = async (req, res, next) => {
  try {
    const highlight = await Highlight.findById(req.params.id);
    if (!highlight) {
      return res.status(404).json({ success: false, message: 'Highlight not found' });
    }

    if (!highlight.user.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Highlight.findByIdAndDelete(highlight._id);
    return res.status(200).json({ success: true, message: 'Highlight deleted' });
  } catch (err) {
    next(err);
  }
};
