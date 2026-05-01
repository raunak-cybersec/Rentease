import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const ensureAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const adminData = {
      name: 'RentEase Admin',
      email: 'admin@rentease.com',
      passwordHash: 'admin123',
      role: 'admin',
      phone: '+91 90000 00000',
    };

    const existing = await User.findOne({ email: adminData.email });

    if (existing) {
      existing.name = adminData.name;
      existing.passwordHash = adminData.passwordHash;
      existing.role = adminData.role;
      existing.phone = adminData.phone;
      await existing.save();
    } else {
      await User.create(adminData);
    }

    console.log('Admin ready: admin@rentease.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Could not ensure admin account:', err);
    process.exit(1);
  }
};

ensureAdmin();
