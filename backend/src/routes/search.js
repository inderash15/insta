import express from 'express';
import { searchUsers, searchHashtags, getPostsByTag, getExploreGrid } from '../controllers/searchController.js';
import { optionalAuth } from '../middleware/authGuard.js';

const router = express.Router();

router.get('/users', optionalAuth, searchUsers);
router.get('/hashtags', searchHashtags);
router.get('/tag/:tag', optionalAuth, getPostsByTag);
router.get('/explore', optionalAuth, getExploreGrid);

export default router;
