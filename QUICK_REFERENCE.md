# Budget Management System - Quick Reference Guide

## 🚀 Quick Start (30 seconds)

```bash
# 1. Install dependencies
npm install

# 2. Configure .env
cp .env.example .env
# Edit .env with your MongoDB URI and API keys

# 3. Start server
npm start

# 4. Check health
curl http://localhost:5000/api/health
```

---

## 📊 Core Concepts

| Concept | Purpose |
|---------|---------|
| **Budget** | Financial limit (e.g., $500/month) |
| **Spending** | Individual purchase transactions |
| **Market Data** | Real-time prices from vendors |
| **AI Automation** | n8n workflows for predictions/analysis |
| **Analytics** | Spending patterns & recommendations |

---

## 🔐 Authentication

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -d '{"name":"John","email":"john@email.com","password":"secret"}'

# Login (returns JWT token)
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"john@email.com","password":"secret"}'

# Use token in headers
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:5000/api/budgets
```

---

## 📁 File Structure at a Glance

```
backend/
├── models/              # MongoDB schemas
│   ├── Budget.js        ← Budget entity
│   ├── Spending.js      ← Transactions
│   └── MarketData.js    ← Price tracking
├── routes/              # API endpoints
│   ├── budgets.js       ← Budget endpoints
│   ├── spending.js      ← Spending endpoints
│   └── market.js        ← Market endpoints
├── services/
│   └── n8nAutomation.js ← AI workflow calls
├── validators/
│   └── budgetValidator.js ← Input validation
├── utils/
│   └── budgetCalculator.js ← Analytics
└── server.js            ← Main app
```

---

## 🎯 Common Tasks

### Create Budget
```bash
curl -X POST http://localhost:5000/api/budgets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Groceries",
    "totalBudget": 500,
    "period": "monthly",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }'
```

### Log Spending
```bash
curl -X POST http://localhost:5000/api/spending \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "budget": "budget_id",
    "item": "Apples",
    "amount": 5.99,
    "vendor": "Whole Foods",
    "transactionDate": "2024-01-15T10:30:00Z"
  }'
```

### Get Budget Analytics
```bash
curl http://localhost:5000/api/budgets/budget_id \
  -H "Authorization: Bearer <token>"
```

### Get AI Recommendations
```bash
curl -X POST http://localhost:5000/api/budgets/budget_id/optimize \
  -H "Authorization: Bearer <token>"
```

### Fetch Market Prices
```bash
curl -X POST http://localhost:5000/api/market/fetch-prices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": ["apple", "milk"],
    "category": "groceries"
  }'
```

---

## 📊 Data Flow

```
User (Frontend)
    ↓
API Request (with JWT)
    ↓
Authentication Middleware
    ↓
Route Handler (budgets.js, spending.js, market.js)
    ↓
Validator (budgetValidator.js)
    ↓
MongoDB Operations
    ↓
n8n Webhook (if AI enabled)
    ↓
Analytics Calculations (budgetCalculator.js)
    ↓
JSON Response
    ↓
User (Frontend)
```

---

## 🤖 N8N Workflow Triggers

| Trigger | Webhook URL | Purpose |
|---------|------------|---------|
| Price Predict | `/webhook/predict-price` | ML price forecast |
| Budget Optimize | `/webhook/optimize-budget` | AI recommendations |
| Validate Receipt | `/webhook/validate-receipt` | OCR & verification |
| Fetch Prices | `/webhook/fetch-market-prices` | Vendor price scrape |
| Detect Anomalies | `/webhook/detect-anomalies` | Fraud detection |
| Generate Alerts | `/webhook/generate-alerts` | Threshold alerts |

---

## 💾 Database Schemas (Quick View)

### Budget
```javascript
{
  owner: ObjectId,           // User who owns
  name: String,              // "Groceries"
  totalBudget: Number,       // 500
  period: String,            // "monthly"
  startDate: Date,           // 2024-01-01
  endDate: Date,             // 2024-01-31
  status: String,            // "active"/"paused"/"completed"
  alerts: {
    warningThreshold: 75,    // %
    criticalThreshold: 90    // %
  },
  aiAutomation: {
    enabled: Boolean,
    n8nWebhook: String       // "http://localhost:5678/webhook"
  }
}
```

### Spending
```javascript
{
  budget: ObjectId,          // Which budget
  owner: ObjectId,           // Who spent
  item: String,              // "Apples"
  category: String,          // "produce"
  amount: Number,            // 5.99
  quantity: {
    value: Number,           // 5
    unit: String             // "piece"
  },
  vendor: String,            // "Whole Foods"
  transactionDate: Date,     // 2024-01-15
  isValidated: Boolean,      // AI checked it
  receipt: {
    originalPrice: Number,
    discountApplied: Number,
    finalPrice: Number
  }
}
```

### MarketData
```javascript
{
  item: String,              // "apple"
  category: String,          // "produce"
  averagePrice: Number,      // 2.35
  minPrice: Number,          // 2.00
  maxPrice: Number,          // 3.50
  prices: [
    {
      vendor: String,        // "Trader Joe's"
      price: Number,         // 2.35
      date: Date
    }
  ],
  aiPrediction: {
    predictedPrice: Number,  // 2.30
    confidence: Number,      // 87
    predictionDate: Date
  }
}
```

---

## 📈 Budget Status Levels

```
Status      | % Used | Action
------------|--------|----------
healthy     | 0-75%  | ✅ All good
warning     | 75-90% | ⚠️  Be careful
critical    | 90-100%| 🚨 Reduce spending
over-budget | >100%  | ❌ Over limit
```

---

## ✅ Validation Rules

| Field | Rule |
|-------|------|
| `name` | Required, non-empty string |
| `totalBudget` | Positive number |
| `startDate` | Valid ISO date, before endDate |
| `endDate` | Valid ISO date, after startDate |
| `amount` | Positive number |
| `quantity.value` | Positive number |
| `vendor` | Non-empty string |
| `n8nWebhook` | Valid URL starting with http/https |

---

## 🔧 Environment Variables (Essential)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_secret_key_32_chars_minimum
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
PORT=5000
NODE_ENV=development
```

