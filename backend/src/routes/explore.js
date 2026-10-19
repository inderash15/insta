import express from 'express';
import { getExploreGrid } from '../controllers/searchController.js';
import { optionalAuth } from '../middleware/authGuard.js';

const router = express.Router();

router.get('/', optionalAuth, getExploreGrid);

export default router;
