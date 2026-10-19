import express from 'express';
import {
  createNote,
  getNotesTray,
  deleteNote,
  replyToNote
} from '../controllers/noteController.js';
import { requireAuth } from '../middleware/authGuard.js';

const router = express.Router();

router.post('/', requireAuth, createNote);
router.get('/tray', requireAuth, getNotesTray);
router.delete('/:id', requireAuth, deleteNote);
router.post('/:id/reply', requireAuth, replyToNote);

export default router;
