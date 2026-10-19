import express from 'express';
import {
  createPost,
  getFeed,
  getPost,
  deletePost,
  toggleLike,
  toggleBookmark,
  getSavedPosts,
  addComment,
  getComments,
  deleteComment,
  getUserPosts
} from '../controllers/postController.js';
import { requireAuth, optionalAuth } from '../middleware/authGuard.js';
import { uploadPostMedia } from '../middleware/upload.js';

const router = express.Router();

router.post('/', requireAuth, uploadPostMedia, createPost);
router.get('/feed', requireAuth, getFeed);
router.get('/saved', requireAuth, getSavedPosts);
router.get('/user/:username', optionalAuth, getUserPosts);
router.get('/:id', optionalAuth, getPost);
router.delete('/:id', requireAuth, deletePost);

// Likes and bookmarks
router.post('/:id/like', requireAuth, toggleLike);
router.post('/:id/bookmark', requireAuth, toggleBookmark);
router.post('/:id/save', requireAuth, toggleBookmark);

// Comments
router.post('/:id/comments', requireAuth, addComment);
router.get('/:id/comments', optionalAuth, getComments);
router.delete('/comments/:id', requireAuth, deleteComment);

export default router;
