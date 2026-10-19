import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatarHandler,
  followUser,
  unfollowUser,
  getPendingRequests,
  acceptFollowRequest,
  rejectFollowRequest,
  getFollowers,
  getFollowing,
  blockUser,
  unblockUser,
  getBlockedUsers
} from '../controllers/userController.js';
import { requireAuth, optionalAuth } from '../middleware/authGuard.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

// Blocked users list
router.get('/profile/blocked', requireAuth, getBlockedUsers);

// Pending follow requests
router.get('/requests/pending', requireAuth, getPendingRequests);
router.post('/requests/:id/accept', requireAuth, acceptFollowRequest);
router.post('/requests/:id/reject', requireAuth, rejectFollowRequest);

// Profile updates & Avatar
router.patch('/profile', requireAuth, updateProfile);
router.post('/avatar', requireAuth, uploadAvatar, uploadAvatarHandler);

// Follow / Unfollow / Blocks
router.post('/:id/follow', requireAuth, followUser);
router.post('/:id/unfollow', requireAuth, unfollowUser);
router.get('/:id/followers', optionalAuth, getFollowers);
router.get('/:id/following', optionalAuth, getFollowing);
router.post('/:id/block', requireAuth, blockUser);
router.delete('/:id/block', requireAuth, unblockUser);
router.post('/:id/unblock', requireAuth, unblockUser);

// Profile view by username
router.get('/:username', optionalAuth, getProfile);

export default router;
