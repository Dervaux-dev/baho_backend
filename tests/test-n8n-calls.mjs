import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import n8nAutomation from '../services/n8nAutomation.js';

async function testN8nCalls() {
  console.log('Testing analyzeRecipe...');
  try {
    const res = await n8nAutomation.analyzeRecipe({
      recipeName: 'Isombe',
      ingredients: [
        { name: 'Maize Flour', quantity: '2kg', costRWF: 2000 },
        { name: 'Cooking Oil', quantity: '1L', costRWF: 3000 }
      ],
      budgetProfile: { householdSize: 4, location: 'Kigali, Rwanda' }
    });
    console.log('analyzeRecipe result:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('analyzeRecipe thrown:', err);
  }

  console.log('Testing predictItemPrice...');
  try {
    const res = await n8nAutomation.predictItemPrice('maize', [], 'produce');
    console.log('predictItemPrice result:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('predictItemPrice thrown:', err);
  }
}

testN8nCalls();
