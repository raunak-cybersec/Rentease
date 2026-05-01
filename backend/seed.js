import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Listing from './src/models/Listing.js';
import SavedListing from './src/models/SavedListing.js';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';

dotenv.config();

const roomImages = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    await Message.deleteMany({});
    await Conversation.deleteMany({});
    await SavedListing.deleteMany({});
    await Listing.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    const users = await User.create([
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        passwordHash: 'password123',
        role: 'landlord',
        phone: '+91 98765 43210',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        passwordHash: 'password123',
        role: 'landlord',
        phone: '+91 87654 32109',
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@example.com',
        passwordHash: 'password123',
        role: 'landlord',
        phone: '+91 76543 21098',
      },
      {
        name: 'Sneha Desai',
        email: 'sneha.desai@example.com',
        passwordHash: 'password123',
        role: 'landlord',
        phone: '+91 65432 10987',
      },
      {
        name: 'Ananya Rao',
        email: 'ananya.rao@example.com',
        passwordHash: 'password123',
        role: 'tenant',
        phone: '+91 99887 76655',
      },
      {
        name: 'RentEase Admin',
        email: 'admin@rentease.com',
        passwordHash: 'admin123',
        role: 'admin',
        phone: '+91 90000 00000',
      },
    ]);

    const [rajesh, priya, amit, sneha, tenant] = users;

    const listings = await Listing.insertMany([
      {
        landlordId: rajesh._id,
        title: 'Managed PG near Bandra West cafes',
        description: 'Fully furnished twin-sharing PG with housekeeping, meals, fast WiFi, and easy access to Hill Road and Bandra station.',
        rent: 18500,
        city: 'Mumbai',
        locality: 'Bandra West',
        address: 'Chapel Road, near Hill Road, Bandra West',
        type: 'PG',
        genderPreference: 'Any',
        amenities: ['WiFi', 'AC', 'Meals', 'Laundry'],
        images: [roomImages[0], roomImages[1]],
        availableFrom: new Date('2026-05-20'),
        contactNumber: rajesh.phone,
        views: 18,
      },
      {
        landlordId: priya._id,
        title: 'Female PG in Andheri East',
        description: 'Secure PG close to MIDC and metro, with meals, laundry, biometric entry, and a quiet study-friendly common area.',
        rent: 12000,
        city: 'Mumbai',
        locality: 'Andheri East',
        address: 'Sher-E-Punjab Society, Andheri East',
        type: 'PG',
        genderPreference: 'Female',
        amenities: ['WiFi', 'Meals', 'Laundry'],
        images: [roomImages[1], roomImages[2]],
        availableFrom: new Date('2026-06-01'),
        contactNumber: priya.phone,
        views: 11,
      },
      {
        landlordId: amit._id,
        title: 'Studio apartment in Lajpat Nagar',
        description: 'Compact furnished studio near Central Market with private kitchenette, AC, and quick connectivity to Moolchand metro.',
        rent: 14500,
        city: 'Delhi',
        locality: 'Lajpat Nagar',
        address: 'Block E, Lajpat Nagar II',
        type: 'Studio',
        genderPreference: 'Any',
        amenities: ['WiFi', 'AC', 'Parking'],
        images: [roomImages[2], roomImages[3]],
        availableFrom: new Date('2026-05-15'),
        contactNumber: amit.phone,
        views: 23,
      },
      {
        landlordId: sneha._id,
        title: 'Budget student PG in Mukherjee Nagar',
        description: 'Clean student PG near coaching hubs with vegetarian meals, WiFi, laundry, and flexible sharing options.',
        rent: 7500,
        city: 'Delhi',
        locality: 'Mukherjee Nagar',
        address: 'Batra Cinema Road, Mukherjee Nagar',
        type: 'PG',
        genderPreference: 'Male',
        amenities: ['WiFi', 'Meals', 'Laundry'],
        images: [roomImages[3], roomImages[4]],
        availableFrom: new Date('2026-06-10'),
        contactNumber: sneha.phone,
        views: 31,
      },
      {
        landlordId: priya._id,
        title: 'Premium studio in Koramangala',
        description: 'Modern studio for working professionals, close to 5th Block cafes, coworking spaces, gyms, and bus connectivity.',
        rent: 18500,
        city: 'Bangalore',
        locality: 'Koramangala',
        address: '5th Block, Koramangala',
        type: 'Studio',
        genderPreference: 'Any',
        amenities: ['WiFi', 'AC', 'Gym', 'Parking'],
        images: [roomImages[4], roomImages[5]],
        availableFrom: new Date('2026-05-25'),
        contactNumber: priya.phone,
        views: 42,
      },
      {
        landlordId: rajesh._id,
        title: '1BHK in Whitefield gated society',
        description: 'Bright 1BHK with balcony, modular kitchen, reserved parking, and quick access to ITPL and Kadugodi metro.',
        rent: 23000,
        city: 'Bangalore',
        locality: 'Whitefield',
        address: 'Hope Farm Junction, Whitefield',
        type: '1BHK',
        genderPreference: 'Any',
        amenities: ['WiFi', 'AC', 'Parking', 'Gym', 'Laundry'],
        images: [roomImages[5], roomImages[0]],
        availableFrom: new Date('2026-06-05'),
        contactNumber: rajesh.phone,
        views: 37,
      },
      {
        landlordId: amit._id,
        title: 'Studio near Gachibowli offices',
        description: 'Furnished studio with AC, WiFi, work desk, and gym access, ideal for professionals working around Financial District.',
        rent: 16000,
        city: 'Hyderabad',
        locality: 'Gachibowli',
        address: 'Telecom Nagar, Gachibowli',
        type: 'Studio',
        genderPreference: 'Any',
        amenities: ['WiFi', 'AC', 'Gym'],
        images: [roomImages[0], roomImages[2]],
        availableFrom: new Date('2026-05-18'),
        contactNumber: amit.phone,
        views: 19,
      },
      {
        landlordId: sneha._id,
        title: 'Co-living PG in Hitech City',
        description: 'Professionally managed PG near Cyber Towers with meals, WiFi, AC common lounge, and weekly housekeeping.',
        rent: 12500,
        city: 'Hyderabad',
        locality: 'Hitech City',
        address: 'Madhapur Main Road, Hitech City',
        type: 'PG',
        genderPreference: 'Male',
        amenities: ['WiFi', 'AC', 'Meals', 'Laundry'],
        images: [roomImages[1], roomImages[3]],
        availableFrom: new Date('2026-05-30'),
        contactNumber: sneha.phone,
        views: 27,
      },
      {
        landlordId: priya._id,
        title: 'Budget PG in Viman Nagar',
        description: 'Affordable PG close to Symbiosis and Phoenix Marketcity with breakfast, WiFi, parking for two-wheelers, and laundry.',
        rent: 9000,
        city: 'Pune',
        locality: 'Viman Nagar',
        address: 'Sakore Nagar, Viman Nagar',
        type: 'PG',
        genderPreference: 'Any',
        amenities: ['WiFi', 'Meals', 'Parking', 'Laundry'],
        images: [roomImages[2], roomImages[4]],
        availableFrom: new Date('2026-06-01'),
        contactNumber: priya.phone,
        views: 16,
      },
      {
        landlordId: rajesh._id,
        title: 'Furnished flat in Kothrud',
        description: 'Well ventilated flat near Paud Road with WiFi, parking, washing machine, and easy access to MIT and Karve Nagar.',
        rent: 15000,
        city: 'Pune',
        locality: 'Kothrud',
        address: 'Paud Road, near Ideal Colony metro',
        type: 'Flat',
        genderPreference: 'Any',
        amenities: ['WiFi', 'Parking', 'Laundry'],
        images: [roomImages[3], roomImages[5]],
        availableFrom: new Date('2026-06-12'),
        contactNumber: rajesh.phone,
        views: 22,
      },
      {
        landlordId: amit._id,
        title: 'Flat near Gomti Nagar corporate offices',
        description: 'Comfortable furnished flat near Cyber Heights with secure parking, fast WiFi, AC bedroom, and nearby grocery stores.',
        rent: 11000,
        city: 'Lucknow',
        locality: 'Gomti Nagar',
        address: 'Vibhuti Khand, Gomti Nagar',
        type: 'Flat',
        genderPreference: 'Any',
        amenities: ['WiFi', 'AC', 'Parking'],
        images: [roomImages[4], roomImages[0]],
        availableFrom: new Date('2026-05-22'),
        contactNumber: amit.phone,
        views: 14,
      },
      {
        landlordId: sneha._id,
        title: 'Student PG in Aliganj',
        description: 'Simple and clean PG near coaching centres with meals, WiFi, laundry, and owner-managed maintenance.',
        rent: 6000,
        city: 'Lucknow',
        locality: 'Aliganj',
        address: 'Sector Q, Aliganj',
        type: 'PG',
        genderPreference: 'Female',
        amenities: ['WiFi', 'Meals', 'Laundry'],
        images: [roomImages[5], roomImages[1]],
        availableFrom: new Date('2026-06-08'),
        contactNumber: sneha.phone,
        views: 20,
      },
    ]);

    await SavedListing.create([
      { userId: tenant._id, listingId: listings[0]._id },
      { userId: tenant._id, listingId: listings[4]._id },
    ]);

    const conversation = await Conversation.create({
      listingId: listings[0]._id,
      tenantId: tenant._id,
      landlordId: rajesh._id,
      lastMessage: 'Yes, the room is available from the listed date. You can visit this weekend.',
      lastMessageAt: new Date(),
    });

    await Message.create([
      {
        conversationId: conversation._id,
        senderId: tenant._id,
        body: 'Hi, is this PG near Bandra West still available?',
        readBy: [tenant._id, rajesh._id],
      },
      {
        conversationId: conversation._id,
        senderId: rajesh._id,
        body: 'Yes, the room is available from the listed date. You can visit this weekend.',
        readBy: [rajesh._id],
      },
    ]);

    console.log('Seed complete');
    console.log(`Created ${users.length} users and ${listings.length} listings`);
    console.log('Demo password for landlords/tenant: password123');
    console.log('Admin login: admin@rentease.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedData();
