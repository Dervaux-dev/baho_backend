import express from 'express';
import Recipe from '../models/Recipe.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/recipes — Save analyzed recipe (protected)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const body = { ...req.body, owner: req.user.id };
    const newRecipe = new Recipe(body);
    const savedRecipe = await newRecipe.save();
    res.status(201).json({ success: true, data: savedRecipe });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/recipes — Get all saved recipes (protected)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    let recipes;
    if (req.user && req.user.role === 'admin') {
      recipes = await Recipe.find().sort({ createdAt: -1 });
    } else {
      recipes = await Recipe.find({ owner: req.user.id }).sort({ createdAt: -1 });
    }
    res.status(200).json({ success: true, data: recipes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
