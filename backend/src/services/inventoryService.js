/**
 * Inventory Service
 * 
 * Manages local inventory of parts (SKU, OEM, quantity)
 */

const logger = require('../utils/logger');
const { parse } = require('csv-parse/sync');

// In-memory inventory store (in production, use database)
let inventory = new Map();

// Sample initial inventory
const INITIAL_INVENTORY = [
  { sku: 'SKU001', oem: '34116771868', quantity: 2, location: 'Shelf A1' },
  { sku: 'SKU002', oem: '34116855781', quantity: 5, location: 'Shelf A2' },
  { sku: 'SKU003', oem: '17117509838', quantity: 1, location: 'Shelf B1' },
  { sku: 'SKU004', oem: 'A2044210512', quantity: 3, location: 'Shelf C1' },
  { sku: 'SKU005', oem: '4G0615301AH', quantity: 0, location: 'Shelf D1' }
];

// Initialize with sample data
INITIAL_INVENTORY.forEach(item => {
  inventory.set(item.oem, item);
});

/**
 * Get quantity for an OEM part number
 * @param {string} oem - OEM part number
 * @returns {number} - Quantity in stock
 */
function getQuantity(oem) {
  const item = inventory.get(oem);
  return item ? item.quantity : 0;
}

/**
 * Get inventory item by OEM
 * @param {string} oem - OEM part number
 * @returns {object|null} - Inventory item or null
 */
function getByOEM(oem) {
  return inventory.get(oem) || null;
}

/**
 * Get all inventory items
 * @returns {array} - All inventory items
 */
function getAll() {
  return Array.from(inventory.values());
}

/**
 * Update inventory from CSV data
 * @param {string} csvData - CSV string with columns: sku,oem,quantity,location
 * @returns {object} - Result with count and errors
 */
function importFromCSV(csvData) {
  try {
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    let imported = 0;
    const errors = [];

    for (const record of records) {
      try {
        const { sku, oem, quantity, location } = record;

        if (!sku || !oem) {
          errors.push(`Missing required fields in row: ${JSON.stringify(record)}`);
          continue;
        }

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty < 0) {
          errors.push(`Invalid quantity for SKU ${sku}: ${quantity}`);
          continue;
        }

        inventory.set(oem, {
          sku,
          oem,
          quantity: qty,
          location: location || 'Unknown'
        });

        imported++;
      } catch (rowError) {
        errors.push(`Error processing row: ${rowError.message}`);
      }
    }

    logger.info(`Inventory import complete: ${imported} items imported, ${errors.length} errors`);

    return { imported, errors };
  } catch (error) {
    logger.error('CSV parsing error:', error);
    throw new Error(`Failed to parse CSV: ${error.message}`);
  }
}

/**
 * Export inventory to CSV format
 * @returns {string} - CSV string
 */
function exportToCSV() {
  const items = getAll();
  const header = 'sku,oem,quantity,location\n';
  const rows = items.map(item => 
    `${item.sku},${item.oem},${item.quantity},${item.location}`
  ).join('\n');
  
  return header + rows;
}

/**
 * Update quantity for an OEM part
 * @param {string} oem - OEM part number
 * @param {number} quantity - New quantity
 * @returns {boolean} - Success
 */
function updateQuantity(oem, quantity) {
  const item = inventory.get(oem);
  if (!item) {
    return false;
  }

  item.quantity = quantity;
  inventory.set(oem, item);
  return true;
}

/**
 * Add or update an inventory item
 * @param {object} item - Inventory item
 * @returns {boolean} - Success
 */
function upsert(item) {
  const { sku, oem, quantity, location } = item;
  
  if (!sku || !oem) {
    throw new Error('SKU and OEM are required');
  }

  inventory.set(oem, {
    sku,
    oem,
    quantity: quantity || 0,
    location: location || 'Unknown'
  });

  return true;
}

/**
 * Clear all inventory
 */
function clear() {
  inventory.clear();
}

module.exports = {
  getQuantity,
  getByOEM,
  getAll,
  importFromCSV,
  exportToCSV,
  updateQuantity,
  upsert,
  clear
};
