import express from 'express';
import authMiddleware from '../middleware/auth.js';
import Budget from '../models/Budget.js';
import Spending from '../models/Spending.js';
import {
  validateBudgetInput,
  validateN8nWebhook,
} from '../validators/budgetValidator.js';
import { BudgetCalculator } from '../utils/budgetCalculator.js';
import n8nAutomation from '../services/n8nAutomation.js';

const router = express.Router();

/**
 * CREATE: Create a new budget
 * POST /api/budgets
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Validate input
    const validation = validateBudgetInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    // Create budget
    const budget = new Budget({
      owner: req.user.id,
      ...req.body,
    });

    await budget.save();

    res.status(201).json({
      success: true,
      data: budget,
      message: 'Budget created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * READ: Get all budgets for the user
 * GET /api/budgets
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: budgets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * READ: Get a specific budget with analytics
 * GET /api/budgets/:budgetId
 */
router.get('/:budgetId', authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId);

    if (!budget || budget.owner.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    // Get spending records
    const spendingRecords = await Spending.find({ budget: req.params.budgetId });

    // Calculate analytics
    const totalSpent = BudgetCalculator.calculateTotalSpent(spendingRecords);
    const budgetStatus = BudgetCalculator.calculateBudgetStatus(
      budget.totalBudget,
      totalSpent,
      budget
    );
    const spendingByCategory = BudgetCalculator.spendingByCategory(
      spendingRecords
    );
    const trends = BudgetCalculator.calculateSpendingTrends(spendingRecords);
    const exhaustion = BudgetCalculator.predictBudgetExhaustion(
      budget.totalBudget,
      spendingRecords,
      30,
      budget
    );

    res.status(200).json({
      success: true,
      data: {
        budget,
        analytics: {
          budgetStatus,
          spendingByCategory,
          trends,
          exhaustion,
          totalRecords: spendingRecords.length,
        },
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
 * UPDATE: Update budget
 * PUT /api/budgets/:budgetId
 */
router.put('/:budgetId', authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId);

    if (!budget || budget.owner.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    // Validate n8n webhook if provided
    if (req.body.aiAutomation?.n8nWebhook) {
      if (!validateN8nWebhook(req.body.aiAutomation.n8nWebhook)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid n8n webhook URL',
        });
      }
    }

    // Update fields
    Object.assign(budget, req.body);
    budget.updatedAt = new Date();
    await budget.save();

    res.status(200).json({
      success: true,
      data: budget,
      message: 'Budget updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE: Delete a budget
 * DELETE /api/budgets/:budgetId
 */
router.delete('/:budgetId', authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId);

    if (!budget || budget.owner.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }

    // Delete associated spending records
    await Spending.deleteMany({ budget: req.params.budgetId });

    // Delete budget
    await Budget.deleteOne({ _id: req.params.budgetId });

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Trigger AI optimization for budget
 * POST /api/budgets/:budgetId/optimize
 */
router.post('/:budgetId/optimize', authMiddleware, async (req, res) => {
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

    // Get spending history
    const spendingRecords = await Spending.find({ budget: req.params.budgetId });

    // Trigger n8n optimization workflow
    const result = await n8nAutomation.optimizeBudget(
      req.params.budgetId,
      spendingRecords,
      budget.totalBudget
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
      message: 'Budget optimization triggered. Recommendations will be available soon.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
