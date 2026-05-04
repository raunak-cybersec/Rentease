import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Listing from './models/Listing.js';

dotenv.config();

const PASSWORD = 'Pass@1234';

const landlords = [
  {
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@gmail.com',
    phone: '9876543210',
    listing: {
      title: 'Spacious 2BHK in Bandra West',
      description: 'Fully furnished 2BHK apartment in the heart of Bandra West. Ideal for working professionals. Close to metro station and all amenities. 24/7 security and power backup included.',
      city: 'Mumbai',
      locality: 'Bandra West',
      rent: 35000,
      type: 'Flat',
      genderPreference: 'Any',
      amenities: ['WiFi', 'AC', 'Parking'],
      contactNumber: '9876543210',
    },
  },
  {
    name: 'Deepa Krishnan',
    email: 'deepa.krishnan@gmail.com',
    phone: '9845612378',
    listing: {
      title: 'Premium 1BHK near Koramangala',
      description: 'Modern 1BHK apartment near Koramangala 6th Block. Walking distance to restaurants, cafes, and IT parks. Semi-furnished with modular kitchen and premium fittings.',
      city: 'Bangalore',
      locality: 'Koramangala',
      rent: 22000,
      type: '1BHK',
      genderPreference: 'Any',
      amenities: ['WiFi', 'AC'],
      contactNumber: '9845612378',
    },
  },
  {
    name: 'Suresh Gupta',
    email: 'suresh.gupta.delhi@gmail.com',
    phone: '9711234567',
    listing: {
      title: '3BHK Independent Floor in South Delhi',
      description: 'Spacious 3BHK independent floor in prime South Delhi locality. Ideal for families. Ample parking, 24/7 security, close to metro, markets, and top schools.',
      city: 'Delhi',
      locality: 'Lajpat Nagar',
      rent: 45000,
      type: 'Flat',
      genderPreference: 'Any',
      amenities: ['Parking'],
      contactNumber: '9711234567',
    },
  },
  {
    name: 'Meera Joshi',
    email: 'meera.joshi.pune@gmail.com',
    phone: '9922334455',
    listing: {
      title: 'Cozy Studio near Hinjewadi IT Park',
      description: 'Compact and affordable studio apartment near Hinjewadi Phase 1. Perfect for IT professionals. Includes modular kitchen, attached bathroom, and reliable internet.',
      city: 'Pune',
      locality: 'Hinjewadi',
      rent: 14000,
      type: 'Studio',
      genderPreference: 'Any',
      amenities: ['WiFi', 'AC'],
      contactNumber: '9922334455',
    },
  },
  {
    name: 'Ravi Reddy',
    email: 'ravi.reddy.hyd@gmail.com',
    phone: '9848012345',
    listing: {
      title: '2BHK Flat in Gachibowli Tech Hub',
      description: 'Well-maintained 2BHK flat in Gachibowli, the IT hub of Hyderabad. Close to offices, malls, and restaurants. Semi-furnished with chimney, wardrobes, and split ACs.',
      city: 'Hyderabad',
      locality: 'Gachibowli',
      rent: 28000,
      type: 'Flat',
      genderPreference: 'Any',
      amenities: ['Parking', 'Gym', 'AC'],
      contactNumber: '9848012345',
    },
  },
  {
    name: 'Lakshmi Venkatesh',
    email: 'lakshmi.venkatesh@gmail.com',
    phone: '9444567890',
    listing: {
      title: '1BHK Apartment in T Nagar Chennai',
      description: 'Neat and clean 1BHK apartment in the busy T Nagar shopping district. Easy access to shopping, hospitals, and bus routes. Suitable for small families or couples.',
      city: 'Chennai',
      locality: 'T Nagar',
      rent: 18000,
      type: '1BHK',
      genderPreference: 'Female',
      amenities: ['WiFi', 'AC', 'Parking'],
      contactNumber: '9444567890',
    },
  },
  {
    name: 'Arijit Banerjee',
    email: 'arijit.banerjee@gmail.com',
    phone: '9830112233',
    listing: {
      title: '2BHK Flat in Salt Lake Sector V',
      description: 'Spacious 2BHK in Salt Lake Sector V, Kolkata. Close to IT companies, parks, and schools. Well-ventilated rooms with balcony and covered parking. Available immediately.',
      city: 'Kolkata',
      locality: 'Salt Lake',
      rent: 20000,
      type: 'Flat',
      genderPreference: 'Any',
      amenities: ['Parking', 'Laundry'],
      contactNumber: '9830112233',
    },
  },
];

const tenants = [
  { name: 'Priya Nair', email: 'priya.nair.tenant@gmail.com', phone: '9567891234' },
  { name: 'Rahul Sharma', email: 'rahul.sharma.tenant@gmail.com', phone: '9312456789' },
  { name: 'Neha Agarwal', email: 'neha.agarwal.tenant@gmail.com', phone: '9988776655' },
];

async function seedUsersAndListings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected\n');

    let landlordCount = 0;
    let listingCount = 0;
    let tenantCount = 0;

    // Seed landlords + their listings
    for (const l of landlords) {
      const existing = await User.findOne({ email: l.email });
      if (existing) {
        console.log(`  ⚠️  Skipping (already exists): ${l.email}`);
        continue;
      }

      const user = new User({
        name: l.name,
        email: l.email,
        passwordHash: PASSWORD,
        role: 'landlord',
        phone: l.phone,
      });
      await user.save();
      landlordCount++;
      console.log(`  ✅ Landlord created: ${l.name} (${l.email})`);

      const listing = new Listing({
        ...l.listing,
        landlordId: user._id,
      });
      await listing.save();
      listingCount++;
      console.log(`     📍 Listing: "${l.listing.title}" — ₹${l.listing.rent}/mo — ${l.listing.city}`);
    }

    // Seed tenants
    console.log('');
    for (const t of tenants) {
      const existing = await User.findOne({ email: t.email });
      if (existing) {
        console.log(`  ⚠️  Skipping (already exists): ${t.email}`);
        continue;
      }

      const user = new User({
        name: t.name,
        email: t.email,
        passwordHash: PASSWORD,
        role: 'tenant',
        phone: t.phone,
      });
      await user.save();
      tenantCount++;
      console.log(`  ✅ Tenant created: ${t.name} (${t.email})`);
    }

    console.log(`\n✅ Done! Created ${landlordCount} landlords, ${listingCount} listings, ${tenantCount} tenants`);
    console.log(`   All user password: ${PASSWORD}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedUsersAndListings();
