# Budget Management System - Setup & Documentation

## Overview
This is a complete **Budget Management System for Buyers** featuring:
- ✅ User authentication & authorization
- ✅ Budget creation & tracking
- ✅ Spending management with categories
- ✅ Market data integration (real-time price tracking)
- ✅ AI-powered insights via n8n automation
- ✅ Budget analytics & recommendations
- ✅ Receipt validation via AI
- ✅ Anomaly detection for fraud/overspending
- ✅ Price prediction models

---

## Project Structure

```
backend/
├── models/
│   ├── User.js              (Already exists)
│   ├── Recipe.js            (Already exists)
│   ├── Budget.js            (NEW - Budget entity)
│   ├── Spending.js          (NEW - Spending transactions)
│   └── MarketData.js        (NEW - Market price tracking)
├── routes/
│   ├── budgets.js           (NEW - Budget management endpoints)
│   ├── spending.js          (NEW - Spending transaction endpoints)
│   └── market.js            (NEW - Market data endpoints)
├── middleware/
│   └── auth.js              (Already exists)
├── validators/
│   └── budgetValidator.js   (NEW - Input validation)
├── utils/
│   ├── auth.js              (Already exists)
│   └── budgetCalculator.js  (NEW - Budget calculations & analytics)
├── services/
│   └── n8nAutomation.js     (NEW - n8n workflow integration)
├── server.js                (UPDATED - Added new routes)
└── package.json
```

---

## Data Models

### Budget Model
Stores user budgets with tracking configuration.

**Fields:**
- `owner` - User ID (MongoDB ref)
- `name` - Budget name
- `category` - Type (groceries, meals, ingredients, household, other)
- `totalBudget` - Total budget amount
- `currency` - Currency code (default: USD)
- `period` - Duration (weekly, monthly, yearly)
- `startDate` / `endDate` - Budget period
- `alerts` - Warning/critical thresholds (%)
- `marketPriceTracking` - Auto price tracking config
- `aiAutomation` - n8n webhook URL & automation settings
- `status` - active/paused/completed

### Spending Model
Records individual spending transactions.

**Fields:**
- `budget` - Budget ID (MongoDB ref)
- `owner` - User ID
- `item` - Item name
- `category` - Item category (produce, dairy, meat, pantry, frozen, beverages, other)
- `amount` - Price paid
- `quantity` - Amount purchased
- `vendor` - Store/vendor name
- `marketData` - Price comparison & trend data
- `receipt` - Original price, discount, final price
- `transactionDate` - When purchase occurred
- `isValidated` - AI validation status
- `validationNotes` - Validation details

### MarketData Model
Tracks market prices for items across vendors.

**Fields:**
- `item` - Product name
- `category` - Product category
- `prices` - Array of vendor prices with dates
- `averagePrice` - Calculated average
- `minPrice` / `maxPrice` - Price range
- `priceChange` - Trend (up/down/stable) & percentage
- `seasonality` - Seasonal price info
- `aiPrediction` - AI-predicted price & confidence
- `source` - Data source (manual/api/n8n)

---

## API Endpoints

### Authentication (Existing)
```
POST   /api/auth/register        - Create new account
POST   /api/auth/login           - Sign in
```

### Budget Management
```
POST   /api/budgets              - Create budget
GET    /api/budgets              - List all budgets
GET    /api/budgets/:budgetId    - Get budget with analytics
PUT    /api/budgets/:budgetId    - Update budget
DELETE /api/budgets/:budgetId    - Delete budget
POST   /api/budgets/:budgetId/optimize - Trigger AI optimization (n8n)
```

### Spending Tracking
```
POST   /api/spending              - Log spending transaction
GET    /api/spending/:budgetId    - Get spending records (with filtering)
GET    /api/spending/:budgetId/analytics - Get spending analytics
PUT    /api/spending/:spendingId  - Update transaction
DELETE /api/spending/:spendingId  - Delete transaction
POST   /api/spending/validate-receipt - AI receipt validation (n8n)
POST   /api/spending/detect-anomalies/:budgetId - Detect fraud/anomalies (n8n)
```

### Market Data & Prices
```
POST   /api/market               - Add/update market data
GET    /api/market              - Get all market data
GET    /api/market/:item        - Get item price data
GET    /api/market/category/:category - Get category prices
PUT    /api/market/:marketDataId - Update market data
POST   /api/market/fetch-prices - Fetch prices from vendors (n8n)
POST   /api/market/predict/:item - Get AI price prediction (n8n)
DELETE /api/market/:marketDataId - Delete market data
```

### System Health
```
GET    /api/health              - Check DB & n8n connection status
```

---

## N8N Automation Integration

The system uses **n8n workflows** for AI-powered features. These are **placeholders** ready for your n8n configuration:

### Required N8N Workflows

#### 1. **Predict Price** (`/webhook/predict-price`)
**Input:**
```json
{
  "item": "apple",
  "category": "produce",
  "priceHistory": [
    { "date": "2024-01-01", "price": 2.5, "vendor": "Store A" }
  ]
}
```
**Output:**
```json
{
  "predictedPrice": 2.45,
  "confidence": 85,
  "jobId": "job_123"
}
```
**Purpose:** ML model predicts next price based on history

---

#### 2. **Optimize Budget** (`/webhook/optimize-budget`)
**Input:**
```json
{
  "budgetId": "budget_id",
  "spendingHistory": [...],
  "totalBudget": 500
}
```
**Output:**
```json
{
  "recommendations": [
    { "item": "milk", "savingTip": "Buy in bulk at Vendor X" }
  ],
  "potentialSavings": 50,
  "jobId": "job_456"
}
```
**Purpose:** AI analyzes patterns and suggests budget optimizations

