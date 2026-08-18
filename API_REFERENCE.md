# Budget Management System - Complete API Reference

## Base URL
```
http://localhost:5000/api
```

---

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## Budget Endpoints

### 1. Create Budget
```
POST /budgets
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "name": "Monthly Groceries",
  "category": "groceries",
  "totalBudget": 500,
  "currency": "USD",
  "period": "monthly",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "alerts": {
    "warningThreshold": 75,
    "criticalThreshold": 90
  },
  "marketPriceTracking": {
    "enabled": true,
    "updateFrequency": "daily"
  },
  "aiAutomation": {
    "enabled": true,
    "n8nWebhook": "http://localhost:5678/webhook",
    "autoOptimize": false
  }
}

Response (201 Created):
{
  "success": true,
  "data": {
    "_id": "67...",
    "owner": "user_id",
    "name": "Monthly Groceries",
    "totalBudget": 500,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z",
    ...
  },
  "message": "Budget created successfully"
}
```

---

### 2. Get All Budgets
```
GET /budgets
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": [
    { /* budget 1 */ },
    { /* budget 2 */ },
    ...
  ]
}
```

---

### 3. Get Budget with Analytics
```
GET /budgets/:budgetId
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "budget": {
      "_id": "67...",
      "name": "Monthly Groceries",
      "totalBudget": 500,
      ...
    },
    "analytics": {
      "budgetStatus": {
        "percentageUsed": 45.5,
        "remaining": 272.5,
        "totalBudget": 500,
        "totalSpent": 227.5,
        "status": "healthy"
      },
      "spendingByCategory": [
        { "category": "produce", "amount": 125.50 },
        { "category": "dairy", "amount": 75.25 },
        { "category": "meat", "amount": 27.75 }
      ],
      "trends": [
        { "period": "2024-01-01", "amount": 45.50 },
        { "period": "2024-01-08", "amount": 67.25 },
        { "period": "2024-01-15", "amount": 114.75 }
      ],
      "exhaustion": {
        "dailyRate": 10.27,
        "daysRemaining": 26.54,
        "projectedExhaustionDate": "2024-01-27T14:30:00Z",
        "willExceedBudget": false
      },
      "totalRecords": 25
    }
  }
}
```

---

### 4. Update Budget
```
PUT /budgets/:budgetId
Authorization: Bearer <token>

Body (all fields optional):
{
  "name": "Weekly Groceries",
  "totalBudget": 150,
  "alerts": {
    "warningThreshold": 80,
    "criticalThreshold": 95
  },
  "status": "paused"
}

Response (200 OK):
{
  "success": true,
  "data": { /* updated budget */ },
  "message": "Budget updated successfully"
}
```

---

### 5. Delete Budget
```
DELETE /budgets/:budgetId
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "message": "Budget deleted successfully"
}

Note: Deletes all associated spending records
```

---

### 6. Optimize Budget (AI via n8n)
```
POST /budgets/:budgetId/optimize
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "category": "produce",
        "suggestion": "Buy at farmers market on Wednesdays",
        "estimatedSavings": 15.50
      }
    ],
    "potentialSavings": 45.75,
    "jobId": "n8n_job_123"
  },
  "message": "Budget optimization triggered..."
}
```

---

## Spending Endpoints

### 1. Log Spending
```
POST /spending
Authorization: Bearer <token>

Body:
{
  "budget": "budget_id",
  "item": "Organic Apples",
  "category": "produce",
  "amount": 12.50,
  "quantity": {
    "value": 5,
    "unit": "piece"
  },
  "vendor": "Whole Foods",
  "receipt": {
    "originalPrice": 15.00,
    "discountApplied": 2.50,
    "finalPrice": 12.50,
    "paymentMethod": "credit"
  },
  "notes": "On sale this week",
  "transactionDate": "2024-01-15T14:30:00Z"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "_id": "spending_67...",
    "budget": "budget_id",
    "item": "Organic Apples",
    "amount": 12.50,
    "isValidated": false,
    "createdAt": "2024-01-15T14:30:00Z"
  },
  "budgetStatus": {
    "percentageUsed": 50.1,
    "remaining": 249.5,
    "status": "healthy"
  },
  "alerts": [],
  "message": "Spending transaction recorded successfully"
}
```

---

### 2. Get Spending Records
```
GET /spending/:budgetId?category=produce&vendor=Whole&sortBy=-transactionDate
Authorization: Bearer <token>

Query Parameters:
- category: string (optional)
- vendor: string (optional, regex match)
- startDate: ISO date (optional)
- endDate: ISO date (optional)
- sortBy: string (default: -transactionDate)

Response (200 OK):
{
  "success": true,
  "data": [
    { /* spending record 1 */ },
    { /* spending record 2 */ },
    ...
  ],
  "count": 25
}
```

