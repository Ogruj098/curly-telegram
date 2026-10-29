/**
 * Parts Routes - Part details and information
 */

const express = require('express');
const router = express.Router();
const partsService = require('../services/partsService');
const ebayService = require('../services/ebayService');
const inventoryService = require('../services/inventoryService');
const logger = require('../utils/logger');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/v1/parts/:oem
 * Get detailed information for a specific OEM part
 */
router.get('/:oem',
  optionalAuth,
  async (req, res) => {
    const { oem } = req.params;

    if (!oem || oem.trim().length === 0) {
      return res.status(400).json({ error: 'OEM part number required' });
    }

    try {
      // Get part details from catalog
      const partDetails = await partsService.getPartByOEM(oem);

      if (!partDetails) {
        return res.status(404).json({ error: 'Part not found' });
      }

      // Get inventory info
      const inventoryItem = inventoryService.getByOEM(oem);

      // Get eBay listings
      let ebayData = { count: 0, avgPrice: null, items: [] };
      try {
        ebayData = await ebayService.searchByOEM(oem);
      } catch (ebayError) {
        logger.warn(`eBay search failed for OEM ${oem}:`, ebayError.message);
      }

      res.json({
        oem: partDetails.oem,
        description: partDetails.description,
        category: partDetails.category,
        manufacturer: partDetails.manufacturer,
        compatibility: partDetails.compatibility,
        imageUrl: partDetails.imageUrl,
        inventory: inventoryItem ? {
          sku: inventoryItem.sku,
          quantity: inventoryItem.quantity,
          location: inventoryItem.location
        } : null,
        ebay: {
          count: ebayData.count,
          avgPriceGbp: ebayData.avgPrice,
          minPriceGbp: ebayData.minPrice,
          maxPriceGbp: ebayData.maxPrice,
          sampleListings: ebayData.items || []
        }
      });
    } catch (error) {
      logger.error('Part lookup error:', error);
      res.status(500).json({ error: 'Failed to retrieve part information' });
    }
  }
);

module.exports = router;
