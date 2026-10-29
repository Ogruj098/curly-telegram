/**
 * Scan Routes - VIN scanning and parts analysis
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { validateVIN } = require('../utils/vinValidator');
const partsService = require('../services/partsService');
const inventoryService = require('../services/inventoryService');
const ebayService = require('../services/ebayService');
const recommendationService = require('../services/recommendationService');
const logger = require('../utils/logger');
const { optionalAuth } = require('../middleware/auth');

// In-memory history store (in production, use database)
const scanHistory = [];

/**
 * POST /api/v1/scan
 * Scan a VIN and get parts with recommendations
 */
router.post('/',
  optionalAuth,
  body('vin').isString().trim().notEmpty(),
  body('threshold_gbp').optional().isFloat({ min: 0 }),
  body('state').optional().isIn(['new', 'used']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vin, threshold_gbp = 40, state = 'used' } = req.body;

    // Validate VIN
    const vinValidation = validateVIN(vin);
    if (!vinValidation.valid) {
      return res.status(400).json({ error: vinValidation.error });
    }

    const cleanVin = vinValidation.vin;

    try {
      logger.info(`Processing scan for VIN: ${cleanVin}`);

      // Step 1: Get parts list for VIN
      const parts = await partsService.getPartsForVIN(cleanVin);
      logger.info(`Found ${parts.length} parts for VIN`);

      // Step 2: Enrich with inventory and eBay data
      const enrichedParts = await Promise.all(
        parts.map(async (part) => {
          // Get local inventory quantity
          const ourQty = inventoryService.getQuantity(part.oem);

          // Get eBay data (with caching)
          let ebayData = { count: 0, avgPrice: null };
          try {
            ebayData = await ebayService.searchByOEM(part.oem, { state });
          } catch (ebayError) {
            logger.warn(`eBay search failed for OEM ${part.oem}:`, ebayError.message);
          }

          return {
            oem: part.oem,
            description: part.description,
            category: part.category,
            ourQty,
            ebayCount: ebayData.count,
            ebayAvgPriceGbp: ebayData.avgPrice,
            ebayMinPrice: ebayData.minPrice,
            ebayMaxPrice: ebayData.maxPrice,
            matchConfidence: part.matchConfidence || 0.95
          };
        })
      );

      // Step 3: Add recommendations
      const partsWithRecommendations = recommendationService.processPartsList(
        enrichedParts,
        { thresholdGbp: threshold_gbp, state }
      );

      // Step 4: Sort by priority (TAKE first)
      const sortedParts = recommendationService.sortByPriority(partsWithRecommendations);

      // Step 5: Get summary
      const summary = recommendationService.getSummary(sortedParts);

      // Save to history
      const scanResult = {
        id: Date.now().toString(),
        vin: cleanVin,
        timestamp: new Date().toISOString(),
        settings: { threshold_gbp, state },
        summary,
        user: req.user?.username || 'anonymous'
      };
      scanHistory.unshift(scanResult);
      // Keep only last 100 scans
      if (scanHistory.length > 100) {
        scanHistory.pop();
      }

      // Return response
      res.json({
        vin: cleanVin,
        timestamp: scanResult.timestamp,
        settings: { threshold_gbp, state },
        summary,
        parts: sortedParts
      });
    } catch (error) {
      logger.error('Scan processing error:', error);
      res.status(500).json({ error: 'Failed to process VIN scan' });
    }
  }
);

/**
 * Get scan history (used by history route)
 */
function getScanHistory() {
  return scanHistory;
}

module.exports = router;
module.exports.getScanHistory = getScanHistory;
