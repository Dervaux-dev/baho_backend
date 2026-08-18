# N8N Automation Setup Guide

This guide shows how to set up n8n workflows for the Budget Management System.

## Installation

1. **Install n8n locally** (or use hosted version):
   ```bash
   npm install n8n -g
   n8n start
   ```
   Access at: http://localhost:5678

2. **Or use n8n Cloud**: https://app.n8n.cloud (recommended for production)

---

## Workflow Blueprints

Create these 6 workflows in your n8n instance. Each has a webhook trigger.

### Workflow 1: Price Prediction

**Name:** `predict-price`

**Trigger:** Webhook (POST)

**Workflow Steps:**
1. Webhook (trigger)
2. OpenAI/Anthropic API call with prompt:
   ```
   "Based on this price history for [item], predict the next price with confidence score:
   [priceHistory as JSON]
   Return JSON: { predictedPrice, confidence (0-100) }"
   ```
3. Return predicted price and confidence

**Webhook URL for config:**
```
http://localhost:5678/webhook/predict-price
```

---

### Workflow 2: Optimize Budget

**Name:** `optimize-budget`

**Trigger:** Webhook (POST)

**Workflow Steps:**
1. Webhook (trigger)
2. OpenAI/Anthropic analysis:
   ```
   "Analyze this spending data and suggest optimizations:
   [spendingHistory]
   Budget limit: [totalBudget]
   Return: { recommendations: [...], potentialSavings: number }"
   ```
3. Calculate potential savings
4. Return recommendations

**Webhook URL:**
```
http://localhost:5678/webhook/optimize-budget
```

---

### Workflow 3: Receipt Validation (OCR)

**Name:** `validate-receipt`

**Trigger:** Webhook (POST)

**Workflow Steps:**
1. Webhook (trigger)
2. If image_url provided: Use Google Vision/Tesseract for OCR
3. Parse receipt text:
   ```
   "Extract items and prices from receipt:
   [receiptData.text]
   Return: { validatedItems: [...], totalAmount, isValid }"
   ```
4. Compare calculated total with provided total
5. Return validation result

**Webhook URL:**
```
http://localhost:5678/webhook/validate-receipt
```

---

### Workflow 4: Fetch Market Prices

**Name:** `fetch-market-prices`

**Trigger:** Webhook (POST)

**Workflow Steps:**
1. Webhook (trigger)
2. For each item, query vendor APIs:
   - Walmart API
   - Amazon Fresh API
   - Local grocery store APIs
   - Or use web scraping (be careful with ToS)
3. Aggregate prices:
   ```json
   {
     "priceData": [
       { "item": "apple", "vendor": "Store A", "price": 2.50 },
       { "item": "apple", "vendor": "Store B", "price": 2.35 }
     ]
   }
   ```
4. Return price data

**Webhook URL:**
```
http://localhost:5678/webhook/fetch-market-prices
```

---

### Workflow 5: Detect Anomalies

**Name:** `detect-anomalies`

**Trigger:** Webhook (POST)

**Workflow Steps:**
1. Webhook (trigger)
2. OpenAI/ML analysis:
   ```
   "Analyze spending for anomalies:
   [spendingData]
   Timeframe: [timeframe]
   Return: { anomalies: [...], alerts: [...] }"
   ```
3. Calculate statistical deviations (std dev, Z-score)
4. Flag unusual transactions
5. Return anomalies and alerts

**Webhook URL:**
```
http://localhost:5678/webhook/detect-anomalies
```

---

### Workflow 6: Generate Alerts

**Name:** `generate-alerts`

**Trigger:** Webhook (POST)

**Workflow Steps:**
1. Webhook (trigger)
2. Check thresholds:
   ```javascript
   if (percentageUsed >= thresholds.critical) {
     alerts.push({ level: 'critical', message: '...' })
   } else if (percentageUsed >= thresholds.warning) {
     alerts.push({ level: 'warning', message: '...' })
   }
   ```
3. Generate recommendations based on alerts
4. Return alerts and recommendations

**Webhook URL:**
```
http://localhost:5678/webhook/generate-alerts
```

---

## Quick Setup (Copy-Paste Templates)

### Basic HTTP Request Template for n8n Nodes

Use "HTTP Request" node to call external APIs:

```json
{
  "method": "POST",
  "url": "https://api.example.com/predict",
  "headers": {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  "body": {
    "item": "{{ $json.item }}",
    "history": "{{ $json.priceHistory }}"
  }
}
```

### Using OpenAI/Anthropic in n8n

**OpenAI Node:**
```
Model: gpt-4
Prompt Template: "Analyze this data: {{ $json }}"
```

**Anthropic Node:**
```
Model: claude-opus
Prompt: "{{ $json.prompt }}"
```

---

## Testing Webhooks

### Test Webhook Locally

```bash
# Test predict-price
curl -X POST http://localhost:5678/webhook/predict-price \
  -H "Content-Type: application/json" \
  -d '{
    "item": "apple",
    "category": "produce",
    "priceHistory": [
      { "date": "2024-01-01", "price": 2.5 },
      { "date": "2024-01-02", "price": 2.45 }
    ]
  }'

# Test optimize-budget
curl -X POST http://localhost:5678/webhook/optimize-budget \
  -H "Content-Type: application/json" \
  -d '{
    "budgetId": "123",
    "spendingHistory": [...],
    "totalBudget": 500
  }'
```

---

## Production Deployment

### Option 1: Self-Hosted n8n

1. Deploy on Docker/VPS
2. Use environment variables for API keys
3. Set up SSL certificates
4. Configure webhook URLs to your domain

### Option 2: n8n Cloud

1. Sign up at https://app.n8n.cloud
2. Create workflows
3. n8n provides stable webhook URLs
4. Recommended for production

### Webhook URL Format (n8n Cloud)
```
https://<your-org>.n8n.cloud/webhook/<workflow-id>
```

---

## Environment Variables for Workflows

Store these in n8n credentials:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
WALMART_API_KEY=...
AMAZON_API_KEY=...
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
```

---

## Monitoring & Logging

1. **n8n Execution Logs:**
   - View in n8n UI: Executions tab
   - Export execution history for debugging

2. **Alert Logs:**
   - Store failed executions
   - Retry mechanism for failed webhooks

3. **Performance Monitoring:**
   - Track average response time
   - Monitor webhook health

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Webhook timeout | Increase timeout in n8n node settings |
| API rate limits | Add delays between requests, use queuing |
| CORS errors | Configure CORS in your backend |
| Auth failures | Check API keys in n8n credentials |
| Slow performance | Use async processing, queue items |

---

## Example: Complete Price Prediction Workflow

```
1. Webhook trigger receives: { item, category, priceHistory }
2. OpenAI node analyzes:
   Prompt: "Given this price history for {{ $json.item }}, 
           predict next price with confidence (0-100)"
   Input: {{ $json.priceHistory }}
3. Parse response: extract predictedPrice, confidence
4. HTTP Request to MongoDB: save prediction
5. Return: { predictedPrice, confidence, jobId }
```

---

## Next Steps

1. ✅ Install n8n (local or cloud)
2. ✅ Create 6 workflows above
3. ✅ Test each webhook
4. ✅ Update `.env` with webhook URLs
5. ✅ Deploy backend
6. ✅ Connect frontend

---

## Resources

- **n8n Docs:** https://docs.n8n.io
- **Webhook Guide:** https://docs.n8n.io/workflows/trigger-nodes/webhook/
- **OpenAI Docs:** https://platform.openai.com/docs
- **Anthropic Docs:** https://docs.anthropic.com
- **n8n Community:** https://community.n8n.io
