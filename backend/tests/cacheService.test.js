/**
 * Cache Service Tests
 * 
 * Comprehensive test suite for caching functionality
 */

const cacheService = require('../src/services/cacheService');

describe('Cache Service', () => {
  beforeEach(() => {
    // Clear cache before each test
    cacheService.flush();
  });

  afterEach(() => {
    // Clean up after each test
    cacheService.flush();
  });

  describe('get', () => {
    test('should return null for non-existent key', () => {
      const result = cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    test('should return cached value for existing key', () => {
      cacheService.set('test-key', { data: 'test-value' });
      const result = cacheService.get('test-key');
      expect(result).toEqual({ data: 'test-value' });
    });

    test('should return null for expired key', (done) => {
      cacheService.set('expiring-key', 'value', 1); // 1 second TTL
      
      setTimeout(() => {
        const result = cacheService.get('expiring-key');
        expect(result).toBeNull();
        done();
      }, 1500);
    }, 3000);

    test('should handle complex objects', () => {
      const complexObj = {
        nested: { data: [1, 2, 3] },
        array: ['a', 'b', 'c'],
        number: 42
      };
      cacheService.set('complex-key', complexObj);
      const result = cacheService.get('complex-key');
      expect(result).toEqual(complexObj);
    });

    test('should handle arrays', () => {
      const array = [1, 2, 3, 4, 5];
      cacheService.set('array-key', array);
      const result = cacheService.get('array-key');
      expect(result).toEqual(array);
    });

    test('should handle null values', () => {
      cacheService.set('null-key', null);
      const result = cacheService.get('null-key');
      expect(result).toBeNull();
    });

    test('should handle undefined gracefully', () => {
      cacheService.set('undefined-key', undefined);
      const result = cacheService.get('undefined-key');
      // undefined values are not cached by node-cache
      expect(result).toBeNull();
    });

    test('should handle boolean values', () => {
      cacheService.set('bool-true', true);
      cacheService.set('bool-false', false);
      expect(cacheService.get('bool-true')).toBe(true);
      expect(cacheService.get('bool-false')).toBe(false);
    });

    test('should handle numeric values', () => {
      cacheService.set('zero', 0);
      cacheService.set('negative', -42);
      cacheService.set('float', 3.14);
      expect(cacheService.get('zero')).toBe(0);
      expect(cacheService.get('negative')).toBe(-42);
      expect(cacheService.get('float')).toBe(3.14);
    });

    test('should handle empty strings', () => {
      cacheService.set('empty', '');
      expect(cacheService.get('empty')).toBe('');
    });
  });

  describe('set', () => {
    test('should cache value successfully', () => {
      const success = cacheService.set('test-key', 'test-value');
      expect(success).toBe(true);
      expect(cacheService.get('test-key')).toBe('test-value');
    });

    test('should cache with custom TTL', (done) => {
      cacheService.set('custom-ttl-key', 'value', 2); // 2 seconds TTL
      
      // Should exist after 1 second
      setTimeout(() => {
        expect(cacheService.get('custom-ttl-key')).toBe('value');
      }, 1000);
      
      // Should expire after 2.5 seconds
      setTimeout(() => {
        expect(cacheService.get('custom-ttl-key')).toBeNull();
        done();
      }, 2500);
    }, 4000);

    test('should overwrite existing key', () => {
      cacheService.set('key', 'value1');
      cacheService.set('key', 'value2');
      expect(cacheService.get('key')).toBe('value2');
    });

    test('should handle very large values', () => {
      const largeArray = Array(10000).fill(0).map((_, i) => ({ id: i, data: `item-${i}` }));
      const success = cacheService.set('large-key', largeArray);
      expect(success).toBe(true);
      const result = cacheService.get('large-key');
      expect(result).toHaveLength(10000);
      expect(result[0]).toEqual({ id: 0, data: 'item-0' });
    });

    test('should handle multiple keys simultaneously', () => {
      const keys = Array(100).fill(0).map((_, i) => `key-${i}`);
      keys.forEach(key => {
        cacheService.set(key, `value-${key}`);
      });
      
      keys.forEach(key => {
        expect(cacheService.get(key)).toBe(`value-${key}`);
      });
    });

    test('should use default TTL when not specified', () => {
      cacheService.set('default-ttl-key', 'value');
      // The key should exist (we can't easily test the exact TTL without waiting)
      expect(cacheService.get('default-ttl-key')).toBe('value');
    });
  });

  describe('del', () => {
    test('should delete existing key', () => {
      cacheService.set('delete-me', 'value');
      const deletedCount = cacheService.del('delete-me');
      expect(deletedCount).toBe(1);
      expect(cacheService.get('delete-me')).toBeNull();
    });

    test('should return 0 for non-existent key', () => {
      const deletedCount = cacheService.del('non-existent');
      expect(deletedCount).toBe(0);
    });

    test('should handle multiple deletes', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      
      expect(cacheService.del('key1')).toBe(1);
      expect(cacheService.del('key2')).toBe(1);
      
      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
    });

    test('should not affect other keys when deleting', () => {
      cacheService.set('keep', 'keep-value');
      cacheService.set('delete', 'delete-value');
      
      cacheService.del('delete');
      
      expect(cacheService.get('keep')).toBe('keep-value');
      expect(cacheService.get('delete')).toBeNull();
    });
  });

  describe('flush', () => {
    test('should clear all cache entries', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      cacheService.set('key3', 'value3');
      
      cacheService.flush();
      
      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
      expect(cacheService.get('key3')).toBeNull();
    });

    test('should allow setting new values after flush', () => {
      cacheService.set('old-key', 'old-value');
      cacheService.flush();
      cacheService.set('new-key', 'new-value');
      
      expect(cacheService.get('old-key')).toBeNull();
      expect(cacheService.get('new-key')).toBe('new-value');
    });

    test('should handle flush on empty cache', () => {
      expect(() => cacheService.flush()).not.toThrow();
    });

    test('should handle multiple flushes', () => {
      cacheService.set('key', 'value');
      cacheService.flush();
      cacheService.flush();
      cacheService.flush();
      
      expect(cacheService.get('key')).toBeNull();
    });
  });

  describe('getStats', () => {
    test('should return cache statistics', () => {
      const stats = cacheService.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });

    test('should track hits and misses', () => {
      cacheService.set('key', 'value');
      
      cacheService.get('key'); // hit
      cacheService.get('non-existent'); // miss
      
      const stats = cacheService.getStats();
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBeGreaterThan(0);
    });

    test('should track key count', () => {
      const initialStats = cacheService.getStats();
      const initialKeys = initialStats.keys;
      
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      
      const newStats = cacheService.getStats();
      expect(newStats.keys).toBe(initialKeys + 2);
    });
  });

  describe('ebaySearchKey', () => {
    test('should generate correct key for used parts', () => {
      const key = cacheService.ebaySearchKey('BMW123', 'used');
      expect(key).toBe('ebay:search:BMW123:used');
    });

    test('should generate correct key for new parts', () => {
      const key = cacheService.ebaySearchKey('BMW123', 'new');
      expect(key).toBe('ebay:search:BMW123:new');
    });

    test('should use default state when not specified', () => {
      const key = cacheService.ebaySearchKey('BMW123');
      expect(key).toBe('ebay:search:BMW123:used');
    });

    test('should handle special characters in OEM', () => {
      const key = cacheService.ebaySearchKey('BMW-123/ABC', 'new');
      expect(key).toBe('ebay:search:BMW-123/ABC:new');
    });

    test('should handle empty OEM', () => {
      const key = cacheService.ebaySearchKey('', 'used');
      expect(key).toBe('ebay:search::used');
    });

    test('should generate unique keys for different OEMs', () => {
      const key1 = cacheService.ebaySearchKey('OEM1', 'used');
      const key2 = cacheService.ebaySearchKey('OEM2', 'used');
      expect(key1).not.toBe(key2);
    });

    test('should generate unique keys for different states', () => {
      const key1 = cacheService.ebaySearchKey('OEM1', 'used');
      const key2 = cacheService.ebaySearchKey('OEM1', 'new');
      expect(key1).not.toBe(key2);
    });
  });

  describe('vinPartsKey', () => {
    test('should generate correct cache key for VIN', () => {
      const key = cacheService.vinPartsKey('WBA12345678901234');
      expect(key).toBe('vin:parts:WBA12345678901234');
    });

    test('should handle short VINs', () => {
      const key = cacheService.vinPartsKey('SHORT');
      expect(key).toBe('vin:parts:SHORT');
    });

    test('should handle empty VIN', () => {
      const key = cacheService.vinPartsKey('');
      expect(key).toBe('vin:parts:');
    });

    test('should handle VINs with special characters', () => {
      const key = cacheService.vinPartsKey('WBA-123-456');
      expect(key).toBe('vin:parts:WBA-123-456');
    });

    test('should generate unique keys for different VINs', () => {
      const key1 = cacheService.vinPartsKey('VIN1');
      const key2 = cacheService.vinPartsKey('VIN2');
      expect(key1).not.toBe(key2);
    });

    test('should be case-sensitive', () => {
      const key1 = cacheService.vinPartsKey('WBA123');
      const key2 = cacheService.vinPartsKey('wba123');
      expect(key1).not.toBe(key2);
    });
  });

  describe('Integration scenarios', () => {
    test('should handle cache workflow for eBay search', () => {
      const oem = 'BMW-BRAKE-123';
      const state = 'used';
      const searchData = {
        count: 10,
        avgPrice: 45.50,
        items: ['item1', 'item2']
      };
      
      // Generate key and cache data
      const key = cacheService.ebaySearchKey(oem, state);
      cacheService.set(key, searchData);
      
      // Retrieve cached data
      const cached = cacheService.get(key);
      expect(cached).toEqual(searchData);
      
      // Clear cache
      cacheService.del(key);
      expect(cacheService.get(key)).toBeNull();
    });

    test('should handle cache workflow for VIN parts', () => {
      const vin = 'WBA12345678901234';
      const partsData = [
        { oem: 'PART1', description: 'Brake disc' },
        { oem: 'PART2', description: 'Brake pad' }
      ];
      
      // Generate key and cache data
      const key = cacheService.vinPartsKey(vin);
      cacheService.set(key, partsData);
      
      // Retrieve cached data
      const cached = cacheService.get(key);
      expect(cached).toEqual(partsData);
      
      // Verify it persists
      const cached2 = cacheService.get(key);
      expect(cached2).toEqual(partsData);
    });

    test('should handle concurrent cache operations', () => {
      const operations = Array(50).fill(0).map((_, i) => {
        const key = `concurrent-key-${i}`;
        const value = `value-${i}`;
        cacheService.set(key, value);
        return { key, value };
      });
      
      operations.forEach(({ key, value }) => {
        expect(cacheService.get(key)).toBe(value);
      });
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle very long keys', () => {
      const longKey = 'key-' + 'a'.repeat(1000);
      cacheService.set(longKey, 'value');
      expect(cacheService.get(longKey)).toBe('value');
    });

    test('should handle keys with special characters', () => {
      const specialKeys = [
        'key:with:colons',
        'key/with/slashes',
        'key-with-dashes',
        'key_with_underscores',
        'key.with.dots',
        'key with spaces'
      ];
      
      specialKeys.forEach(key => {
        cacheService.set(key, `value-${key}`);
        expect(cacheService.get(key)).toBe(`value-${key}`);
      });
    });

    test('should handle rapid successive operations on same key', () => {
      const key = 'rapid-key';
      
      for (let i = 0; i < 100; i++) {
        cacheService.set(key, i);
      }
      
      expect(cacheService.get(key)).toBe(99);
    });

    test('should maintain data integrity with cloning', () => {
      const original = { data: [1, 2, 3] };
      cacheService.set('clone-test', original);
      
      // Modify original
      original.data.push(4);
      
      // Cached version should be unchanged
      const cached = cacheService.get('clone-test');
      expect(cached.data).toEqual([1, 2, 3]);
    });
  });
});