import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

const ensureDatabaseReady = (res) => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  res.status(503).json({ message: 'Database is not connected. Please try again shortly.' });
  return false;
};

export const signup = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) return;

    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    if (!['tenant', 'landlord'].includes(role)) {
      return res.status(400).json({ message: 'Role must be tenant or landlord' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: password,
      role,
      phone: phone?.trim(),
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) return;

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
};
