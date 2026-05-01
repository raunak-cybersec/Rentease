import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    rent: {
      type: Number,
      required: true,
      min: 100,
      max: 1000000,
    },
    city: {
      type: String,
      required: true,
    },
    locality: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    type: {
      type: String,
      enum: ['PG', 'Flat', 'Studio', '1BHK'],
      required: true,
    },
    genderPreference: {
      type: String,
      enum: ['Male', 'Female', 'Any'],
      default: 'Any',
    },
    amenities: [
      {
        type: String,
        enum: ['WiFi', 'AC', 'Meals', 'Parking', 'Laundry', 'Gym'],
      },
    ],
    images: [String],
    availableFrom: {
      type: Date,
    },
    contactNumber: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Listing', listingSchema);
