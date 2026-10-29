/**
 * Recommendation Service Tests
 */

const {
  getRecommendation,
  processPartsList,
  sortByPriority,
  getSummary,
  Recommendation
} = require('../src/services/recommendationService');

describe('Recommendation Service', () => {
  describe('getRecommendation', () => {
    test('should recommend TAKE when no stock and price above threshold', () => {
      const result = getRecommendation({
        ourQty: 0,
        ebayAvgPrice: 50,
        ebayCount: 10,
        matchConfidence: 0.95,
        thresholdGbp: 40
      });
      
      expect(result.recommendation).toBe(Recommendation.TAKE);
    });

    test('should recommend DONT_TAKE when in stock', () => {
      const result = getRecommendation({
        ourQty: 5,
        ebayAvgPrice: 100,
        ebayCount: 10,
        matchConfidence: 0.95,
        thresholdGbp: 40
      });
      
      expect(result.recommendation).toBe(Recommendation.DONT_TAKE);
    });

    test('should recommend DONT_TAKE when price below threshold', () => {
      const result = getRecommendation({
        ourQty: 0,
        ebayAvgPrice: 20,
        ebayCount: 10,
        matchConfidence: 0.95,
        thresholdGbp: 40
      });
      
      expect(result.recommendation).toBe(Recommendation.DONT_TAKE);
    });

    test('should recommend CHECK when low confidence', () => {
      const result = getRecommendation({
        ourQty: 0,
        ebayAvgPrice: 100,
        ebayCount: 10,
        matchConfidence: 0.5,
        thresholdGbp: 40
      });
      
      expect(result.recommendation).toBe(Recommendation.CHECK);
    });

    test('should recommend CHECK when no eBay data', () => {
      const result = getRecommendation({
        ourQty: 0,
        ebayAvgPrice: null,
        ebayCount: 0,
        matchConfidence: 0.95,
        thresholdGbp: 40
      });
      
      expect(result.recommendation).toBe(Recommendation.CHECK);
    });
  });

  describe('processPartsList', () => {
    test('should add recommendations to all parts', () => {
      const parts = [
        { oem: 'OEM1', ourQty: 0, ebayAvgPriceGbp: 50, ebayCount: 5, matchConfidence: 0.95 },
        { oem: 'OEM2', ourQty: 2, ebayAvgPriceGbp: 50, ebayCount: 5, matchConfidence: 0.95 }
      ];

      const result = processPartsList(parts, { thresholdGbp: 40 });
      
      expect(result[0].recommendation).toBe(Recommendation.TAKE);
      expect(result[1].recommendation).toBe(Recommendation.DONT_TAKE);
    });
  });

  describe('sortByPriority', () => {
    test('should sort TAKE first, then CHECK, then DONT_TAKE', () => {
      const parts = [
        { oem: 'OEM1', recommendation: Recommendation.DONT_TAKE, priority: 3 },
        { oem: 'OEM2', recommendation: Recommendation.TAKE, priority: 1 },
        { oem: 'OEM3', recommendation: Recommendation.CHECK, priority: 2 }
      ];

      const sorted = sortByPriority(parts);
      
      expect(sorted[0].recommendation).toBe(Recommendation.TAKE);
      expect(sorted[1].recommendation).toBe(Recommendation.CHECK);
      expect(sorted[2].recommendation).toBe(Recommendation.DONT_TAKE);
    });
  });

  describe('getSummary', () => {
    test('should calculate correct summary', () => {
      const parts = [
        { recommendation: Recommendation.TAKE, ebayAvgPriceGbp: 50 },
        { recommendation: Recommendation.TAKE, ebayAvgPriceGbp: 100 },
        { recommendation: Recommendation.DONT_TAKE, ebayAvgPriceGbp: 30 },
        { recommendation: Recommendation.CHECK, ebayAvgPriceGbp: null }
      ];

      const summary = getSummary(parts);
      
      expect(summary.total).toBe(4);
      expect(summary.takeCount).toBe(2);
      expect(summary.dontTakeCount).toBe(1);
      expect(summary.checkCount).toBe(1);
      expect(summary.estimatedValue).toBe('150.00');
    });
  });
});
