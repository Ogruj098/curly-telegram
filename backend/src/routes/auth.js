/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');
const crypto = require('crypto');

// In-memory user store (in production, use database)
const users = new Map();

// Create default admin user with a securely generated random password
const adminPassword = crypto.randomBytes(12).toString('base64'); // 16 chars, base64
const defaultPasswordHash = bcrypt.hashSync(adminPassword, 10);
users.set('admin', {
  username: 'admin',
  passwordHash: defaultPasswordHash,
  role: 'admin'
});
logger.warn(`Default admin account created. Username: 'admin', Password: '${adminPassword}'. Please change this password immediately.`);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login',
  body('username').isString().trim().notEmpty(),
  body('password').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = users.get(username);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken({
        username: user.username,
        role: user.role
      });

      logger.info(`User ${username} logged in`);

      res.json({
        token,
        user: {
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

/**
 * POST /api/auth/register
 * Register new user (admin only in production)
 */
router.post('/register',
  body('username').isString().trim().isLength({ min: 3, max: 50 }),
  body('password').isString().isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      if (users.has(username)) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      
      users.set(username, {
        username,
        passwordHash,
        role: 'user'
      });

      logger.info(`User ${username} registered`);

      res.status(201).json({
        message: 'User registered successfully',
        user: { username, role: 'user' }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

/**
 * GET /api/auth/ebay/callback
 * OAuth callback for eBay authentication
 */
router.get('/ebay/callback', (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' });
  }

  // In production, exchange code for token and store it
  logger.info('eBay OAuth callback received');

  res.json({
    message: 'eBay authorization received',
    // In production, redirect to app or return token
  });
});

module.exports = router;
