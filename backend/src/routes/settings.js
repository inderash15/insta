import express from 'express';
import { requireAuth } from '../middleware/authGuard.js';
import {
  getPreferences,
  updatePreferences,
  getSessions,
  revokeSession,
  exportUserData,
  deleteAccount,
  submitContact,
  getCollections,
  createCollection,
  getCollectionById,
  deleteCollection
} from '../controllers/settingsController.js';

const router = express.Router();

// Public or optional auth contact
router.post('/contact', submitContact);

// Authenticated routes
router.use(requireAuth);

router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.get('/sessions', getSessions);
router.delete('/sessions/:id', revokeSession);
router.post('/data-export', exportUserData);
router.post('/delete-account', deleteAccount);

// Collections
router.get('/collections', getCollections);
router.post('/collections', createCollection);
router.get('/collections/:id', getCollectionById);
router.delete('/collections/:id', deleteCollection);

export default router;
