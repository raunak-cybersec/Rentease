import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  saveListing,
} from '../controllers/listingController.js';

const router = express.Router();

router.get('/', getListings);
router.get('/:id', getListingById);
router.post('/', authMiddleware, requireRole('landlord'), createListing);
router.put('/:id', authMiddleware, requireRole('landlord'), updateListing);
router.delete('/:id', authMiddleware, requireRole('landlord'), deleteListing);
router.post('/:id/save', authMiddleware, saveListing);

export default router;