---

### 3. Get Spending Analytics
```
GET /spending/:budgetId/analytics
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "budgetStatus": {
      "percentageUsed": 45.5,
      "remaining": 272.5,
      "totalBudget": 500,
      "totalSpent": 227.5,
      "status": "healthy"
    },
    "spendingByCategory": [
      { "category": "produce", "amount": 125.50 },
      { "category": "dairy", "amount": 75.25 }
    ],
    "trends": [
      { "period": "2024-01-01", "amount": 45.50 },
      { "period": "2024-01-08", "amount": 67.25 }
    ],
    "marketComparison": [
      {
        "item": "Apples",
        "paidPrice": 2.50,
        "marketPrice": 2.35,
        "comparison": 6.38,
        "savingOpportunity": 0.15,
        "cheapestVendor": "Trader Joe's"
      }
    ],
    "recommendations": [
      {
        "severity": "info",
        "message": "Your highest spending is in produce ($125.50)..."
      }
    ],
    "totalRecords": 25
  }
}
```

---

### 4. Update Spending Record
```
PUT /spending/:spendingId
Authorization: Bearer <token>

Body (any fields):
{
  "amount": 11.99,
  "notes": "Price changed after validation",
  "isValidated": true,
  "validationNotes": "Verified via receipt"
}

Response (200 OK):
{
  "success": true,
  "data": { /* updated record */ },
  "message": "Spending record updated successfully"
}
```

---

### 5. Delete Spending Record
```
DELETE /spending/:spendingId
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "message": "Spending record deleted successfully"
}
```

---

### 6. Validate Receipt (AI via n8n)
```
POST /spending/validate-receipt
Authorization: Bearer <token>

Body:
{
  "budgetId": "budget_id",
  "receiptData": {
    "image_url": "https://...",
    "text": "receipt text content",
    "total": 45.50
  }
}

Response (200 OK):
{
  "success": true,
  "data": {
    "validatedItems": [
      { "item": "Bread", "price": 3.50, "quantity": 1 },
      { "item": "Milk", "price": 4.25, "quantity": 2 }
    ],
    "totalAmount": 45.50,
    "isValid": true,
    "jobId": "n8n_job_456"
  },
  "message": "Receipt validated successfully"
}
```

---

### 7. Detect Anomalies (AI via n8n)
```
POST /spending/detect-anomalies/:budgetId
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "type": "unusual_vendor",
        "severity": "warning",
        "message": "Purchase from new vendor (not in history)",
        "item": "Electronics",
        "amount": 299.99
      }
    ],
    "alerts": [
      {
        "type": "spending_spike",
        "message": "Spending 45% higher than average week"
      }
    ],
    "jobId": "n8n_job_789"
  },
  "message": "Anomaly detection completed"
}
```

---

## Market Data Endpoints

### 1. Add/Update Market Data
```
POST /market
Authorization: Bearer <token>

Body:
{
  "item": "Apples",
  "category": "produce",
  "averagePrice": 2.35,
  "minPrice": 2.00,
  "maxPrice": 3.50,
  "prices": [
    {
      "vendor": "Trader Joe's",
      "price": 2.35,
      "quantity": { "value": 1, "unit": "lb" },
      "date": "2024-01-15",
      "location": "Downtown"
    }
  ],
  "seasonality": {
    "isSeasonal": true,
    "season": "Fall",
    "peakPrice": 3.50,
    "lowPrice": 1.50
  }
}

Response (201 Created or 200 OK):
{
  "success": true,
  "data": { /* market data */ },
  "message": "Market data created/updated"
}
```

---

### 2. Get All Market Data
```
GET /market?category=produce&sortBy=-lastUpdated
Authorization: Optional

Query Parameters:
- category: string (optional)
- sortBy: string (default: -lastUpdated)

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "item": "apples",
      "category": "produce",
      "averagePrice": 2.35,
      "minPrice": 2.00,
      "maxPrice": 3.50,
      "priceChange": {
        "trend": "down",
        "percentageChange": -3.2
      },
      "lastUpdated": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 45
}
```

---

### 3. Get Market Data for Item
```
GET /market/:item
Authorization: Optional

Response (200 OK):
{
  "success": true,
  "data": {
    "_id": "market_67...",
    "item": "apples",
    "category": "produce",
    "averagePrice": 2.35,
    "prices": [
      {
        "vendor": "Trader Joe's",
        "price": 2.35,
        "quantity": { "value": 1, "unit": "lb" },
        "date": "2024-01-15"
      }
    ],
    "aiPrediction": {
      "predictedPrice": 2.28,
      "confidence": 87,
      "predictionDate": "2024-01-15"
    }
  }
}
```

