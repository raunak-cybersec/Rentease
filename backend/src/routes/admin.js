import express from 'express';
import Conversation from '../models/Conversation.js';
import Listing from '../models/Listing.js';
import Message from '../models/Message.js';
import SavedListing from '../models/SavedListing.js';
import User from '../models/User.js';

const router = express.Router();

const deleteListingsByIds = async (listingIds) => {
  if (listingIds.length === 0) return;

  const conversations = await Conversation.find({ listingId: { $in: listingIds } }).select('_id');
  const conversationIds = conversations.map((conversation) => conversation._id);

  await Message.deleteMany({ conversationId: { $in: conversationIds } });
  await Conversation.deleteMany({ listingId: { $in: listingIds } });
  await SavedListing.deleteMany({ listingId: { $in: listingIds } });
  await Listing.deleteMany({ _id: { $in: listingIds } });
};

router.get('/stats', async (req, res, next) => {
  try {
    const [users, tenants, landlords, admins, listings, savedListings, conversations, messages] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'tenant' }),
        User.countDocuments({ role: 'landlord' }),
        User.countDocuments({ role: 'admin' }),
        Listing.countDocuments(),
        SavedListing.countDocuments(),
        Conversation.countDocuments(),
        Message.countDocuments(),
      ]);

    res.json({ users, tenants, landlords, admins, listings, savedListings, conversations, messages });
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).limit(100);
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ownedListings = await Listing.find({ landlordId: user._id }).select('_id');
    await deleteListingsByIds(ownedListings.map((listing) => listing._id));

    const conversations = await Conversation.find({
      $or: [{ tenantId: user._id }, { landlordId: user._id }],
    }).select('_id');
    const conversationIds = conversations.map((conversation) => conversation._id);

    await Message.deleteMany({ conversationId: { $in: conversationIds } });
    await Conversation.deleteMany({ _id: { $in: conversationIds } });
    await SavedListing.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
});

router.get('/listings', async (req, res, next) => {
  try {
    const listings = await Listing.find()
      .populate('landlordId', 'name email phone role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(listings);
  } catch (err) {
    next(err);
  }
});

router.delete('/listings/:id', async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    await deleteListingsByIds([listing._id]);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
});

router.get('/conversations', async (req, res, next) => {
  try {
    const conversations = await Conversation.find()
      .populate('listingId', 'title city locality')
      .populate('tenantId', 'name email')
      .populate('landlordId', 'name email')
      .sort({ lastMessageAt: -1 })
      .limit(100);

    res.json(conversations);
  } catch (err) {
    next(err);
  }
});

export default router;
