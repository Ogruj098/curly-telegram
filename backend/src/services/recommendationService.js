/**
 * Recommendation Service
 * 
 * Determines whether to TAKE, DONT_TAKE, or CHECK a part
 * based on inventory status and eBay pricing
 */

/**
 * Recommendation types
 */
const Recommendation = {
  TAKE: 'TAKE',
  DONT_TAKE: 'DONT_TAKE',
  CHECK: 'CHECK'
};

/**
 * Get recommendation for a part
 * @param {object} params - Part data and settings
 * @returns {object} - Recommendation with reason
 */
function getRecommendation(params) {
  const {
    ourQty = 0,
    ebayAvgPrice = null,
    ebayCount = 0,
    matchConfidence = 1.0,
    thresholdGbp = 40
  } = params;

  // Low confidence - always check manually
  if (matchConfidence < 0.8) {
    return {
      recommendation: Recommendation.CHECK,
      reason: 'Low match confidence - manual verification needed',
      priority: 2
    };
  }

  // No eBay data available
  if (ebayAvgPrice === null || ebayCount === 0) {
    return {
      recommendation: Recommendation.CHECK,
      reason: 'No eBay pricing data available',
      priority: 2
    };
  }

  // Already have in stock - don't take
  if (ourQty > 0) {
    return {
      recommendation: Recommendation.DONT_TAKE,
      reason: `Already have ${ourQty} in stock`,
      priority: 3
    };
  }

  // Price below threshold - not worth taking
  if (ebayAvgPrice < thresholdGbp) {
    return {
      recommendation: Recommendation.DONT_TAKE,
      reason: `Average price £${ebayAvgPrice.toFixed(2)} below threshold £${thresholdGbp}`,
      priority: 3
    };
  }

  // All conditions met - take the part
  return {
    recommendation: Recommendation.TAKE,
    reason: `No stock, avg price £${ebayAvgPrice.toFixed(2)} >= £${thresholdGbp} threshold`,
    priority: 1
  };
}

/**
 * Process multiple parts and add recommendations
 * @param {array} parts - Array of parts with eBay data
 * @param {object} settings - Threshold and state settings
 * @returns {array} - Parts with recommendations
 */
function processPartsList(parts, settings = {}) {
  const { thresholdGbp = 40, state = 'used' } = settings;

  return parts.map(part => {
    const rec = getRecommendation({
      ourQty: part.ourQty || 0,
      ebayAvgPrice: part.ebayAvgPriceGbp,
      ebayCount: part.ebayCount || 0,
      matchConfidence: part.matchConfidence || 1.0,
      thresholdGbp,
      state
    });

    return {
      ...part,
      recommendation: rec.recommendation,
      recommendationReason: rec.reason,
      priority: rec.priority
    };
  });
}

/**
 * Sort parts by recommendation priority
 * @param {array} parts - Array of parts with recommendations
 * @returns {array} - Sorted parts (TAKE first, then CHECK, then DONT_TAKE)
 */
function sortByPriority(parts) {
  return [...parts].sort((a, b) => (a.priority || 3) - (b.priority || 3));
}

/**
 * Filter parts by recommendation type
 * @param {array} parts - Array of parts
 * @param {string} type - Recommendation type
 * @returns {array} - Filtered parts
 */
function filterByRecommendation(parts, type) {
  return parts.filter(p => p.recommendation === type);
}

/**
 * Get summary statistics for a parts list
 * @param {array} parts - Array of parts with recommendations
 * @returns {object} - Summary stats
 */
function getSummary(parts) {
  const take = filterByRecommendation(parts, Recommendation.TAKE);
  const dontTake = filterByRecommendation(parts, Recommendation.DONT_TAKE);
  const check = filterByRecommendation(parts, Recommendation.CHECK);

  const takeTotalValue = take.reduce((sum, p) => sum + (p.ebayAvgPriceGbp || 0), 0);

  return {
    total: parts.length,
    takeCount: take.length,
    dontTakeCount: dontTake.length,
    checkCount: check.length,
    estimatedValue: takeTotalValue.toFixed(2)
  };
}

module.exports = {
  Recommendation,
  getRecommendation,
  processPartsList,
  sortByPriority,
  filterByRecommendation,
  getSummary
};
