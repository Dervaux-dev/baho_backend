import dotenv from 'dotenv';
import { verifyToken } from '../utils/auth.js';

dotenv.config();

export const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ success: false, error: 'Missing or invalid Authorization header' });
    }

    const token = parts[1];
    const payload = verifyToken(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: err.message });
  }
};

export default authMiddleware;
