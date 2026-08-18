import express from 'express';
import User from '../models/User.js';
import { hashPassword, verifyPassword, signToken, createSafeUser } from '../utils/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const { salt, hash } = hashPassword(password);
    const user = new User({ name, email, passwordHash: hash, passwordSalt: salt });
    await user.save();

    const safe = createSafeUser(user);
    const token = signToken(safe, process.env.JWT_SECRET);
    res.status(201).json({ success: true, data: safe, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }

    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const ok = verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const safe = createSafeUser(user);
    const token = signToken(safe, process.env.JWT_SECRET);
    res.status(200).json({ success: true, data: safe, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
