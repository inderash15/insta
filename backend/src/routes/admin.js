import express from 'express';
import { requireAuth, requireRole } from '../middleware/authGuard.js';
import {
  getAdminStats,
  getReports,
  resolveReport,
  getAdminUsers,
  updateAdminUser,
  getAuditLogs
} from '../controllers/adminController.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('admin', 'moderator'));

router.get('/stats', getAdminStats);
router.get('/reports', getReports);
router.patch('/reports/:id', resolveReport);
router.get('/users', getAdminUsers);
router.patch('/users/:id', updateAdminUser);
router.get('/audit', getAuditLogs);

export default router;
