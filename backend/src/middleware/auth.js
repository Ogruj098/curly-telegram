/**
 * JWT Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let JWT_SECRET;
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  } else {
    JWT_SECRET = 'development-secret-change-in-production';
  }
} else {
  JWT_SECRET = process.env.JWT_SECRET;
}

/**
 * Verify JWT token middleware
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token format invalid' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('JWT verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Optional auth - doesn't fail if no token, just sets req.user if valid
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next();
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    // Ignore errors for optional auth
  }

  next();
}

/**
 * Generate JWT token
 * @param {object} payload - Data to include in token
 * @returns {string} - JWT token
 */
function generateToken(payload) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = {
  verifyToken,
  optionalAuth,
  generateToken
};
