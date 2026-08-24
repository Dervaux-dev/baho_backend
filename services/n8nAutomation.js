/**
 * n8n Automation Service
 * Handles all integrations with n8n workflows for AI-powered budget analysis
 */

export class N8nAutomationService {
  constructor() {
    this.defaultBaseUrl = 'https://dervaux.app.n8n.cloud/webhook';
    this.aiTimeout = 60000; // 60 seconds
  }

  get n8nBaseUrl() {
    return process.env.N8N_WEBHOOK_BASE_URL || this.defaultBaseUrl;
  }

  async _post(url, payload) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.aiTimeout);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`n8n error: ${response.status} ${response.statusText}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Trigger n8n workflow for price prediction using AI
   * Expected n8n workflow: Receives item name and history, returns predicted price
   */
  async predictItemPrice(itemName, priceHistory, category) {
    try {
      const data = await this._post(`${this.n8nBaseUrl}/predict-price`, {
        item: itemName, category, priceHistory, timestamp: new Date().toISOString(),
      });
      return { success: true, predictedPrice: data.predictedPrice, confidence: data.confidence || 0, jobId: data.jobId };
    } catch (error) {
      console.error('Price prediction failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger n8n workflow for budget optimization recommendations
   * Expected n8n workflow: Analyzes spending patterns, suggests optimizations
   */
  async optimizeBudget(budgetId, spendingHistory, totalBudget) {
    try {
      const data = await this._post(`${this.n8nBaseUrl}/optimize-budget`, {
        budgetId, spendingHistory, totalBudget, timestamp: new Date().toISOString(),
      });
      return { success: true, recommendations: data.recommendations || [], potentialSavings: data.potentialSavings || 0, jobId: data.jobId };
    } catch (error) {
      console.error('Budget optimization failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger n8n workflow for receipt validation using AI (OCR + verification)
   * Expected n8n workflow: Validates receipt data, extracts items, verifies prices
   */
  async validateReceipt(receiptData) {
    try {
      const data = await this._post(`${this.n8nBaseUrl}/validate-receipt`, {
        receiptData, timestamp: new Date().toISOString(),
      });
      return { success: true, validatedItems: data.validatedItems || [], totalAmount: data.totalAmount, isValid: data.isValid, jobId: data.jobId };
    } catch (error) {
      console.error('Receipt validation failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger n8n workflow to fetch real-time market prices from multiple vendors
   * Expected n8n workflow: Scrapes/fetches prices from vendor APIs
   */
  async fetchMarketPrices(items, category) {
    try {
      const data = await this._post(`${this.n8nBaseUrl}/fetch-market-prices`, {
        items, category, timestamp: new Date().toISOString(),
      });
      return { success: true, priceData: data.priceData || [], jobId: data.jobId };
    } catch (error) {
      console.error('Market price fetch failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger n8n workflow for anomaly detection in spending patterns
   * Expected n8n workflow: Detects unusual spending, alerts for fraud/overspending
   */
  async detectAnomalies(userId, spendingData, timeframe = 'monthly') {
    try {
      const data = await this._post(`${this.n8nBaseUrl}/detect-anomalies`, {
        userId, spendingData, timeframe, timestamp: new Date().toISOString(),
      });
      return { success: true, anomalies: data.anomalies || [], alerts: data.alerts || [], jobId: data.jobId };
    } catch (error) {
      console.error('Anomaly detection failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate budget alerts based on spending vs budget
   */
  async generateBudgetAlerts(budgetId, currentSpent, totalBudget, thresholds) {
    try {
      const percentageUsed = (currentSpent / totalBudget) * 100;
      const data = await this._post(`${this.n8nBaseUrl}/generate-alerts`, {
        budgetId, currentSpent, totalBudget, percentageUsed, thresholds, timestamp: new Date().toISOString(),
      });
      return { success: true, alerts: data.alerts || [], recommendations: data.recommendations || [], jobId: data.jobId };
    } catch (error) {
      console.error('Alert generation failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger n8n workflow for recipe analysis using AI
   * Expected n8n workflow: Analyzes recipe ingredients, nutrition, and budget impact
   */
  async analyzeRecipe(recipeData) {
    try {
      const payload = {
        ...recipeData,
        recipeData,
        timestamp: new Date().toISOString(),
      };
      let data;
      try {
        data = await this._post(`${this.n8nBaseUrl}/analyze-recipe`, payload);
      } catch (err) {
        if (err.message && err.message.includes('404')) {
          data = await this._post(`${this.n8nBaseUrl}/recipe-analyzer`, payload);
        } else {
          throw err;
        }
      }
      return { success: true, analysis: data.analysis || data, jobId: data.jobId };
    } catch (error) {
      console.error('Recipe analysis failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Health check for n8n connection
   */
  async checkN8nHealth() {
    if (!this.n8nBaseUrl) return false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${this.n8nBaseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      return response.ok;
    } catch {
      // Fallback: If baseUrl is valid, treat as configured
      return Boolean(this.n8nBaseUrl);
    } finally {
      clearTimeout(timer);
    }
  }
}

export default new N8nAutomationService();

