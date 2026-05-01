import express from 'express';
import Listing from '../models/Listing.js';
import SavedListing from '../models/SavedListing.js';

const router = express.Router();

// Get user's listings (landlord)
router.get('/listings', async (req, res, next) => {
  try {
    const listings = await Listing.find({ landlordId: req.userId });
    res.json(listings);
  } catch (err) {
    next(err);
  }
});

// Get saved listings (tenant)
router.get('/saved', async (req, res, next) => {
  try {
    const saved = await SavedListing.find({ userId: req.userId }).populate('listingId');
    const listings = saved.map((s) => s.listingId);
    res.json(listings);
  } catch (err) {
    next(err);
  }
});

export default router;
