/**
 * VIN Validator Tests
 */

const { validateVIN, decodeVIN } = require('../src/utils/vinValidator');

describe('VIN Validator', () => {
  describe('validateVIN', () => {
    test('should validate correct VIN', () => {
      // Using a sample VIN that passes check digit validation
      const result = validateVIN('11111111111111111');
      expect(result.valid).toBe(true);
    });

    test('should reject VIN with wrong length', () => {
      const result = validateVIN('WBA123');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('17 characters');
    });

    test('should reject VIN with invalid characters I, O, Q', () => {
      const result = validateVIN('WBA12345I7ABCDE89');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('I, O, or Q');
    });

    test('should reject empty VIN', () => {
      const result = validateVIN('');
      expect(result.valid).toBe(false);
    });

    test('should reject null VIN', () => {
      const result = validateVIN(null);
      expect(result.valid).toBe(false);
    });

    test('should trim and uppercase VIN', () => {
      const result = validateVIN('  11111111111111111  ');
      expect(result.vin).toBe('11111111111111111');
    });
  });

  describe('decodeVIN', () => {
    test('should decode VIN components', () => {
      const vin = 'WBAPH5C55BA123456';
      const decoded = decodeVIN(vin);
      
      expect(decoded.wmi).toBe('WBA');
      expect(decoded.vds).toBe('PH5C55');
      expect(decoded.vis).toBe('BA123456');
    });

    test('should decode model year', () => {
      const vin2020 = 'WBAPH5C55LA123456';
      const decoded2020 = decodeVIN(vin2020);
      expect(decoded2020.year).toBe(2020);
      
      const vin2015 = 'WBAPH5C55FA123456';
      const decoded2015 = decodeVIN(vin2015);
      expect(decoded2015.year).toBe(2015);
    });
  });
});
