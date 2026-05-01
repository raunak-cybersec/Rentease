import Listing from '../models/Listing.js';
import SavedListing from '../models/SavedListing.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { uploadListingImages } from '../utils/cloudinary.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getListings = async (req, res, next) => {
  try {
    const { city, maxRent, type, gender, amenities, sort, search } = req.query;
    
    let filter = {};
    
    if (city) filter.city = city;
    if (maxRent) filter.rent = { $lte: Number(maxRent) };
    if (type) filter.type = type;
    if (gender) filter.genderPreference = gender;
    if (amenities) {
      const amenityList = Array.isArray(amenities) ? amenities : [amenities];
      filter.amenities = { $all: amenityList };
    }
    if (search) {
      const query = escapeRegex(search.trim());
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { locality: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
      ];
    }

    let query = Listing.find(filter).populate('landlordId', 'name phone');
    
    // Sort
    if (sort === 'price-low') query = query.sort({ rent: 1 });
    else if (sort === 'price-high') query = query.sort({ rent: -1 });
    else query = query.sort({ createdAt: -1 });

    const listings = await query.limit(50);
    res.json(listings);
  } catch (err) {
    next(err);
  }
};

export const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('landlordId', 'name phone email');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (err) {
    next(err);
  }
};

export const createListing = async (req, res, next) => {
  try {
    if (req.user?.role !== 'landlord') {
      return res.status(403).json({ message: 'Only landlords can create listings' });
    }

    const { title, description, rent, city, locality, address, type, genderPreference, amenities, images, availableFrom, contactNumber } = req.body;
    const uploadedImages = await uploadListingImages(images);

    const listing = new Listing({
      landlordId: req.userId,
      title: title?.trim(),
      description,
      rent: Number(rent),
      city: city?.trim(),
      locality: locality?.trim(),
      address,
      type,
      genderPreference,
      amenities: amenities || [],
      images: uploadedImages,
      availableFrom,
      contactNumber,
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    if (req.user?.role !== 'landlord') {
      return res.status(403).json({ message: 'Only landlords can update listings' });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.landlordId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedFields = [
      'title',
      'description',
      'rent',
      'city',
      'locality',
      'address',
      'type',
      'genderPreference',
      'amenities',
      'images',
      'availableFrom',
      'contactNumber',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = field === 'rent' ? Number(req.body[field]) : req.body[field];
      }
    });

    if (Array.isArray(listing.images)) {
      listing.images = await uploadListingImages(listing.images);
    }

    await listing.save();
    res.json(listing);
  } catch (err) {
    next(err);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    if (req.user?.role !== 'landlord') {
      return res.status(403).json({ message: 'Only landlords can delete listings' });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.landlordId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const conversations = await Conversation.find({ listingId: req.params.id }).select('_id');
    const conversationIds = conversations.map((conversation) => conversation._id);

    await Listing.findByIdAndDelete(req.params.id);
    await SavedListing.deleteMany({ listingId: req.params.id });
    await Message.deleteMany({ conversationId: { $in: conversationIds } });
    await Conversation.deleteMany({ listingId: req.params.id });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
};

export const saveListing = async (req, res, next) => {
  try {
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if already saved
    const existing = await SavedListing.findOne({ userId: req.userId, listingId });

    if (existing) {
      // Remove if already saved
      await SavedListing.deleteOne({ userId: req.userId, listingId });
      return res.json({ message: 'Listing unsaved', saved: false });
    }

    // Add to saved
    const savedListing = new SavedListing({ userId: req.userId, listingId });
    await savedListing.save();
    res.status(201).json({ message: 'Listing saved', saved: true });
  } catch (err) {
    next(err);
  }
};
