import express from 'express';
import { requireAuth, optionalAuth } from '../middleware/authGuard.js';
import { uploadReelMedia } from '../middleware/upload.js';
import {
  createReel,
  getReels,
  getReelById,
  viewReel,
  toggleLikeReel,
  deleteReel,
  getReelComments,
  addReelComment,
  recordReelFeedback,
  recordReelEvent,
  explainReelRecommendation,
  updateUserInterests,
  getUserInterests
} from '../controllers/reelController.js';

const router = express.Router();

router.get('/', optionalAuth, getReels);
router.post('/', requireAuth, uploadReelMedia, createReel);

// User explicit interests preferences
router.get('/preferences/interests', requireAuth, getUserInterests);
router.put('/preferences/interests', requireAuth, updateUserInterests);

// Reel specific endpoints
router.get('/:id', optionalAuth, getReelById);
router.post('/:id/view', optionalAuth, viewReel);
router.post('/:id/like', requireAuth, toggleLikeReel);
router.get('/:id/comments', optionalAuth, getReelComments);
router.post('/:id/comments', requireAuth, addReelComment);
router.delete('/:id', requireAuth, deleteReel);

// PulseRank Telemetry, Feedback & Explainability
router.post('/:id/events', requireAuth, recordReelEvent);
router.post('/:id/feedback', requireAuth, recordReelFeedback);
router.get('/:id/explain', requireAuth, explainReelRecommendation);

export default router;
