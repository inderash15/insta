import express from 'express';
import { register, login, logout, getMe, changePassword, deleteAccount } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authGuard.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.post('/change-password', requireAuth, changePassword);
router.delete('/account', requireAuth, deleteAccount);

export default router;

