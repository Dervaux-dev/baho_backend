import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import MarketData from '../models/MarketData.js';
import Recipe from '../models/Recipe.js';
import seedMarketData from '../utils/seedMarketData.js';
import n8nAutomation from '../services/n8nAutomation.js';

async function runVerification() {
  console.log('=== Step 1: Connecting to MongoDB & Seeding ===');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  await seedMarketData();

  const totalMarket = await MarketData.countDocuments();
  console.log(`Total market items in DB: ${totalMarket}`);

  console.log('\n=== Step 2: Testing Market Item Queries & Prediction ===');
  const searchQueries = ['maize', 'maize flour', 'rice', 'isombe', 'fresh tilapia'];
  for (const q of searchQueries) {
    const rawItem = q.trim().toLowerCase();
    let found = await MarketData.findOne({ item: rawItem });
    if (!found) {
      found = await MarketData.findOne({ item: { $regex: `^${rawItem}`, $options: 'i' } });
    }
    if (!found) {
      found = await MarketData.findOne({ item: { $regex: rawItem, $options: 'i' } });
    }

    if (found) {
      console.log(`[Found in DB] "${q}" -> ${found.item} (Avg: RWF ${found.averagePrice})`);
    } else {
      console.log(`[Dynamic item] "${q}" -> will be auto-created`);
    }

    const prediction = await n8nAutomation.predictItemPrice(
      found?.item || rawItem,
      found?.prices || [],
      found?.category || 'produce',
      found?.averagePrice || 1000
    );
    console.log(`Prediction for "${q}": Predicted RWF ${prediction.predictedPrice}, Confidence: ${prediction.confidence}%`);
  }

  console.log('\n=== Step 3: Testing Recipe Analyzer Normalization ===');
  const recipePayload = {
    recipeName: 'cassava',
    ingredients: [
      { name: 'Maize Flour', quantity: '2kg', costRWF: 2000 },
      { name: 'Cooking Oil', quantity: '1L', costRWF: 3000 },
    ],
    budgetProfile: { householdSize: 4, location: 'Kigali, Rwanda' },
  };

  const analyzed = await n8nAutomation.analyzeRecipe(recipePayload);
  console.log('Analyzed Recipe Result:', JSON.stringify(analyzed, null, 2));

  console.log('\n=== Step 4: Testing Recipe Save to MongoDB ===');
  const testRecipe = new Recipe({
    recipeName: analyzed.analysis.recipeName,
    ingredients: recipePayload.ingredients,
    totalCostRWF: analyzed.analysis.totalCostRWF,
    suggestedPriceRWF: analyzed.analysis.suggestedPriceRWF,
    marginPercentage: analyzed.analysis.marginPercentage,
    nutrition: analyzed.analysis.nutrition,
    businessAdvice: analyzed.analysis.businessAdvice,
  });

  const saved = await testRecipe.save();
  console.log(`Successfully saved Recipe! ID: ${saved._id}`);
  console.log(`  Name: ${saved.recipeName}`);
  console.log(`  Total Cost: RWF ${saved.totalCostRWF}`);
  console.log(`  Suggested Price: RWF ${saved.suggestedPriceRWF}`);
  console.log(`  Margin: ${saved.marginPercentage}%`);
  console.log(`  Calories: ${saved.nutrition.calories} kcal`);

  // Clean up test recipe
  await Recipe.deleteOne({ _id: saved._id });
  console.log('Cleaned up test recipe.');

  await mongoose.disconnect();
  console.log('\n>>> ALL VERIFICATION TESTS PASSED SUCCESSFULLY! <<<');
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
