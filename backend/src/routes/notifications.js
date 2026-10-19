import express from 'express';
import { requireAuth } from '../middleware/authGuard.js';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', markNotificationRead);

export default router;