---

### 4. Get Market Data by Category
```
GET /market/category/:category
Authorization: Optional

Response (200 OK):
{
  "success": true,
  "data": [
    { /* apples */ },
    { /* oranges */ },
    { /* grapes */ }
  ],
  "count": 12
}
```

---

### 5. Fetch Market Prices (AI via n8n)
```
POST /market/fetch-prices
Authorization: Bearer <token>

Body:
{
  "items": ["apple", "milk", "bread"],
  "category": "groceries"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "priceData": [
      {
        "item": "apple",
        "vendor": "Walmart",
        "price": 2.50,
        "quantity": { "value": 1, "unit": "lb" }
      },
      {
        "item": "milk",
        "vendor": "Target",
        "price": 3.99,
        "quantity": { "value": 1, "unit": "liter" }
      }
    ],
    "jobId": "n8n_job_999"
  },
  "message": "Market prices fetched and updated"
}
```

---

### 6. Get Price Prediction (AI via n8n)
```
POST /market/predict/:item
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "item": "apple",
    "currentPrice": 2.35,
    "predictedPrice": 2.28,
    "confidence": 87,
    "jobId": "n8n_job_555"
  }
}
```

---

### 7. Update Market Data
```
PUT /market/:marketDataId
Authorization: Bearer <token>

Body:
{
  "averagePrice": 2.40,
  "prices": [
    {
      "vendor": "Whole Foods",
      "price": 2.95,
      "quantity": { "value": 1, "unit": "lb" }
    }
  ]
}

Response (200 OK):
{
  "success": true,
  "data": { /* updated market data */ },
  "message": "Market data updated successfully"
}
```

---

### 8. Delete Market Data
```
DELETE /market/:marketDataId
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "message": "Market data deleted successfully"
}
```

---

## System Endpoints

### Health Check
```
GET /health
Authorization: Optional

Response (200 OK):
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "n8n": "connected",
  "timestamp": "2024-01-15T14:30:00Z"
}

Response (500 Server Error):
{
  "success": false,
  "error": "Database connection failed"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "errors": [
    "Budget name is required and must be a non-empty string",
    "Total budget must be a positive number"
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Budget not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Database connection failed"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Backend issue |

---

## Budget Status Values

| Status | % Used | Meaning |
|--------|--------|---------|
| `healthy` | < 75% | Good, spending is on track |
| `warning` | 75-90% | Caution, approaching limit |
| `critical` | 90-100% | Alert, almost over budget |
| `over-budget` | > 100% | Over limit, reduce spending |

---

## Category Values

**For Budgets:**
- `groceries`
- `meals`
- `ingredients`
- `household`
- `other`

**For Items:**
- `produce`
- `dairy`
- `meat`
- `pantry`
- `frozen`
- `beverages`
- `other`

---

## Time Period Values

- `daily`
- `weekly`
- `monthly`
- `yearly`

---

## Quantity Units

- `kg` - Kilograms
- `lb` - Pounds
- `liter` - Liters
- `piece` - Individual item
- `box` - Box
- `bundle` - Bundle

---

## Pagination (Optional Enhancement)

Consider adding pagination for large datasets:

```
GET /spending/:budgetId?page=1&limit=20&sortBy=-transactionDate

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "pages": 7
  }
}
```

---

## Rate Limiting (Optional)

Recommended limits:
- 100 requests/minute per user (authenticated)
- 10 requests/minute per IP (unauthenticated)

---

## Sorting

Use `-` prefix for descending order:
- `sortBy=createdAt` (ascending)
- `sortBy=-createdAt` (descending)
- `sortBy=-amount` (highest amount first)

---

## Examples (cURL)

### Create Budget
```bash
curl -X POST http://localhost:5000/api/budgets \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekly Groceries",
    "totalBudget": 150,
    "period": "weekly",
    "startDate": "2024-01-01",
    "endDate": "2024-01-07"
  }'
```

### Log Spending
```bash
curl -X POST http://localhost:5000/api/spending \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "budget": "67abc...",
    "item": "Milk",
    "category": "dairy",
    "amount": 3.99,
    "quantity": { "value": 1, "unit": "liter" },
    "vendor": "Whole Foods",
    "transactionDate": "2024-01-15T10:30:00Z"
  }'
```

### Get Analytics
```bash
curl -X GET http://localhost:5000/api/budgets/67abc... \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## WebSocket Support (Future)

Consider adding WebSocket for real-time updates:
- Budget threshold alerts
- Price change notifications
- Anomaly detection alerts

---

---

**Last Updated:** 2024-01-15
**API Version:** 1.0
