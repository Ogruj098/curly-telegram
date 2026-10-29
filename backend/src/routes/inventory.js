/**
 * Inventory Routes - Inventory management
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const inventoryService = require('../services/inventoryService');
const { verifyToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// Configure multer for CSV uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

/**
 * GET /api/v1/inventory
 * Get all inventory items
 */
router.get('/', verifyToken, (req, res) => {
  try {
    const items = inventoryService.getAll();
    res.json({
      count: items.length,
      items
    });
  } catch (error) {
    logger.error('Inventory list error:', error);
    res.status(500).json({ error: 'Failed to retrieve inventory' });
  }
});

/**
 * POST /api/v1/inventory/upload
 * Upload inventory from CSV file
 */
router.post('/upload',
  verifyToken,
  upload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file provided' });
    }

    try {
      const csvData = req.file.buffer.toString('utf-8');
      const result = inventoryService.importFromCSV(csvData);

      logger.info(`Inventory uploaded by ${req.user.username}: ${result.imported} items`);

      res.json({
        message: 'Inventory uploaded successfully',
        imported: result.imported,
        errors: result.errors
      });
    } catch (error) {
      logger.error('Inventory upload error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * GET /api/v1/inventory/export
 * Export inventory as CSV
 */
router.get('/export', verifyToken, (req, res) => {
  try {
    const csv = inventoryService.exportToCSV();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
    res.send(csv);
  } catch (error) {
    logger.error('Inventory export error:', error);
    res.status(500).json({ error: 'Failed to export inventory' });
  }
});

/**
 * GET /api/v1/inventory/:oem
 * Get inventory item by OEM
 */
router.get('/:oem', verifyToken, (req, res) => {
  const { oem } = req.params;

  try {
    const item = inventoryService.getByOEM(oem);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    logger.error('Inventory item error:', error);
    res.status(500).json({ error: 'Failed to retrieve item' });
  }
});

/**
 * PUT /api/v1/inventory/:oem
 * Update inventory item quantity
 */
router.put('/:oem',
  verifyToken,
  (req, res) => {
    const { oem } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Valid quantity required' });
    }

    try {
      const success = inventoryService.updateQuantity(oem, quantity);
      
      if (!success) {
        return res.status(404).json({ error: 'Item not found' });
      }

      logger.info(`Inventory updated by ${req.user.username}: OEM ${oem} = ${quantity}`);

      res.json({ message: 'Quantity updated', oem, quantity });
    } catch (error) {
      logger.error('Inventory update error:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  }
);

module.exports = router;
