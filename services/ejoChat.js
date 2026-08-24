/**
 * EjoChat Service
 * Handles integration with EjoChat API (Kinyarwanda-first AI by Ejo Labs)
 * Docs: https://ejolabs.com/api
 */

export class EjoChatService {
  constructor() {
    this.defaultBaseUrl = 'https://api.ejolabs.com/api/v1';
    this.timeout = 30000;
  }

  get baseUrl() {
    return process.env.EJOCHAT_BASE_URL || this.defaultBaseUrl;
  }

  get apiKey() {
    return process.env.EJOCHAT_API_KEY || '';
  }

  async chat(messages, options = {}) {
    if (!this.apiKey) {
      return { success: false, error: 'EJOCHAT_API_KEY is not configured' };
    }

    try {
      const payload = { messages };

      if (options.context) {
        payload.context = options.context;
      }

      if (options.documents) {
        payload.documents = options.documents;
      }

      const response = await fetch(`${this.baseUrl}/subiza`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const code = errorBody.code || response.statusText;
        throw new Error(`EjoChat API error [${response.status}]: ${code}`);
      }

      const data = await response.json();
      return {
        success: true,
        reply: data.reply || data.choices?.[0]?.message?.content || '',
        usage: data.usage || null,
      };
    } catch (error) {
      console.error('EjoChat chat failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async askBudgetQuestion(question, budgetContext = {}) {
    const systemPrompt = [
      'Uri umufasha wa budget (budget assistant).',
      'Subiza mu Kinyarwanda. Reba amakuru yoherejwe kandi utange ibisubizo bifite akamaro.',
      'Ibisubizo bigomba kuba: bifite ibiciro, amabwiriza, cyangwa inama zikoresha.',
    ].join(' ');

    const contextParts = [];
    if (budgetContext.totalBudget) contextParts.push(`Igiciro cya budget: ${budgetContext.totalBudget} ${budgetContext.currency || 'RWF'}`);
    if (budgetContext.totalSpent) contextParts.push(`Amafaranga yakoreshejwe: ${budgetContext.totalSpent}`);
    if (budgetContext.remaining) contextParts.push(`Amafaranga arihari: ${budgetContext.remaining}`);
    if (budgetContext.category) contextParts.push(`Urwego: ${budgetContext.category}`);
    if (budgetContext.topSpending) contextParts.push(`Ibiciro binini: ${budgetContext.topSpending}`);

    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    if (contextParts.length > 0) {
      messages.push({
        role: 'system',
        content: `Amakuru ya budget: ${contextParts.join('. ')}`,
      });
    }

    messages.push({ role: 'user', content: question });

    return this.chat(messages);
  }

  async parseReceipt(receiptText) {
    const messages = [
      {
        role: 'system',
        content: [
          'Uri umuhinduzi wa risiti (receipt parser).',
          'Sobanura ibintu n\'ibiciro mu risiti.',
          'Subiza mu format JSON: { items: [{ name, price, quantity }], total: number, isValid: boolean }',
        ].join(' '),
      },
      { role: 'user', content: `Sobanura iyi risiti:\n${receiptText}` },
    ];

    return this.chat(messages);
  }

  async getSpendingAdvice(spendingData, category) {
    const messages = [
      {
        role: 'system',
        content: [
          'Uri umufasha wa kubumbatira amafaranga (spending advisor).',
          'Reba amakuru y\'ibiciro kandi utange inama zo kugabanya ibiciro.',
          'Inama zifite ibiciro kandi zihwanye n\'ubukorero bw\'u Rwanda.',
        ].join(' '),
      },
      {
        role: 'user',
        content: [
          `Inama z\'ibiciro mu urwego: ${category || 'general'}`,
          `Amakuru y\'ibiciro: ${JSON.stringify(spendingData)}`,
          'Nyaba undangire inama zo kugabanya ibiciro.',
        ].join('\n'),
      },
    ];

    return this.chat(messages);
  }

  async translate(text, targetLang = 'rw') {
    const messages = [
      {
        role: 'user',
        content: `Kwihuza: "${text}" mu rurimi ${targetLang === 'rw' ? 'Ikinyarwanda' : targetLang === 'en' ? 'Icyongereza' : targetLang}. Subiza ingero gusa.`,
      },
    ];

    return this.chat(messages);
  }

  async isHealthy() {
    if (!this.apiKey) return false;
    try {
      const result = await this.chat([
        { role: 'user', content: 'Muraho' },
      ]);
      return result.success;
    } catch {
      return false;
    }
  }
}

export default new EjoChatService();
