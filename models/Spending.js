import mongoose from 'mongoose';

const SpendingSchema = new mongoose.Schema(
  {
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Budget',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    item: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['produce', 'dairy', 'meat', 'pantry', 'frozen', 'beverages', 'other'],
      default: 'other',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ['kg', 'lb', 'liter', 'piece', 'box', 'bundle'],
        default: 'piece',
      },
    },
    vendor: {
      type: String,
      required: true,
      trim: true,
    },
    marketData: {
      averagePrice: Number,
      priceHistory: [
        {
          date: Date,
          price: Number,
          vendor: String,
        },
      ],
      priceChange: {
        percentage: Number,
        trend: {
          type: String,
          enum: ['up', 'down', 'stable'],
        },
      },
    },
    receipt: {
      originalPrice: Number,
      discountApplied: Number,
      finalPrice: Number,
      paymentMethod: String,
    },
    notes: String,
    transactionDate: {
      type: Date,
      required: true,
    },
    isValidated: {
      type: Boolean,
      default: false,
    },
    validationNotes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Spending', SpendingSchema);
