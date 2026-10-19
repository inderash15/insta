import express from 'express';
import { requireAuth } from '../middleware/authGuard.js';
import { createReport } from '../controllers/reportController.js';

const router = express.Router();

router.post('/', requireAuth, createReport);

export default router;
