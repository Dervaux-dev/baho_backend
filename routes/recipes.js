import express from 'express';
import Recipe from '../models/Recipe.js';
import authMiddleware from '../middleware/auth.js';
import n8nAutomation from '../services/n8nAutomation.js';

const router = express.Router();

/**
 * POST /api/recipes/analyze — Send recipe to n8n for AI analysis (protected)
 */
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { recipeName, ingredients, budgetProfile } = req.body;
    if (!recipeName || !ingredients) {
      return res.status(400).json({ success: false, error: 'recipeName and ingredients are required' });
    }
    const result = await n8nAutomation.analyzeRecipe({ recipeName, ingredients, budgetProfile });
    if (!result.success) {
      return res.status(502).json({ success: false, error: result.error });
    }
    res.status(200).json({ success: true, data: result.analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
