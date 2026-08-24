import MarketData from '../models/MarketData.js';

export const defaultRwandaStaples = [
  {
    item: 'maize flour',
    category: 'pantry',
    averagePrice: 1000,
    minPrice: 850,
    maxPrice: 1200,
    prices: [
      { vendor: 'Kimironko Market', price: 950, quantity: { value: 1, unit: 'kg' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 900, quantity: { value: 1, unit: 'kg' }, location: 'Nyabugogo' },
      { vendor: 'Simba Supermarket', price: 1150, quantity: { value: 1, unit: 'kg' }, location: 'Kigali City Center' },
      { vendor: 'Sawa City', price: 1200, quantity: { value: 1, unit: 'kg' }, location: 'Kacyiru' },
    ],
    priceChange: { trend: 'stable', percentageChange: 0, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 1050, confidence: 88, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'maize',
    category: 'produce',
    averagePrice: 650,
    minPrice: 500,
    maxPrice: 800,
    prices: [
      { vendor: 'Kimironko Market', price: 600, quantity: { value: 1, unit: 'kg' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 550, quantity: { value: 1, unit: 'kg' }, location: 'Nyabugogo' },
      { vendor: 'Mahoko Market', price: 500, quantity: { value: 1, unit: 'kg' }, location: 'Rubavu' },
    ],
    priceChange: { trend: 'up', percentageChange: 4.5, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 680, confidence: 85, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'rice',
    category: 'pantry',
    averagePrice: 1400,
    minPrice: 1200,
    maxPrice: 1700,
    prices: [
      { vendor: 'Kimironko Market', price: 1350, quantity: { value: 1, unit: 'kg' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 1250, quantity: { value: 1, unit: 'kg' }, location: 'Nyabugogo' },
      { vendor: 'Simba Supermarket', price: 1600, quantity: { value: 1, unit: 'kg' }, location: 'Kigali City Center' },
    ],
    priceChange: { trend: 'stable', percentageChange: 1.2, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 1450, confidence: 89, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'beans',
    category: 'produce',
    averagePrice: 1200,
    minPrice: 1000,
    maxPrice: 1500,
    prices: [
      { vendor: 'Kimironko Market', price: 1150, quantity: { value: 1, unit: 'kg' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 1050, quantity: { value: 1, unit: 'kg' }, location: 'Nyabugogo' },
      { vendor: 'Kicukiro Market', price: 1200, quantity: { value: 1, unit: 'kg' }, location: 'Kicukiro' },
    ],
    priceChange: { trend: 'up', percentageChange: 3.8, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 1250, confidence: 86, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'cooking oil',
    category: 'pantry',
    averagePrice: 3000,
    minPrice: 2800,
    maxPrice: 3500,
    prices: [
      { vendor: 'Kimironko Market', price: 2900, quantity: { value: 1, unit: 'liter' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 2850, quantity: { value: 1, unit: 'liter' }, location: 'Nyabugogo' },
      { vendor: 'Simba Supermarket', price: 3300, quantity: { value: 1, unit: 'liter' }, location: 'Kigali City Center' },
    ],
    priceChange: { trend: 'stable', percentageChange: 0, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 3100, confidence: 91, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'irish potatoes',
    category: 'produce',
    averagePrice: 550,
    minPrice: 450,
    maxPrice: 700,
    prices: [
      { vendor: 'Kimironko Market', price: 550, quantity: { value: 1, unit: 'kg' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 480, quantity: { value: 1, unit: 'kg' }, location: 'Nyabugogo' },
      { vendor: 'Musanze Market', price: 400, quantity: { value: 1, unit: 'kg' }, location: 'Musanze' },
    ],
    priceChange: { trend: 'down', percentageChange: -5.2, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 520, confidence: 87, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'cassava flour',
    category: 'pantry',
    averagePrice: 850,
    minPrice: 700,
    maxPrice: 1050,
    prices: [
      { vendor: 'Kimironko Market', price: 800, quantity: { value: 1, unit: 'kg' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 750, quantity: { value: 1, unit: 'kg' }, location: 'Nyabugogo' },
      { vendor: 'Gahanga Market', price: 700, quantity: { value: 1, unit: 'kg' }, location: 'Kicukiro' },
    ],
    priceChange: { trend: 'stable', percentageChange: 0.5, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 860, confidence: 84, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'cassava',
    category: 'produce',
    averagePrice: 400,
    minPrice: 300,
    maxPrice: 550,
    prices: [
      { vendor: 'Kimironko Market', price: 400, quantity: { value: 1, unit: 'kg' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 350, quantity: { value: 1, unit: 'kg' }, location: 'Nyabugogo' },
    ],
    priceChange: { trend: 'stable', percentageChange: 0, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 410, confidence: 82, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'tomatoes',
    category: 'produce',
    averagePrice: 1200,
    minPrice: 900,
    maxPrice: 1600,
    prices: [
      { vendor: 'Kimironko Market', price: 1100, quantity: { value: 1, unit: 'kg' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 950, quantity: { value: 1, unit: 'kg' }, location: 'Nyabugogo' },
      { vendor: 'Kicukiro Market', price: 1250, quantity: { value: 1, unit: 'kg' }, location: 'Kicukiro' },
    ],
    priceChange: { trend: 'up', percentageChange: 8.3, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 1300, confidence: 83, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'onions',
    category: 'produce',
    averagePrice: 1500,
    minPrice: 1200,
    maxPrice: 1900,
    prices: [
      { vendor: 'Kimironko Market', price: 1400, quantity: { value: 1, unit: 'kg' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 1300, quantity: { value: 1, unit: 'kg' }, location: 'Nyabugogo' },
      { vendor: 'Simba Supermarket', price: 1800, quantity: { value: 1, unit: 'kg' }, location: 'Kigali City Center' },
    ],
    priceChange: { trend: 'up', percentageChange: 6.0, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 1580, confidence: 85, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'beef',
    category: 'meat',
    averagePrice: 4800,
    minPrice: 4200,
    maxPrice: 5500,
    prices: [
      { vendor: 'Kimironko Butchery', price: 4600, quantity: { value: 1, unit: 'kg' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Butchery', price: 4400, quantity: { value: 1, unit: 'kg' }, location: 'Nyabugogo' },
      { vendor: 'La Galette Butchery', price: 5400, quantity: { value: 1, unit: 'kg' }, location: 'Kiyovu' },
    ],
    priceChange: { trend: 'up', percentageChange: 2.1, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 4950, confidence: 90, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'milk',
    category: 'dairy',
    averagePrice: 600,
    minPrice: 500,
    maxPrice: 800,
    prices: [
      { vendor: 'Inyange Milk Center', price: 600, quantity: { value: 1, unit: 'liter' }, location: 'Kacyiru' },
      { vendor: 'Local Milk Zone (Amata)', price: 500, quantity: { value: 1, unit: 'liter' }, location: 'Kimironko' },
      { vendor: 'Simba Supermarket', price: 800, quantity: { value: 1, unit: 'liter' }, location: 'Kigali City Center' },
    ],
    priceChange: { trend: 'stable', percentageChange: 0, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 620, confidence: 92, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'sugar',
    category: 'pantry',
    averagePrice: 1650,
    minPrice: 1500,
    maxPrice: 1900,
    prices: [
      { vendor: 'Kimironko Market', price: 1600, quantity: { value: 1, unit: 'kg' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 1550, quantity: { value: 1, unit: 'kg' }, location: 'Nyabugogo' },
      { vendor: 'Simba Supermarket', price: 1850, quantity: { value: 1, unit: 'kg' }, location: 'Kigali City Center' },
    ],
    priceChange: { trend: 'stable', percentageChange: 1.0, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 1700, confidence: 88, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'eggs',
    category: 'dairy',
    averagePrice: 200,
    minPrice: 180,
    maxPrice: 250,
    prices: [
      { vendor: 'Kimironko Market', price: 190, quantity: { value: 1, unit: 'piece' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 180, quantity: { value: 1, unit: 'piece' }, location: 'Nyabugogo' },
      { vendor: 'Simba Supermarket', price: 230, quantity: { value: 1, unit: 'piece' }, location: 'Kigali City Center' },
    ],
    priceChange: { trend: 'up', percentageChange: 5.0, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 210, confidence: 89, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'bananas',
    category: 'produce',
    averagePrice: 450,
    minPrice: 350,
    maxPrice: 600,
    prices: [
      { vendor: 'Kimironko Market', price: 420, quantity: { value: 1, unit: 'kg' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 380, quantity: { value: 1, unit: 'kg' }, location: 'Nyabugogo' },
    ],
    priceChange: { trend: 'down', percentageChange: -3.5, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 440, confidence: 85, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'bread',
    category: 'pantry',
    averagePrice: 1200,
    minPrice: 1000,
    maxPrice: 1600,
    prices: [
      { vendor: 'Brioche Bakery', price: 1500, quantity: { value: 1, unit: 'piece' }, location: 'Kacyiru' },
      { vendor: 'Local Bakery (Pain)', price: 1000, quantity: { value: 1, unit: 'piece' }, location: 'Kimironko' },
      { vendor: 'Simba Supermarket', price: 1300, quantity: { value: 1, unit: 'piece' }, location: 'Kigali City Center' },
    ],
    priceChange: { trend: 'stable', percentageChange: 0, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 1250, confidence: 91, predictionDate: new Date() },
    source: 'market-survey',
  },
  {
    item: 'isombe',
    category: 'produce',
    averagePrice: 800,
    minPrice: 600,
    maxPrice: 1200,
    prices: [
      { vendor: 'Kimironko Market', price: 750, quantity: { value: 1, unit: 'kg' }, location: 'Kimironko' },
      { vendor: 'Nyabugogo Market', price: 650, quantity: { value: 1, unit: 'kg' }, location: 'Nyabugogo' },
    ],
    priceChange: { trend: 'stable', percentageChange: 0, lastUpdate: new Date() },
    aiPrediction: { predictedPrice: 820, confidence: 86, predictionDate: new Date() },
    source: 'market-survey',
  },
];

export async function seedMarketData() {
  try {
    for (const staple of defaultRwandaStaples) {
      const exists = await MarketData.findOne({ item: staple.item.toLowerCase() });
      if (!exists) {
        await MarketData.create(staple);
      }
    }
    console.log('Rwanda Market Data initialized/verified successfully');
  } catch (error) {
    console.error('Error seeding Rwanda Market Data:', error.message);
  }
}

export default seedMarketData;
