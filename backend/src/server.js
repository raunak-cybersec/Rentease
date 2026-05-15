import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware, errorHandler } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import User from './models/User.js';

dotenv.config();

const app = express();
mongoose.set('bufferCommands', false);

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));

// Ensure admin account always exists with correct credentials
async function ensureAdmin() {
  try {
    const ADMIN_EMAIL = 'rentease.admin@gmail.com';
    const ADMIN_PASSWORD = 'RentEase@2026';

    // Delete any existing admin(s) and recreate fresh to fix any hash corruption
    await User.deleteMany({ role: 'admin' });

    const admin = new User({
      name: 'RentEase Admin',
      email: ADMIN_EMAIL,
      passwordHash: ADMIN_PASSWORD, // pre-save hook will hash this
      role: 'admin',
    });
    await admin.save();

    const ok = await admin.comparePassword(ADMIN_PASSWORD);
    console.log(`Admin account: ${ADMIN_EMAIL} — password check: ${ok ? '✅ OK' : '❌ FAILED'}`);
  } catch (err) {
    console.error('ensureAdmin error:', err.message);
  }
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
})
  .then(async () => {
    console.log('MongoDB connected');
    await ensureAdmin();
  })
  .catch((err) => console.log('MongoDB connection error:', err));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/admin', authMiddleware, (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
}, adminRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});