import express from 'express';
import authMiddleware from '../middleware/auth.js';
import Budget from '../models/Budget.js';
import Spending from '../models/Spending.js';
import ejoChat from '../services/ejoChat.js';

const router = express.Router();

/**
 * POST /api/ai/chat
 * General chat with EjoChat AI
 */
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });
    }

    const result = await ejoChat.chat([
      { role: 'user', content: message.trim() },
    ], { context });

    if (!result.success) {
      return res.status(502).json({
        success: false,
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        usage: result.usage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/budget-advice
 * Get Kinyarwanda budget advice using EjoChat with budget context
 */
router.post('/budget-advice', authMiddleware, async (req, res) => {
  try {
    const { budgetId, question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Question is required',
      });
    }

    let budgetContext = {};

    if (budgetId) {
      const budget = await Budget.findOne({
        _id: budgetId,
        owner: req.user.id,
      });

      if (!budget) {
        return res.status(404).json({
          success: false,
          error: 'Budget not found',
        });
      }

      const spending = await Spending.find({ budget: budget._id });
      const totalSpent = spending.reduce((sum, s) => sum + s.amount, 0);

      const categoryTotals = {};
      spending.forEach((s) => {
        categoryTotals[s.category] = (categoryTotals[s.category] || 0) + s.amount;
      });

      const topCategory = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])[0];

      budgetContext = {
        totalBudget: budget.totalBudget,
        currency: budget.currency,
        totalSpent: totalSpent.toFixed(2),
        remaining: (budget.totalBudget - totalSpent).toFixed(2),
        category: budget.category,
        topSpending: topCategory
          ? `${topCategory[0]}: ${topCategory[1].toFixed(2)}`
          : undefined,
      };
    }

    const result = await ejoChat.askBudgetQuestion(question.trim(), budgetContext);

    if (!result.success) {
      return res.status(502).json({
        success: false,
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        budgetContext,
        usage: result.usage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/spending-advice
 * Get spending advice for a specific category
 */
router.post('/spending-advice', authMiddleware, async (req, res) => {
  try {
    const { budgetId, category } = req.body;

    if (!budgetId) {
      return res.status(400).json({
        success: false,
        error: 'budgetId is required',
      });
    }

    const budget = await Budget.findOne({
      _id: budgetId,
      owner: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    const filter = { budget: budget._id };
    if (category) filter.category = category;

    const spending = await Spending.find(filter)
      .sort({ transactionDate: -1 })
      .limit(50);

    const spendingData = spending.map((s) => ({
      item: s.item,
      amount: s.amount,
      vendor: s.vendor,
      category: s.category,
      date: s.transactionDate,
    }));

    const result = await ejoChat.getSpendingAdvice(spendingData, category);

    if (!result.success) {
      return res.status(502).json({
        success: false,
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        spendingCount: spendingData.length,
        usage: result.usage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/parse-receipt
 * Parse receipt text using EjoChat
 */
router.post('/parse-receipt', authMiddleware, async (req, res) => {
  try {
    const { receiptText } = req.body;

    if (!receiptText || typeof receiptText !== 'string' || !receiptText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'receiptText is required',
      });
    }

    const result = await ejoChat.parseReceipt(receiptText.trim());

    if (!result.success) {
      return res.status(502).json({
        success: false,
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        usage: result.usage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/translate
 * Translate text to/from Kinyarwanda
 */
router.post('/translate', authMiddleware, async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
      });
    }

    const result = await ejoChat.translate(text.trim(), targetLang || 'rw');

    if (!result.success) {
      return res.status(502).json({
        success: false,
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        usage: result.usage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/ai/health
 * Check if EjoChat API is configured and reachable
 */
router.get('/health', async (req, res) => {
  const configured = !!process.env.EJOCHAT_API_KEY;
  const healthy = configured ? await ejoChat.isHealthy() : false;

  res.status(200).json({
    success: true,
    data: {
      configured,
      healthy,
      baseUrl: process.env.EJOCHAT_BASE_URL || 'https://api.ejolabs.com/api/v1',
    },
  });
});

export default router;
