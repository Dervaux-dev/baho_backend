import express from 'express';
import authMiddleware from '../middleware/auth.js';
import MarketData from '../models/MarketData.js';
import { validateMarketDataInput } from '../validators/budgetValidator.js';
import n8nAutomation from '../services/n8nAutomation.js';

const router = express.Router();

/**
 * CREATE: Add or update market data for an item
 * POST /api/market
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const validation = validateMarketDataInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    // Check if market data already exists for this item
    const existing = await MarketData.findOne({
      item: req.body.item.toLowerCase(),
      category: req.body.category,
    });

    if (existing) {
      // Update existing record
      if (req.body.prices) {
        existing.prices.push(...req.body.prices);
      }
      existing.averagePrice = req.body.averagePrice;
      existing.minPrice = req.body.minPrice;
      existing.maxPrice = req.body.maxPrice;
      existing.lastUpdated = new Date();

      await existing.save();

      return res.status(200).json({
        success: true,
        data: existing,
        message: 'Market data updated',
      });
    }

    // Create new market data
    const marketData = new MarketData({
      item: req.body.item.toLowerCase(),
      ...req.body,
    });

    await marketData.save();

    res.status(201).json({
      success: true,
      data: marketData,
      message: 'Market data created',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * READ: Get market data for an item
 * GET /api/market/:item
 */
router.get('/:item', async (req, res) => {
  try {
    const marketData = await MarketData.findOne({
      item: req.params.item.toLowerCase(),
    });

    if (!marketData) {
      return res.status(404).json({
        success: false,
        error: 'Market data not found for this item',
      });
    }

    res.status(200).json({
      success: true,
      data: marketData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * READ: Get market data by category
 * GET /api/market/category/:category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const marketData = await MarketData.find({
      category: req.params.category,
    }).sort({ lastUpdated: -1 });

    res.status(200).json({
      success: true,
      data: marketData,
      count: marketData.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * READ: Get all market data
 * GET /api/market
 */
router.get('/', async (req, res) => {
  try {
    const { category, sortBy = '-lastUpdated' } = req.query;

    let query = {};
    if (category) {
      query.category = category;
    }

    const marketData = await MarketData.find(query)
      .sort(sortBy)
      .limit(100);

    res.status(200).json({
      success: true,
      data: marketData,
      count: marketData.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * UPDATE: Update market data with new price information
 * PUT /api/market/:marketDataId
 */
router.put('/:marketDataId', authMiddleware, async (req, res) => {
  try {
    const marketData = await MarketData.findById(req.params.marketDataId);

    if (!marketData) {
      return res.status(404).json({
        success: false,
        error: 'Market data not found',
      });
    }

    // Update prices if provided
    if (req.body.prices && Array.isArray(req.body.prices)) {
      marketData.prices.push(...req.body.prices);
    }

    // Update other fields
    if (req.body.averagePrice) marketData.averagePrice = req.body.averagePrice;
    if (req.body.minPrice) marketData.minPrice = req.body.minPrice;
    if (req.body.maxPrice) marketData.maxPrice = req.body.maxPrice;
    if (req.body.priceChange) marketData.priceChange = req.body.priceChange;
    if (req.body.seasonality) marketData.seasonality = req.body.seasonality;

    marketData.lastUpdated = new Date();
    await marketData.save();

    res.status(200).json({
      success: true,
      data: marketData,
      message: 'Market data updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Fetch market prices via n8n AI
 * POST /api/market/fetch-prices
 */
router.post('/fetch-prices', authMiddleware, async (req, res) => {
  try {
    const { items, category } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required and must not be empty',
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required',
      });
    }

    // Trigger n8n to fetch market prices
    const result = await n8nAutomation.fetchMarketPrices(items, category);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    // Save price data to market data
    if (result.priceData && Array.isArray(result.priceData)) {
      for (const priceInfo of result.priceData) {
        const marketData = await MarketData.findOne({
          item: priceInfo.item.toLowerCase(),
          category,
        });

        if (marketData) {
          marketData.prices.push({
            vendor: priceInfo.vendor,
            price: priceInfo.price,
            quantity: priceInfo.quantity,
            date: new Date(),
          });
          marketData.lastUpdated = new Date();
          await marketData.save();
        } else {
          const newMarketData = new MarketData({
            item: priceInfo.item.toLowerCase(),
            category,
            prices: [
              {
                vendor: priceInfo.vendor,
                price: priceInfo.price,
                quantity: priceInfo.quantity,
                date: new Date(),
              },
            ],
            averagePrice: priceInfo.price,
            minPrice: priceInfo.price,
            maxPrice: priceInfo.price,
          });
          await newMarketData.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Market prices fetched and updated',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get AI price prediction for an item
 * POST /api/market/predict/:item
 */
router.post('/predict/:item', authMiddleware, async (req, res) => {
  try {
    const marketData = await MarketData.findOne({
      item: req.params.item.toLowerCase(),
    });

    if (!marketData) {
      return res.status(404).json({
        success: false,
        error: 'No market data found for this item',
      });
    }

    // Trigger n8n AI price prediction
    const result = await n8nAutomation.predictItemPrice(
      req.params.item,
      marketData.prices,
      marketData.category
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    // Update market data with prediction
    marketData.aiPrediction = {
      predictedPrice: result.predictedPrice,
      confidence: result.confidence,
      predictionDate: new Date(),
      n8nJobId: result.jobId,
    };
    await marketData.save();

    res.status(200).json({
      success: true,
      data: {
        item: req.params.item,
        currentPrice: marketData.averagePrice,
        predictedPrice: result.predictedPrice,
        confidence: result.confidence,
        jobId: result.jobId,
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
 * DELETE: Remove market data (admin only)
 * DELETE /api/market/:marketDataId
 */
router.delete('/:marketDataId', authMiddleware, async (req, res) => {
  try {
    // Optional: Add role check here if needed
    // if (req.user.role !== 'admin') { ... }

    const marketData = await MarketData.findById(req.params.marketDataId);

    if (!marketData) {
      return res.status(404).json({
        success: false,
        error: 'Market data not found',
      });
    }

    await MarketData.deleteOne({ _id: req.params.marketDataId });

    res.status(200).json({
      success: true,
      message: 'Market data deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
