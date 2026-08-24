import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import MarketData from '../models/MarketData.js';
import ejoChat from '../services/ejoChat.js';
import n8nAutomation from '../services/n8nAutomation.js';

async function testServices() {
  console.log('--- Testing EjoChat ---');
  try {
    const ejoHealth = await ejoChat.isHealthy();
    console.log('EjoChat Healthy:', ejoHealth);
  } catch (err) {
    console.log('EjoChat error:', err.message);
  }

  console.log('--- Testing n8n ---');
  try {
    const n8nHealth = await n8nAutomation.checkN8nHealth();
    console.log('n8n Healthy:', n8nHealth);
  } catch (err) {
    console.log('n8n error:', err.message);
  }

  console.log('--- Testing MongoDB ---');
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully!');
    const count = await MarketData.countDocuments();
    console.log('MarketData count:', count);
    const items = await MarketData.find().limit(10);
    console.log('Sample items in MarketData:', items.map(i => i.item));
    await mongoose.disconnect();
  } catch (err) {
    console.log('MongoDB error:', err.message);
  }
}

testServices();
