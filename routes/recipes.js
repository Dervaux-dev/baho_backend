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
    const raw = req.body || {};
    const ingredients = Array.isArray(raw.ingredients) ? raw.ingredients : [];
    const calculatedCost = ingredients.reduce((sum, i) => sum + (Number(i.costRWF) || 0), 0);

    const totalCostRWF = Number(raw.totalCostRWF ?? raw.totalCost ?? calculatedCost) || calculatedCost;
    const suggestedPriceRWF = Number(raw.suggestedPriceRWF ?? raw.suggestedPrice ?? Math.round(totalCostRWF * 1.35)) || Math.round(totalCostRWF * 1.35);
    const marginPercentage = Number(
      raw.marginPercentage ?? raw.profitMargin ?? (suggestedPriceRWF > 0 ? Math.round(((suggestedPriceRWF - totalCostRWF) / suggestedPriceRWF) * 100) : 35)
    ) || 35;

    const rawNutrition = raw.nutrition || {};
    const nutrition = {
      calories: Number(rawNutrition.calories ?? (calculatedCost > 3000 ? 1200 : 650)),
      proteinGrams: Number(rawNutrition.proteinGrams ?? rawNutrition.protein ?? 35),
      carbsGrams: Number(rawNutrition.carbsGrams ?? rawNutrition.carbs ?? 95),
      fatGrams: Number(rawNutrition.fatGrams ?? rawNutrition.fat ?? 22),
    };

    const businessAdvice = raw.businessAdvice || raw.notes || '';

    const newRecipe = new Recipe({
      recipeName: raw.recipeName || 'Recipe',
      owner: req.user.id,
      ingredients,
      totalCostRWF,
      suggestedPriceRWF,
      marginPercentage,
      nutrition,
      businessAdvice,
    });

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

