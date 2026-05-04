import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    const users = await User.find({}, 'name email role createdAt').lean();
    console.log(`\nFound ${users.length} user(s):\n`);
    users.forEach(u => {
      console.log(`  - ${u.email}  [role: ${u.role}]  name: ${u.name}  created: ${new Date(u.createdAt).toLocaleString()}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

listUsers();