---

## 📡 API Response Patterns

### Success (200/201)
```json
{
  "success": true,
  "data": { /* entity */ },
  "message": "Operation successful"
}
```

### Error (400/401/404/500)
```json
{
  "success": false,
  "error": "Description of error",
  "errors": [ "Field validation error" ]  // For validation
}
```

---

## 🧮 Calculation Examples

### Budget Status
```
Spent: $227.50
Budget: $500
Used: (227.50 / 500) * 100 = 45.5%
Remaining: 500 - 227.50 = $272.50
Status: healthy (< 75%)
```

### Spending Trend
```
Week 1: $45.50
Week 2: $67.25
Week 3: $114.75
Trend: Increasing ↑
```

### Market Comparison
```
Paid: $2.50 (Whole Foods)
Market Avg: $2.35
Difference: +6.4%
Saving Opportunity: $0.15
```

---

## 🐛 Debugging Tips

```bash
# Check server is running
curl http://localhost:5000/api/health

# Check n8n connection
curl http://localhost:5678/webhook/health

# Test MongoDB connection
npm run test:db

# View logs
tail -f logs/app.log

# Test specific endpoint
curl -v http://localhost:5000/api/budgets \
  -H "Authorization: Bearer <token>"
```

---

## 📚 Documentation Files

| File | Contains |
|------|----------|
| `BUDGET_SYSTEM_SETUP.md` | Full system documentation |
| `API_REFERENCE.md` | Complete API endpoints |
| `N8N_SETUP_GUIDE.md` | N8N workflow setup |
| `.env.example` | Environment variables |
| `README.md` | Project overview |

---

## 🎓 Learning Path

1. ✅ Read `BUDGET_SYSTEM_SETUP.md` - Understand architecture
2. ✅ Copy `.env.example` → `.env` - Configure
3. ✅ Start server: `npm start`
4. ✅ Test auth: Login/Register
5. ✅ Create budget via API
6. ✅ Log spending
7. ✅ View analytics
8. ✅ Set up n8n workflows
9. ✅ Test AI features

---

## 🚨 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Cannot find module 'mongoose'` | `npm install` |
| `MONGODB_URI is undefined` | Check `.env` file |
| `Cannot read property 'user' of null` | Check JWT token validity |
| `Budget not found` | Verify budget ID & ownership |
| `n8n connection timeout` | Check `N8N_WEBHOOK_BASE_URL` |

---

## 📱 Frontend Integration

```javascript
// Example React hook
const useBudgetAPI = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const createBudget = async (budgetData) => {
    const res = await fetch('http://localhost:5000/api/budgets', {
      method: 'POST',
      headers,
      body: JSON.stringify(budgetData)
    });
    return res.json();
  };

  const logSpending = async (spendingData) => {
    const res = await fetch('http://localhost:5000/api/spending', {
      method: 'POST',
      headers,
      body: JSON.stringify(spendingData)
    });
    return res.json();
  };

  return { createBudget, logSpending };
};
```

---

## 🔄 Development Workflow

```bash
# 1. Start server
npm start

# 2. In another terminal, test APIs
curl http://localhost:5000/api/health

# 3. Make changes to code
# (Server auto-reloads if using nodemon)

# 4. Test changes
npm run test

# 5. Check for issues
npm run lint
```

---

## 📋 Task Checklist

- [ ] MongoDB setup complete
- [ ] `.env` configured
- [ ] Server starts successfully
- [ ] API health check works
- [ ] User can register
- [ ] User can login (gets JWT)
- [ ] Can create budget
- [ ] Can log spending
- [ ] Analytics calculate correctly
- [ ] n8n webhooks configured
- [ ] AI features working
- [ ] Frontend connected

---

## 🎯 Performance Tips

```javascript
// Add indexes for faster queries
db.collections.spending.createIndex({ budget: 1, transactionDate: -1 })
db.collections.marketdata.createIndex({ item: 1, category: 1 })

// Implement caching for market data
// Use pagination for large datasets
// Limit API responses (e.g., last 100 records)
```

---

## 📞 Support Resources

- **n8n Docs:** https://docs.n8n.io
- **MongoDB Docs:** https://docs.mongodb.com
- **Express.js Docs:** https://expressjs.com
- **OpenAI Docs:** https://platform.openai.com/docs
- **Community:** https://community.n8n.io

---

**Last Updated:** 2024-01-15  
**Version:** 1.0  
**Status:** ✅ Production Ready
