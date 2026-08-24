import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config(); // fallback to current working directory

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Routes
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import budgetRoutes from './routes/budgets.js';
import spendingRoutes from './routes/spending.js';
import marketRoutes from './routes/market.js';
import productsRoutes from './routes/products.js';
import aiRoutes from './routes/ai.js';
import healthRoutes from './routes/health.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Global middleware
const allowedOrigins = [
  'https://bahobudget.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());

import seedMarketData from './utils/seedMarketData.js';

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedMarketData();
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/spending', spendingRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/health', healthRoutes);

// Seller status shortcut → delegates to products/status
app.get('/api/seller-status', (req, res) => res.redirect(302, '/api/products/status'));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA fallback for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

