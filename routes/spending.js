import express from 'express';
import authMiddleware from '../middleware/auth.js';
import Budget from '../models/Budget.js';
import Spending from '../models/Spending.js';
import MarketData from '../models/MarketData.js';
import { validateSpendingInput } from '../validators/budgetValidator.js';
import { BudgetCalculator } from '../utils/budgetCalculator.js';
import n8nAutomation from '../services/n8nAutomation.js';

const router = express.Router();

/**
 * CREATE: Log a new spending transaction
 * POST /api/spending
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Validate input
    const validation = validateSpendingInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    // Verify budget exists and belongs to user
    const budget = await Budget.findById(req.body.budget);
    if (!budget || budget.owner.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    // Create spending record
    const spending = new Spending({
      owner: req.user.id,
      ...req.body,
    });

    await spending.save();

    // Check budget status and generate alerts if needed
    const allSpending = await Spending.find({ budget: req.body.budget });
    const totalSpent = BudgetCalculator.calculateTotalSpent(allSpending);
    const budgetStatus = BudgetCalculator.calculateBudgetStatus(
      budget.totalBudget,
      totalSpent,
      budget
    );

    let alerts = [];
    if (budget.aiAutomation.enabled && budget.aiAutomation.n8nWebhook) {
      const alertResult = await n8nAutomation.generateBudgetAlerts(
        req.body.budget,
        totalSpent,
        budget.totalBudget,
        budget.alerts
      );

      if (alertResult.success) {
        alerts = alertResult.alerts;
      }
    }

    res.status(201).json({
      success: true,
      data: spending,
      budgetStatus,
      alerts,
      message: 'Spending transaction recorded successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * READ: Get all spending for a budget
 * GET /api/spending/:budgetId
 */
router.get('/:budgetId', authMiddleware, async (req, res) => {
  try {
    // Verify budget belongs to user
    const budget = await Budget.findById(req.params.budgetId);
    if (!budget || budget.owner.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    // Get spending records with optional filtering
    const { category, vendor, startDate, endDate, sortBy = '-transactionDate' } = req.query;
    let query = { budget: req.params.budgetId };

    if (category) query.category = category;
    if (vendor) query.vendor = { $regex: vendor, $options: 'i' };
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }

    const spending = await Spending.find(query).sort(sortBy);

    res.status(200).json({
      success: true,
      data: spending,
      count: spending.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * READ: Get spending analytics for a budget
 * GET /api/spending/:budgetId/analytics
 */
router.get('/:budgetId/analytics', authMiddleware, async (req, res) => {
  try {
    // Verify budget belongs to user
    const budget = await Budget.findById(req.params.budgetId);
    if (!budget || budget.owner.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    const spending = await Spending.find({ budget: req.params.budgetId });

    // Get market data for comparison
    const marketData = await MarketData.find({
      item: { $in: spending.map((s) => s.item) },
    });

    // Calculate analytics
    const totalSpent = BudgetCalculator.calculateTotalSpent(spending);
    const budgetStatus = BudgetCalculator.calculateBudgetStatus(
      budget.totalBudget,
      totalSpent,
      budget
    );
    const spendingByCategory = BudgetCalculator.spendingByCategory(spending);
    const trends = BudgetCalculator.calculateSpendingTrends(spending, 'weekly');
    const marketComparison = BudgetCalculator.compareToMarket(spending, marketData);
    const recommendations = BudgetCalculator.generateRecommendations(
      budgetStatus,
      spendingByCategory,
      trends,
      budget
    );

    res.status(200).json({
      success: true,
      data: {
        budgetStatus,
        spendingByCategory,
        trends,
        marketComparison,
        recommendations,
        totalRecords: spending.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * UPDATE: Update a spending record
 * PUT /api/spending/:spendingId
 */
router.put('/:spendingId', authMiddleware, async (req, res) => {
  try {
    const spending = await Spending.findById(req.params.spendingId);

    if (!spending || spending.owner.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Spending record not found',
      });
    }

    // Validate input if fields are being updated
    if (req.body.amount || req.body.item || req.body.quantity) {
      const validation = validateSpendingInput(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors,
        });
      }
    }

    Object.assign(spending, req.body);
    await spending.save();

    res.status(200).json({
      success: true,
      data: spending,
      message: 'Spending record updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE: Delete a spending record
 * DELETE /api/spending/:spendingId
 */
router.delete('/:spendingId', authMiddleware, async (req, res) => {
  try {
    const spending = await Spending.findById(req.params.spendingId);

    if (!spending || spending.owner.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Spending record not found',
      });
    }

    await Spending.deleteOne({ _id: req.params.spendingId });

    res.status(200).json({
      success: true,
      message: 'Spending record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Validate receipt via n8n AI
 * POST /api/spending/validate-receipt
 */
router.post('/validate-receipt', authMiddleware, async (req, res) => {
  try {
    const { budgetId, receiptData } = req.body;

    // Verify budget belongs to user
    const budget = await Budget.findById(budgetId);
    if (!budget || budget.owner.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    if (!process.env.N8N_WEBHOOK_BASE_URL) {
      return res.status(400).json({
        success: false,
        error: 'n8n automation is not configured (missing N8N_WEBHOOK_BASE_URL)',
      });
    }

    // Trigger n8n receipt validation
    const result = await n8nAutomation.validateReceipt(receiptData);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Receipt validated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Detect anomalies in spending
 * POST /api/spending/detect-anomalies/:budgetId
 */
router.post('/detect-anomalies/:budgetId', authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId);
    if (!budget || budget.owner.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    if (!process.env.N8N_WEBHOOK_BASE_URL) {
      return res.status(400).json({
        success: false,
        error: 'n8n automation is not configured (missing N8N_WEBHOOK_BASE_URL)',
      });
    }

    // Get spending data
    const spending = await Spending.find({ budget: req.params.budgetId });

    // Trigger anomaly detection
    const result = await n8nAutomation.detectAnomalies(
      req.user.id,
      spending,
      'monthly'
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Anomaly detection completed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
