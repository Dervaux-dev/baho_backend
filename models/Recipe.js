import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  costRWF: { type: Number, required: true }
}, { _id: false });

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  proteinGrams: { type: Number, default: 0 },
  carbsGrams: { type: Number, default: 0 },
  fatGrams: { type: Number, default: 0 }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  recipeName: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ingredients: [ingredientSchema],
  totalCostRWF: { type: Number, required: true },
  suggestedPriceRWF: { type: Number, required: true },
  marginPercentage: { type: Number, required: true },
  nutrition: nutritionSchema,
  businessAdvice: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Recipe', recipeSchema);