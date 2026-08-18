import assert from 'node:assert/strict';
import { BudgetCalculator } from '../utils/budgetCalculator.js';

const profile = BudgetCalculator.getFamilyBudgetProfile({
  householdSize: 4,
  location: 'Kigali, Rwanda',
  city: 'Kigali',
  householdType: 'family',
});

assert.equal(profile.currency, 'RWF');
assert.equal(profile.locationCountry, 'Rwanda');
assert.ok(profile.recommendedMonthlyBudget > 0);
assert.ok(profile.categorySplit.groceries > 0);

const status = BudgetCalculator.calculateBudgetStatus(500000, 350000, {
  householdSize: 4,
  location: 'Kigali, Rwanda',
  householdType: 'family',
});

assert.equal(status.currency, 'RWF');
assert.ok(status.normalizedUsage >= 0);

console.log('family budget Rwanda checks passed');
