import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function fixAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected\n');

    // 1. Fix admin role
    const admin = await User.findOne({ email: 'admin@rentease.com' });
    if (admin) {
      console.log(`Admin current role: "${admin.role}"`);
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save({ validateModifiedOnly: true });
        console.log('✅ Fixed admin role → admin');
      } else {
        console.log('✅ Admin role is already correct');
      }
    }

    // 2. Reset all demo user passwords
    const demoUsers = [
      { email: 'ananya.rao@example.com', password: 'demo1234' },
      { email: 'rajesh.kumar@example.com', password: 'demo1234' },
      { email: 'priya.sharma@example.com', password: 'demo1234' },
      { email: 'amit.patel@example.com', password: 'demo1234' },
      { email: 'sneha.desai@example.com', password: 'demo1234' },
    ];

    console.log('\nResetting demo user passwords...');
    for (const { email, password } of demoUsers) {
      const user = await User.findOne({ email });
      if (!user) { console.log(`  ✗ Not found: ${email}`); continue; }

      // Directly set and mark modified so pre-save hook re-hashes
      user.passwordHash = password;
      user.markModified('passwordHash');
      await user.save();
      console.log(`  ✅ ${email} [${user.role}] → password: "${password}"`);
    }

    // 3. Verify passwords work
    console.log('\nVerifying passwords...');
    for (const { email, password } of demoUsers) {
      const user = await User.findOne({ email });
      if (!user) continue;
      const ok = await user.comparePassword(password);
      console.log(`  ${ok ? '✅' : '❌'} ${email}: comparePassword("${password}") = ${ok}`);
    }

    // Also verify admin
    const adminCheck = await User.findOne({ email: 'admin@rentease.com' });
    const adminOk = await adminCheck.comparePassword('admin123');
    console.log(`  ${adminOk ? '✅' : '❌'} admin@rentease.com: comparePassword("admin123") = ${adminOk}`);

    console.log('\nDone!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixAll();
