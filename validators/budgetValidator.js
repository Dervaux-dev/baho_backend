/**
 * Budget Validator
 * Validates incoming budget and spending data
 */

export const validateBudgetInput = (body) => {
  const errors = [];

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    errors.push('Budget name is required and must be a non-empty string');
  }

  if (!body.totalBudget || typeof body.totalBudget !== 'number' || body.totalBudget <= 0) {
    errors.push('Total budget must be a positive number');
  }

  if (body.householdSize !== undefined) {
    if (typeof body.householdSize !== 'number' || body.householdSize < 1) {
      errors.push('Household size must be a positive number');
    }
  }

  if (body.householdType && !['single', 'couple', 'family', 'shared household'].includes(body.householdType)) {
    errors.push('Invalid household type');
  }

  if (body.location && typeof body.location !== 'string') {
    errors.push('Location must be a string');
  }

  if (body.city && typeof body.city !== 'string') {
    errors.push('City must be a string');
  }

  if (body.country && typeof body.country !== 'string') {
    errors.push('Country must be a string');
  }

  if (!body.startDate || isNaN(new Date(body.startDate))) {
    errors.push('Valid start date is required');
  }

  if (!body.endDate || isNaN(new Date(body.endDate))) {
    errors.push('Valid end date is required');
  }

  if (new Date(body.startDate) >= new Date(body.endDate)) {
    errors.push('End date must be after start date');
  }

  if (body.period && !['weekly', 'monthly', 'yearly'].includes(body.period)) {
    errors.push('Period must be weekly, monthly, or yearly');
  }

  if (body.alerts && body.alerts.warningThreshold) {
    if (typeof body.alerts.warningThreshold !== 'number' || body.alerts.warningThreshold <= 0 || body.alerts.warningThreshold > 100) {
      errors.push('Warning threshold must be between 0 and 100');
    }
  }

  if (body.category && !['groceries', 'meals', 'ingredients', 'household', 'other'].includes(body.category)) {
    errors.push('Invalid category');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateSpendingInput = (body) => {
  const errors = [];

  if (!body.item || typeof body.item !== 'string' || body.item.trim() === '') {
    errors.push('Item name is required');
  }

  if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (!body.quantity || typeof body.quantity.value !== 'number' || body.quantity.value <= 0) {
    errors.push('Quantity must be a positive number');
  }

  if (body.quantity && !['kg', 'lb', 'liter', 'piece', 'box', 'bundle'].includes(body.quantity.unit)) {
    errors.push('Invalid quantity unit');
  }

  if (!body.vendor || typeof body.vendor !== 'string' || body.vendor.trim() === '') {
    errors.push('Vendor name is required');
  }

  if (!body.transactionDate || isNaN(new Date(body.transactionDate))) {
    errors.push('Valid transaction date is required');
  }

  if (body.category && !['produce', 'dairy', 'meat', 'pantry', 'frozen', 'beverages', 'other'].includes(body.category)) {
    errors.push('Invalid category');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateMarketDataInput = (body) => {
  const errors = [];

  if (!body.item || typeof body.item !== 'string' || body.item.trim() === '') {
    errors.push('Item name is required');
  }

  if (!body.category || !['produce', 'dairy', 'meat', 'pantry', 'frozen', 'beverages', 'other'].includes(body.category)) {
    errors.push('Valid category is required');
  }

  if (!body.averagePrice || typeof body.averagePrice !== 'number' || body.averagePrice <= 0) {
    errors.push('Average price must be a positive number');
  }

  if (body.prices && !Array.isArray(body.prices)) {
    errors.push('Prices must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateN8nWebhook = (webhookUrl) => {
  if (!webhookUrl) return false;
  try {
    new URL(webhookUrl);
    return webhookUrl.includes('n8n') || webhookUrl.includes('webhook');
  } catch {
    return false;
  }
};
