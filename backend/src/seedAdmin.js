import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const NEW_ADMIN = {
  name: 'RentEase Admin',
  email: 'rentease.admin@gmail.com',
  password: 'RentEase@2026',
  role: 'admin',
};

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected\n');

    // Remove old admin accounts
    const deleted = await User.deleteMany({ role: 'admin' });
    console.log(`Removed ${deleted.deletedCount} old admin account(s)`);

    // Create new admin
    const admin = new User({
      name: NEW_ADMIN.name,
      email: NEW_ADMIN.email,
      passwordHash: NEW_ADMIN.password,
      role: 'admin',
    });
    await admin.save();
    console.log(`✅ New admin created:`);
    console.log(`   Email:    ${NEW_ADMIN.email}`);
    console.log(`   Password: ${NEW_ADMIN.password}`);

    // Verify password works
    const verify = await admin.comparePassword(NEW_ADMIN.password);
    console.log(`   Verify:   ${verify ? '✅ Password OK' : '❌ Password FAILED'}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
