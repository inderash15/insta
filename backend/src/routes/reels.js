import express from 'express';
import { requireAuth, optionalAuth } from '../middleware/authGuard.js';
import { uploadReelMedia } from '../middleware/upload.js';
import {
  createReel,
  getReels,
  getReelById,
  viewReel,
  toggleLikeReel,
  deleteReel
} from '../controllers/reelController.js';

const router = express.Router();

router.get('/', optionalAuth, getReels);
router.post('/', requireAuth, uploadReelMedia, createReel);
router.get('/:id', optionalAuth, getReelById);
router.post('/:id/view', optionalAuth, viewReel);
router.post('/:id/like', requireAuth, toggleLikeReel);
router.delete('/:id', requireAuth, deleteReel);

export default router;
