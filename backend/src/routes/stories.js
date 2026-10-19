import express from 'express';
import {
  createStory,
  getStoryTray,
  recordView,
  reactToStory,
  getStoryViewers,
  deleteStory
} from '../controllers/storyController.js';
import { requireAuth } from '../middleware/authGuard.js';
import { uploadStoryMedia } from '../middleware/upload.js';

const router = express.Router();

router.post('/', requireAuth, uploadStoryMedia, createStory);
router.get('/tray', requireAuth, getStoryTray);
router.post('/:id/view', requireAuth, recordView);
router.post('/:id/react', requireAuth, reactToStory);
router.get('/:id/viewers', requireAuth, getStoryViewers);
router.delete('/:id', requireAuth, deleteStory);

export default router;
