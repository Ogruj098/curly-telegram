/**
 * Cache Service using node-cache
 * 
 * Provides caching for eBay results and other frequently accessed data
 */

const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Default TTL: 12 hours (43200 seconds)
const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_SECONDS) || 43200;

const cache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: true
});

/**
 * Get a value from cache
 * @param {string} key - The cache key
 * @returns {any|null} - The cached value or null
 */
function get(key) {
  try {
    const value = cache.get(key);
    if (value !== undefined) {
      logger.debug(`Cache hit for key: ${key}`);
      return value;
    }
    logger.debug(`Cache miss for key: ${key}`);
    return null;
  } catch (err) {
    logger.error('Cache get error:', err);
    return null;
  }
}

/**
 * Set a value in cache
 * @param {string} key - The cache key
 * @param {any} value - The value to cache
 * @param {number} ttl - Optional TTL in seconds
 * @returns {boolean} - Whether the operation succeeded
 */
function set(key, value, ttl = DEFAULT_TTL) {
  try {
    cache.set(key, value, ttl);
    logger.debug(`Cache set for key: ${key}, TTL: ${ttl}s`);
    return true;
  } catch (err) {
    logger.error('Cache set error:', err);
    return false;
  }
}

/**
 * Delete a value from cache
 * @param {string} key - The cache key
 * @returns {number} - Number of deleted entries
 */
function del(key) {
  try {
    return cache.del(key);
  } catch (err) {
    logger.error('Cache delete error:', err);
    return 0;
  }
}

/**
 * Clear all cache entries
 */
function flush() {
  try {
    cache.flushAll();
    logger.info('Cache flushed');
  } catch (err) {
    logger.error('Cache flush error:', err);
  }
}

/**
 * Get cache statistics
 * @returns {object} - Cache statistics
 */
function getStats() {
  return cache.getStats();
}

/**
 * Generate a cache key for eBay search
 * @param {string} oem - OEM part number
 * @param {string} state - Part state (new/used)
 * @returns {string} - Cache key
 */
function ebaySearchKey(oem, state = 'used') {
  return `ebay:search:${oem}:${state}`;
}

/**
 * Generate a cache key for VIN parts list
 * @param {string} vin - Vehicle Identification Number
 * @returns {string} - Cache key
 */
function vinPartsKey(vin) {
  return `vin:parts:${vin}`;
}

module.exports = {
  get,
  set,
  del,
  flush,
  getStats,
  ebaySearchKey,
  vinPartsKey
};
