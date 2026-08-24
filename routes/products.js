import express from 'express';

const router = express.Router();

/**
 * GET: Fetch nutrition products from n8n
 * GET /api/products
 */
router.get('/', async (req, res) => {
  try {
    // This endpoint can accept query parameters for filtering
    const { category, search } = req.query;

    // Call n8n webhook to get products
    // Expected n8n workflow: Retrieves nutrition products from database
    const webhookUrl = `${process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5678/webhook'}/get-nutrition-products`;

    const payload = {
      category: category || undefined,
      search: search || undefined,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // If n8n endpoint fails, return sample data for demo purposes
      return res.status(200).json({
        success: true,
        data: getSampleProducts(),
        message: 'Sample nutrition products (n8n service unavailable)',
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      data: data.products || [],
      total: data.total || 0,
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    // Return sample data on error
    return res.status(200).json({
      success: true,
      data: getSampleProducts(),
      message: 'Sample nutrition products (error retrieving live data)',
    });
  }
});

/**
 * GET: Check seller availability status
 * GET /api/products/status or /api/seller-status
 */
router.get('/status', async (req, res) => {
  try {
    // Call n8n webhook to get seller status
    // Expected n8n workflow: Checks seller availability from external system
    const webhookUrl = `${process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5678/webhook'}/check-seller-status`;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      // Return default seller status on error
      return res.status(200).json({
        success: true,
        data: {
          isOnline: true,
          onlineSince: new Date(Date.now() - 3600000), // 1 hour ago
          name: 'Nutri-Biz Seller',
          contact: 'seller@nutribiz.rw',
          location: 'Kigali, Rwanda',
        },
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      data: {
        isOnline: data.isOnline !== false,
        onlineSince: data.onlineSince || new Date(),
        name: data.sellerName || 'Nutri-Biz Seller',
        contact: data.contact || 'seller@nutribiz.rw',
        location: data.location || 'Kigali, Rwanda',
      },
    });
  } catch (error) {
    console.error('Failed to check seller status:', error);
    return res.status(200).json({
      success: true,
      data: {
        isOnline: true,
        onlineSince: new Date(Date.now() - 1800000), // 30 min ago
        name: 'Nutri-Biz Seller',
        contact: 'seller@nutribiz.rw',
        location: 'Kigali, Rwanda',
      },
    });
  }
});

/**
 * Sample nutrition products data for demo/fallback
 */
function getSampleProducts() {
  return [
    {
      _id: '1',
      name: 'Organic Whole Wheat Flour',
      category: 'Grains',
      description: 'High-quality whole wheat flour rich in fiber and nutrients',
      price: 5500,
      originalPrice: 6500,
      currency: 'RWF',
      imageUrl: 'https://via.placeholder.com/200?text=Whole+Wheat+Flour',
      nutrition: {
        calories: 364,
        protein: '13.7g',
        carbs: '72.6g',
        fat: '2.7g',
        fiber: '12.2g',
      },
      seller: {
        name: 'Nutrition Hub',
        isOnline: true,
        contact: 'hub@nutrition.rw',
        location: 'Kigali',
      },
    },
    {
      _id: '2',
      name: 'Premium Honey',
      category: 'Sweeteners',
      description: 'Pure, unfiltered honey from local beekeepers',
      price: 8000,
      currency: 'RWF',
      imageUrl: 'https://via.placeholder.com/200?text=Honey',
      nutrition: {
        calories: 304,
        protein: '0.3g',
        carbs: '82.4g',
        fat: '0g',
        fiber: '0.2g',
      },
      seller: {
        name: 'Rural Farmers Coop',
        isOnline: true,
        contact: 'coop@farmers.rw',
        location: 'Musanze',
      },
    },
    {
      _id: '3',
      name: 'Vitamin-Enriched Rice',
      category: 'Grains',
      description: 'White rice fortified with essential vitamins and minerals',
      price: 4200,
      originalPrice: 4800,
      currency: 'RWF',
      imageUrl: 'https://via.placeholder.com/200?text=Enriched+Rice',
      nutrition: {
        calories: 206,
        protein: '4.3g',
        carbs: '45.2g',
        fat: '0.3g',
        fiber: '0.4g',
      },
      seller: {
        name: 'Quality Foods Ltd',
        isOnline: true,
        contact: 'info@qualityfoods.rw',
        location: 'Kigali',
      },
    },
    {
      _id: '4',
      name: 'Organic Beans Mix',
      category: 'Legumes',
      description: 'Mix of kidney, black, and pinto beans - excellent protein source',
      price: 3500,
      currency: 'RWF',
      imageUrl: 'https://via.placeholder.com/200?text=Beans+Mix',
      nutrition: {
        calories: 127,
        protein: '8.7g',
        carbs: '23g',
        fat: '0.4g',
        fiber: '6.4g',
      },
      seller: {
        name: 'Green Valley Organics',
        isOnline: false,
        contact: 'sales@greenvalley.rw',
        location: 'Gitarama',
      },
    },
    {
      _id: '5',
      name: 'Cooking Oil - Palm Free',
      category: 'Oils',
      description: 'Sustainable, palm-free cooking oil rich in Vitamin E',
      price: 6800,
      currency: 'RWF',
      imageUrl: 'https://via.placeholder.com/200?text=Cooking+Oil',
      nutrition: {
        calories: 884,
        protein: '0g',
        carbs: '0g',
        fat: '100g',
        fiber: '0g',
      },
      seller: {
        name: 'Eco Oils Rwanda',
        isOnline: true,
        contact: 'info@ecooils.rw',
        location: 'Kigali',
      },
    },
    {
      _id: '6',
      name: 'Dry Milk Powder',
      category: 'Dairy',
      description: 'Full-fat milk powder for nutrition supplementation',
      price: 12500,
      currency: 'RWF',
      imageUrl: 'https://via.placeholder.com/200?text=Milk+Powder',
      nutrition: {
        calories: 496,
        protein: '26.3g',
        carbs: '38.3g',
        fat: '26.7g',
        fiber: '0g',
      },
      seller: {
        name: 'Dairy Solutions',
        isOnline: true,
        contact: 'sales@dairysolutions.rw',
        location: 'Kigali',
      },
    },
  ];
}

export default router;
