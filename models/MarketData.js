import mongoose from 'mongoose';

const MarketDataSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: ['produce', 'dairy', 'meat', 'pantry', 'frozen', 'beverages', 'other'],
      required: true,
    },
    prices: [
      {
        vendor: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          value: Number,
          unit: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        location: String,
      },
    ],
    averagePrice: {
      type: Number,
      required: true,
    },
    minPrice: {
      type: Number,
      required: true,
    },
    maxPrice: {
      type: Number,
      required: true,
    },
    priceChange: {
      trend: {
        type: String,
        enum: ['up', 'down', 'stable'],
        default: 'stable',
      },
      percentageChange: {
        type: Number,
        default: 0,
      },
      lastUpdate: Date,
    },
    seasonality: {
      isSeasonal: Boolean,
      season: String,
      peakPrice: Number,
      lowPrice: Number,
    },
    aiPrediction: {
      predictedPrice: Number, // AI powered via n8n
      confidence: Number, // 0-100
      predictionDate: Date,
      n8nJobId: String, // Reference to n8n automation job
    },
    source: {
      type: String,
      default: 'manual', // manual or api or n8n
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
MarketDataSchema.index({ item: 1, category: 1 });
MarketDataSchema.index({ 'prices.vendor': 1 });

export default mongoose.model('MarketData', MarketDataSchema);
