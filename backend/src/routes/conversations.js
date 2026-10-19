import express from 'express';
import { requireAuth } from '../middleware/authGuard.js';
import { uploadMessageMedia } from '../middleware/upload.js';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markConversationRead
} from '../controllers/messageController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getConversations);
router.post('/', getOrCreateConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', uploadMessageMedia, sendMessage);
router.post('/:id/read', markConversationRead);

export default router;
