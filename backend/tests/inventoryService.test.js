/**
 * Inventory Service Tests
 */

const inventoryService = require('../src/services/inventoryService');

describe('Inventory Service', () => {
  beforeEach(() => {
    // Reset to initial state before each test
    inventoryService.clear();
  });

  describe('getQuantity', () => {
    test('should return 0 for non-existent OEM', () => {
      const qty = inventoryService.getQuantity('NON_EXISTENT');
      expect(qty).toBe(0);
    });

    test('should return quantity for existing OEM', () => {
      inventoryService.upsert({
        sku: 'TEST001',
        oem: 'OEM123',
        quantity: 5,
        location: 'Test'
      });
      
      const qty = inventoryService.getQuantity('OEM123');
      expect(qty).toBe(5);
    });
  });

  describe('upsert', () => {
    test('should add new item', () => {
      inventoryService.upsert({
        sku: 'TEST001',
        oem: 'OEM123',
        quantity: 10,
        location: 'Shelf A'
      });

      const item = inventoryService.getByOEM('OEM123');
      expect(item.sku).toBe('TEST001');
      expect(item.quantity).toBe(10);
    });

    test('should update existing item', () => {
      inventoryService.upsert({
        sku: 'TEST001',
        oem: 'OEM123',
        quantity: 5,
        location: 'Shelf A'
      });

      inventoryService.upsert({
        sku: 'TEST001',
        oem: 'OEM123',
        quantity: 15,
        location: 'Shelf B'
      });

      const item = inventoryService.getByOEM('OEM123');
      expect(item.quantity).toBe(15);
      expect(item.location).toBe('Shelf B');
    });

    test('should throw for missing SKU or OEM', () => {
      expect(() => {
        inventoryService.upsert({ quantity: 5 });
      }).toThrow('SKU and OEM are required');
    });
  });

  describe('importFromCSV', () => {
    test('should import valid CSV', () => {
      const csv = 'sku,oem,quantity,location\nSKU001,OEM1,5,Shelf A\nSKU002,OEM2,10,Shelf B';
      
      const result = inventoryService.importFromCSV(csv);
      
      expect(result.imported).toBe(2);
      expect(result.errors.length).toBe(0);
      expect(inventoryService.getQuantity('OEM1')).toBe(5);
      expect(inventoryService.getQuantity('OEM2')).toBe(10);
    });

    test('should report errors for invalid rows', () => {
      const csv = 'sku,oem,quantity,location\nSKU001,OEM1,5,Shelf A\n,OEM2,10,Shelf B';
      
      const result = inventoryService.importFromCSV(csv);
      
      expect(result.imported).toBe(1);
      expect(result.errors.length).toBe(1);
    });
  });

  describe('exportToCSV', () => {
    test('should export inventory as CSV', () => {
      inventoryService.upsert({
        sku: 'SKU001',
        oem: 'OEM1',
        quantity: 5,
        location: 'Shelf A'
      });

      const csv = inventoryService.exportToCSV();
      
      expect(csv).toContain('sku,oem,quantity,location');
      expect(csv).toContain('SKU001,OEM1,5,Shelf A');
    });
  });

  describe('updateQuantity', () => {
    test('should update quantity for existing item', () => {
      inventoryService.upsert({
        sku: 'SKU001',
        oem: 'OEM1',
        quantity: 5,
        location: 'Shelf A'
      });

      const success = inventoryService.updateQuantity('OEM1', 20);
      
      expect(success).toBe(true);
      expect(inventoryService.getQuantity('OEM1')).toBe(20);
    });

    test('should return false for non-existent item', () => {
      const success = inventoryService.updateQuantity('NON_EXISTENT', 5);
      expect(success).toBe(false);
    });
  });
});
