import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import budgetRoutes from './routes/budgets.js';
import spendingRoutes from './routes/spending.js';
import marketRoutes from './routes/market.js';
import productsRoutes from './routes/products.js';
import aiRoutes from './routes/ai.js';
import healthRoutes from './routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global middleware
app.use(cors({ origin: 'https://bahobudget.vercel.app' }));
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
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

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
