/**
 * eBay API Service
 * 
 * Handles OAuth authentication and Browse API interactions
 * 
 * Note: Uses native fetch API available in Node.js 18+
 * See package.json engines field for version requirement
 */

const logger = require('../utils/logger');
const cacheService = require('./cacheService');

const EBAY_API_BASE = process.env.EBAY_ENVIRONMENT === 'production'
  ? 'https://api.ebay.com'
  : 'https://api.sandbox.ebay.com';

let accessToken = null;
let tokenExpiry = null;

/**
 * Get OAuth access token for eBay API
 * @returns {Promise<string>} - Access token
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('eBay API credentials not configured');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch(`${EBAY_API_BASE}/identity/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`eBay OAuth failed: ${error}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Set expiry 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    logger.info('eBay access token refreshed');
    return accessToken;
  } catch (error) {
    logger.error('eBay OAuth error:', error);
    throw error;
  }
}

/**
 * Search for items on eBay by OEM part number
 * @param {string} oem - OEM part number
 * @param {object} options - Search options
 * @returns {Promise<object>} - Search results with count and average price
 */
async function searchByOEM(oem, options = {}) {
  const { state = 'used', limit = 50 } = options;

  // Check cache first
  const cacheKey = cacheService.ebaySearchKey(oem, state);
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const token = await getAccessToken();
    
    // Build search query
    const conditionFilter = state === 'new' ? 'NEW' : 'USED';
    const query = encodeURIComponent(oem);
    
    const url = new URL(`${EBAY_API_BASE}/buy/browse/v1/item_summary/search`);
    url.searchParams.append('q', query);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('filter', `conditionIds:{${conditionFilter === 'NEW' ? '1000' : '3000'}}`);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB'
      }
    });

    if (response.status === 429) {
      throw new Error('eBay rate limit exceeded');
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`eBay search failed: ${error}`);
    }

    const data = await response.json();
    
    // Calculate statistics
    const items = data.itemSummaries || [];
    const prices = items
      .filter(item => item.price?.value)
      .map(item => parseFloat(item.price.value));
    
    const result = {
      count: items.length,
      totalResults: data.total || items.length,
      avgPrice: prices.length > 0 
        ? prices.reduce((a, b) => a + b, 0) / prices.length 
        : null,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices) : null,
      currency: 'GBP',
      items: items.slice(0, 5).map(item => ({
        itemId: item.itemId,
        title: item.title,
        price: item.price?.value,
        condition: item.condition,
        itemWebUrl: item.itemWebUrl
      }))
    };

    // Cache the result
    cacheService.set(cacheKey, result);

    return result;
  } catch (error) {
    logger.error('eBay search error:', error);
    throw error;
  }
}

/**
 * Get user's eBay inventory (requires user authentication)
 * @returns {Promise<array>} - List of inventory items
 */
async function getInventory() {
  // This would require OAuth user consent flow
  // For MVP, we'll use local inventory instead
  logger.warn('eBay Inventory API requires user OAuth consent');
  return [];
}

module.exports = {
  getAccessToken,
  searchByOEM,
  getInventory
};
