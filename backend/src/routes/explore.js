import express from 'express';
import {
  getExploreGrid,
  getSuggestedPeople,
  getTrendingHashtags
} from '../controllers/searchController.js';
import { optionalAuth } from '../middleware/authGuard.js';

const router = express.Router();

router.get('/', optionalAuth, getExploreGrid);
router.get('/people', optionalAuth, getSuggestedPeople);
router.get('/trending-hashtags', optionalAuth, getTrendingHashtags);

export default router;
