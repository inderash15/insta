import express from 'express';
import { requireAuth, requireRole } from '../middleware/authGuard.js';
import {
  getAdminStats,
  getReports,
  resolveReport,
  getAdminUsers,
  updateAdminUser
} from '../controllers/adminController.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('admin', 'moderator'));

router.get('/stats', getAdminStats);
router.get('/reports', getReports);
router.patch('/reports/:id', resolveReport);
router.get('/users', getAdminUsers);
router.patch('/users/:id', updateAdminUser);

export default router;