---

#### 3. **Validate Receipt** (`/webhook/validate-receipt`)
**Input:**
```json
{
  "receiptData": {
    "image_url": "...",
    "text": "receipt text",
    "total": 45.50
  }
}
```
**Output:**
```json
{
  "validatedItems": [
    { "item": "bread", "price": 3.50 }
  ],
  "totalAmount": 45.50,
  "isValid": true,
  "jobId": "job_789"
}
```
**Purpose:** OCR + AI extracts & validates receipt data

---

#### 4. **Fetch Market Prices** (`/webhook/fetch-market-prices`)
**Input:**
```json
{
  "items": ["apple", "milk"],
  "category": "groceries"
}
```
**Output:**
```json
{
  "priceData": [
    { "item": "apple", "vendor": "Store A", "price": 2.50 }
  ],
  "jobId": "job_999"
}
```
**Purpose:** Scrape/API fetch prices from multiple vendors

---

#### 5. **Detect Anomalies** (`/webhook/detect-anomalies`)
**Input:**
```json
{
  "userId": "user_id",
  "spendingData": [...],
  "timeframe": "monthly"
}
```
**Output:**
```json
{
  "anomalies": [
    { "type": "fraud", "message": "Unusual spending pattern" }
  ],
  "alerts": [...],
  "jobId": "job_555"
}
```
**Purpose:** ML detects unusual activity

---

#### 6. **Generate Alerts** (`/webhook/generate-alerts`)
**Input:**
```json
{
  "budgetId": "id",
  "currentSpent": 450,
  "totalBudget": 500,
  "percentageUsed": 90,
  "thresholds": { "warning": 80, "critical": 95 }
}
```
**Output:**
```json
{
  "alerts": [
    { "level": "critical", "message": "90% of budget used" }
  ],
  "recommendations": [...],
  "jobId": "job_666"
}
```
**Purpose:** Generate threshold-based alerts

---

## Environment Variables

Add these to your `.env` file:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/budgetdb

# Authentication
JWT_SECRET=your_jwt_secret_key

# n8n Integration
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
# or your hosted n8n instance
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com/webhook

# Server
PORT=5000
```

---

## Usage Examples

### 1. Create a Budget
```bash
curl -X POST http://localhost:5000/api/budgets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Groceries",
    "category": "groceries",
    "totalBudget": 500,
    "period": "monthly",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "aiAutomation": {
      "enabled": true,
      "n8nWebhook": "http://localhost:5678/webhook"
    }
  }'
```

### 2. Log a Spending Transaction
```bash
curl -X POST http://localhost:5000/api/spending \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "budget": "budget_id",
    "item": "Organic Apples",
    "category": "produce",
    "amount": 12.50,
    "quantity": { "value": 5, "unit": "piece" },
    "vendor": "Whole Foods",
    "transactionDate": "2024-01-15"
  }'
```

### 3. Get Budget Analytics
```bash
curl -X GET http://localhost:5000/api/budgets/budget_id \
  -H "Authorization: Bearer <token>"
```

**Response includes:**
- Budget status (% used, remaining)
- Spending by category
- Spending trends
- Exhaustion prediction
- Analytics data

### 4. Trigger AI Budget Optimization
```bash
curl -X POST http://localhost:5000/api/budgets/budget_id/optimize \
  -H "Authorization: Bearer <token>"
```

### 5. Fetch Market Prices
```bash
curl -X POST http://localhost:5000/api/market/fetch-prices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": ["apple", "milk", "bread"],
    "category": "groceries"
  }'
```

### 6. Get Price Prediction
```bash
curl -X POST http://localhost:5000/api/market/predict/apple \
  -H "Authorization: Bearer <token>"
```

---

## Validation & Error Handling

All endpoints include input validation via `budgetValidator.js`:
- ✅ Required field checks
- ✅ Data type validation
- ✅ Numeric range checks
- ✅ Date validation
- ✅ n8n webhook URL validation
- ✅ Proper HTTP status codes (400, 404, 500, etc.)

---

## Analytics & Calculations

The `budgetCalculator.js` utility provides:

1. **Budget Status** - Total spent, remaining, % used, health status
2. **Category Breakdown** - Spending by category
3. **Trends** - Daily/weekly/monthly spending trends
4. **Exhaustion Prediction** - When budget will be depleted
5. **Market Comparison** - Compare prices to market averages
6. **Recommendations** - AI-powered suggestions based on patterns

---

## Security Features

✅ JWT authentication on all protected routes  
✅ User ownership verification (users see only their data)  
✅ Password hashing with salt  
✅ CORS enabled (configure as needed)  
✅ Role-based access (extensible for admin features)  
✅ Input validation on all endpoints  

---

## Next Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up n8n workflows** - Create the 6 webhook workflows above in your n8n instance

3. **Configure `.env`** - Add MongoDB URI and n8n webhook base URL

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Test the API** - Use the examples above or a REST client (Postman, Insomnia, etc.)

6. **Frontend integration** - Connect your React frontend to these endpoints

---

## Future Enhancements

- 📊 Dashboard visualizations
- 📱 Mobile app
- 🔔 Real-time notifications
- 📈 Advanced ML models for predictions
- 🌍 Multi-currency support
- 👥 Family/group budgets
- 📊 Export reports (PDF/CSV)
- 🔐 Two-factor authentication

---

## Support

For issues or questions, check:
- N8N documentation: https://docs.n8n.io
- MongoDB docs: https://docs.mongodb.com
- Express.js docs: https://expressjs.com
