/**
 * Budget Calculator Utility
 * Handles all budget calculations and analytics
 */

export class BudgetCalculator {
  static getLocationProfile(location, country) {
    const place = [location, country].filter(Boolean).join(', ');
    const normalizedLocation = (place || '').toLowerCase();
    const isRwanda = normalizedLocation.includes('rwanda') || normalizedLocation.includes('kigali');

    return {
      country: country || (isRwanda ? 'Rwanda' : 'Global'),
      location: location || '',
      isRwanda,
      currency: isRwanda ? 'RWF' : 'USD',
    };
  }

  static getFamilyBudgetProfile(profile = {}) {
    const householdSize = Math.max(1, Number(profile.householdSize) || 2);
    const householdType = (profile.householdType || (householdSize > 2 ? 'family' : 'single')).toLowerCase();
    const locationProfile = this.getLocationProfile(profile.location || profile.city, profile.country);
    const isFamily = householdType.includes('family') || householdSize > 2;
    const isRwanda = Boolean(profile.isRwanda ?? locationProfile.isRwanda);
    const currency = profile.currency || (isRwanda ? 'RWF' : 'USD');

    const baseMonthly = isRwanda
      ? 180000 + (householdSize - 1) * 55000
      : 1200 + (householdSize - 1) * 350;

    const recommendedMonthlyBudget = Math.round(
      baseMonthly * (isFamily ? 1.1 : 0.75)
    );

    const categorySplit = isRwanda
      ? {
          groceries: 0.38,
          transport: 0.14,
          utilities: 0.12,
          education: 0.14,
          healthcare: 0.08,
          household: 0.08,
          savings: 0.06,
        }
      : {
          groceries: 0.35,
          transport: 0.12,
          utilities: 0.1,
          education: 0.12,
          healthcare: 0.08,
          household: 0.13,
          savings: 0.1,
        };

    return {
      householdSize,
      householdType,
      isFamily,
      location: profile.location || profile.city || '',
      city: profile.city || profile.location || '',
      country: locationProfile.country,
      locationCountry: locationProfile.country,
      isRwanda,
      currency,
      recommendedMonthlyBudget,
      categorySplit,
    };
  }

  /**
   * Calculate total spent for a budget
   */
  static calculateTotalSpent(spendingRecords) {
    return spendingRecords.reduce((total, record) => total + (record.amount || 0), 0);
  }

  /**
   * Calculate budget status
   */
  static calculateBudgetStatus(totalBudget, totalSpent, profile = {}) {
    const familyProfile = this.getFamilyBudgetProfile(profile);
    const resolvedBudget = Number(totalBudget) > 0 ? Number(totalBudget) : familyProfile.recommendedMonthlyBudget;
    const percentageUsed = (totalSpent / resolvedBudget) * 100;
    const remaining = resolvedBudget - totalSpent;

    return {
      percentageUsed: parseFloat(percentageUsed.toFixed(2)),
      remaining: parseFloat(remaining.toFixed(2)),
      totalBudget: resolvedBudget,
      totalSpent,
      status: percentageUsed >= 100 ? 'over-budget' : percentageUsed >= 90 ? 'critical' : percentageUsed >= 75 ? 'warning' : 'healthy',
      currency: familyProfile.currency,
      locationCountry: familyProfile.locationCountry,
      normalizedUsage: parseFloat(Math.min(100, percentageUsed).toFixed(2)),
      householdSize: familyProfile.householdSize,
      householdType: familyProfile.householdType,
      recommendedMonthlyBudget: familyProfile.recommendedMonthlyBudget,
    };
  }

