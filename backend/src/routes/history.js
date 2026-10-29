/**
 * History Routes - VIN scan history
 */

const express = require('express');
const router = express.Router();
const { getScanHistory } = require('./scan');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * GET /api/v1/history
 * Get VIN scan history
 */
router.get('/',
  optionalAuth,
  (req, res) => {
    const { limit = 20 } = req.query;
    const maxLimit = Math.min(parseInt(limit, 10) || 20, 100);

    try {
      const history = getScanHistory();
      
      // Filter by user if authenticated
      let filteredHistory = history;
      if (req.user) {
        filteredHistory = history.filter(
          scan => scan.user === req.user.username || scan.user === 'anonymous'
        );
      }

      const limitedHistory = filteredHistory.slice(0, maxLimit);

      res.json({
        count: limitedHistory.length,
        total: filteredHistory.length,
        history: limitedHistory
      });
    } catch (error) {
      logger.error('History retrieval error:', error);
      res.status(500).json({ error: 'Failed to retrieve history' });
    }
  }
);

/**
 * GET /api/v1/history/:id
 * Get specific scan result by ID
 */
router.get('/:id',
  optionalAuth,
  (req, res) => {
    const { id } = req.params;

    try {
      const history = getScanHistory();
      const scan = history.find(s => s.id === id);

      if (!scan) {
        return res.status(404).json({ error: 'Scan not found' });
      }

      res.json(scan);
    } catch (error) {
      logger.error('History item error:', error);
      res.status(500).json({ error: 'Failed to retrieve scan' });
    }
  }
);

module.exports = router;
