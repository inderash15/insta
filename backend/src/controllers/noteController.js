import { Note } from '../models/Note.js';
import { Follow } from '../models/Follow.js';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { getIO } from '../config/socket.js';

// POST /api/notes
export const createNote = async (req, res, next) => {
  try {
    const text = req.body.text?.trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    if (text.length > 60) {
      return res.status(400).json({
        success: false,
        message: 'Note cannot exceed 60 characters'
      });
    }

    const mood = req.body.mood ? String(req.body.mood).trim().slice(0, 10) : '';
    const audience =
      req.body.audience === 'close_friends' ? 'close_friends' : 'followers_follow_back';
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Delete any active note from the user before creating new one
    await Note.deleteMany({ author: req.user._id });

    const note = await Note.create({
      author: req.user._id,
      text,
      mood,
      audience,
      expiresAt
    });

    await note.populate('author', 'username fullName avatarUrl isVerified');

    try {
      const io = getIO();
      if (io) {
        io.emit('note:created', { note });
      }
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Note shared successfully',
      note
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/notes/tray
export const getNotesTray = async (req, res, next) => {
  try {
    const now = new Date();
    const userId = req.user._id;

    // Mutual follows: I follow them and they follow me
    const myFollowing = await Follow.find({ follower: userId, status: 'accepted' }).select('following');
    const followingIds = myFollowing.map((f) => f.following);

    const myFollowers = await Follow.find({
      follower: { $in: followingIds },
      following: userId,
      status: 'accepted'
    }).select('follower');
    const mutualFollowerIds = myFollowers.map((f) => f.follower);

    // Also include anyone who added me to their close friends
    const closeFriendsUsers = await User.find({ closeFriends: userId }).select('_id');
    const closeFriendsAuthorIds = closeFriendsUsers.map((u) => u._id);

    // Combined candidate authors
    const eligibleAuthorIds = [
      userId,
      ...mutualFollowerIds,
      ...closeFriendsAuthorIds
    ].filter((id) => !req.user.blockedUsers.some((bId) => bId.equals(id)));

    const activeNotes = await Note.find({
      author: { $in: eligibleAuthorIds },
      expiresAt: { $gt: now }
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username fullName avatarUrl isVerified closeFriends');

    // Filter by audience visibility and sort (self first)
    const validNotes = [];
    for (const note of activeNotes) {
      const isSelf = note.author._id.equals(userId);
      if (note.audience === 'close_friends' && !isSelf) {
        const isCloseFriend = note.author.closeFriends?.some((cfId) => cfId.equals(userId));
        if (!isCloseFriend) continue;
      }
      validNotes.push(note);
    }

    validNotes.sort((a, b) => {
      const aSelf = a.author._id.equals(userId);
      const bSelf = b.author._id.equals(userId);
      if (aSelf) return -1;
      if (bSelf) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.status(200).json({
      success: true,
      notes: validNotes
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/notes/:id
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (!note.author.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete note' });
    }

    await Note.findByIdAndDelete(note._id);

    try {
      const io = getIO();
      if (io) {
        io.emit('note:deleted', { noteId: note._id, authorId: note.author });
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Note deleted'
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/notes/:id/reply
export const replyToNote = async (req, res, next) => {
  try {
    const text = req.body.text?.trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    const note = await Note.findById(req.params.id).populate('author');
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found or expired' });
    }

    if (note.expiresAt <= new Date()) {
      return res.status(410).json({ success: false, message: 'Note has expired' });
    }

    if (note.author.blockedUsers?.some((bId) => bId.equals(req.user._id))) {
      return res.status(403).json({ success: false, message: 'Cannot reply to this user' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, note.author._id], $size: 2 }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, note.author._id]
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
      noteReply: {
        noteId: note._id,
        text: note.text
      }
    });

    await message.populate('sender', 'username fullName avatarUrl');

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.sentAt;
    const authorIdStr = note.author._id.toString();
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
      message: 'Reply sent to DM',
      data: message
    });
  } catch (err) {
    next(err);
  }
};