  /**
   * Calculate spending by category
   */
  static spendingByCategory(spendingRecords) {
    const categoryMap = {};

    spendingRecords.forEach((record) => {
      const category = record.category || 'uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += record.amount || 0;
    });

    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2)),
    }));
  }

  /**
   * Calculate spending trends
   */
  static calculateSpendingTrends(spendingRecords, timeframe = 'weekly') {
    const grouped = {};

    spendingRecords.forEach((record) => {
      const date = new Date(record.transactionDate);
      let key;

      if (timeframe === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (timeframe === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (timeframe === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = 0;
      }
      grouped[key] += record.amount || 0;
    });

    return Object.entries(grouped)
      .map(([period, amount]) => ({
        period,
        amount: parseFloat(amount.toFixed(2)),
      }))
      .sort((a, b) => new Date(a.period) - new Date(b.period));
  }

  /**
   * Predict remaining budget based on spending rate
   */
  static predictBudgetExhaustion(totalBudget, spendingRecords, budgetPeriodDays, profile = {}) {
    if (!spendingRecords.length) return null;

    const familyProfile = this.getFamilyBudgetProfile(profile);
    const resolvedBudget = Number(totalBudget) > 0 ? Number(totalBudget) : familyProfile.recommendedMonthlyBudget;
    const totalSpent = this.calculateTotalSpent(spendingRecords);
    const oldestRecord = new Date(
      Math.min(...spendingRecords.map((r) => new Date(r.transactionDate).getTime()))
    );
    const newestRecord = new Date();
    const daysPassed = Math.ceil((newestRecord - oldestRecord) / (1000 * 60 * 60 * 24)) || 1;

    const dailyRate = totalSpent / daysPassed;
    const daysUntilExhaustion = (resolvedBudget - totalSpent) / dailyRate;
    const exhaustionDate = new Date();
    exhaustionDate.setDate(exhaustionDate.getDate() + Math.floor(daysUntilExhaustion));

    return {
      dailyRate: parseFloat(dailyRate.toFixed(2)),
      daysRemaining: Math.max(0, daysUntilExhaustion),
      projectedExhaustionDate: exhaustionDate,
      willExceedBudget: daysUntilExhaustion < budgetPeriodDays,
      remainingDaysInPeriod: budgetPeriodDays - daysPassed,
      currency: familyProfile.currency,
      locationCountry: familyProfile.locationCountry,
    };
  }

  /**
   * Calculate average item price and market comparison
   */
  static compareToMarket(spendingRecords, marketData) {
    return spendingRecords.map((record) => {
      const marketPrice = marketData.find(
        (m) => m.item.toLowerCase() === record.item.toLowerCase()
      );

      if (!marketPrice) {
        return {
          item: record.item,
          paidPrice: record.amount,
          marketPrice: null,
          comparison: null,
          savingOpportunity: null,
        };
      }

      const difference = record.amount - marketPrice.averagePrice;
      const percentageDifference = (difference / marketPrice.averagePrice) * 100;

      return {
        item: record.item,
        paidPrice: parseFloat(record.amount.toFixed(2)),
        marketPrice: parseFloat(marketPrice.averagePrice.toFixed(2)),
        comparison: parseFloat(percentageDifference.toFixed(2)),
        savingOpportunity:
          difference > 0
            ? parseFloat(difference.toFixed(2))
            : null,
        cheapestVendor: marketPrice.prices?.length ? 
          marketPrice.prices.reduce((min, p) => p.price < min.price ? p : min).vendor : null,
      };
    });
  }

  /**
   * Generate budget recommendations based on spending patterns
   */
  static generateRecommendations(budgetStatus, spendingByCategory, trends, profile = {}) {
    const recommendations = [];
    const familyProfile = this.getFamilyBudgetProfile(profile);

    if (budgetStatus.percentageUsed > 90) {
      recommendations.push({
        severity: 'critical',
        message: familyProfile.isRwanda
          ? 'Your family budget in Rwanda is very close to the monthly limit. Reduce non-essential spending and review essentials first.'
          : 'You are close to or over your budget limit. Reduce spending immediately.',
      });
    }

    if (budgetStatus.percentageUsed > 75) {
      recommendations.push({
        severity: 'warning',
        message: familyProfile.isRwanda
          ? 'Family expenses in Kigali and nearby areas are trending high. Check grocery and transport costs before buying non-essential items.'
          : 'Budget usage is high. Review spending in high-cost categories.',
      });
    }

    if (spendingByCategory.length > 0) {
      const topCategory = spendingByCategory.reduce((max, cat) =>
        cat.amount > max.amount ? cat : max
      );
      recommendations.push({
        severity: 'info',
        message: familyProfile.isRwanda
          ? `Your biggest category is ${topCategory.category}. For a Rwanda-based family budget, compare local supermarket and market prices before the next purchase.`
          : `Your highest spending is in ${topCategory.category} ($${topCategory.amount}). Consider finding alternatives.`,
      });
    }

    if (trends.length > 1) {
      const recentTrend = trends.slice(-1)[0].amount;
      const previousTrend = trends.slice(-2, -1)[0]?.amount || recentTrend;
      if (recentTrend > previousTrend * 1.2) {
        recommendations.push({
          severity: 'warning',
          message: familyProfile.isRwanda
            ? 'Recent spending has grown faster than the family budget baseline. Revisit food, transport, and school-related costs.'
            : 'Spending increased significantly in the recent period. Investigate the cause.',
        });
      }
    }

    return recommendations;
  }
}

export default BudgetCalculator;
