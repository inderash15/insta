import express from 'express';
import { requireAuth } from '../middleware/authGuard.js';
import { createReport, getMyReports } from '../controllers/reportController.js';

const router = express.Router();

router.post('/', requireAuth, createReport);
router.get('/my', requireAuth, getMyReports);

export default router;
