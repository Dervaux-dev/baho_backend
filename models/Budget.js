import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['groceries', 'meals', 'ingredients', 'household', 'other'],
      default: 'groceries',
    },
    householdSize: {
      type: Number,
      default: 2,
      min: 1,
    },
    householdType: {
      type: String,
      enum: ['single', 'couple', 'family', 'shared household'],
      default: 'family',
    },
    location: {
      type: String,
      default: 'Kigali, Rwanda',
    },
    city: {
      type: String,
      default: 'Kigali',
    },
    country: {
      type: String,
      default: 'Rwanda',
    },
    totalBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'RWF',
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    alerts: {
      warningThreshold: {
        type: Number,
        default: 80, // percentage
      },
      criticalThreshold: {
        type: Number,
        default: 95, // percentage
      },
    },
    marketPriceTracking: {
      enabled: {
        type: Boolean,
        default: true,
      },
      updateFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'real-time'],
        default: 'daily',
      },
    },
    aiAutomation: {
      enabled: {
        type: Boolean,
        default: false,
      },
      n8nWebhook: {
        type: String,
        default: null, // Placeholder for n8n webhook URL
      },
      autoOptimize: {
        type: Boolean,
        default: false,
      },
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Budget', BudgetSchema);
