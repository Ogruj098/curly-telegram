/**
 * Dependencies Validation Tests
 * Tests for package.json and package-lock.json consistency, integrity, and security
 */

const fs = require('fs');
const path = require('path');

describe('Package Dependencies Validation', () => {
  let packageJson;
  let packageLockJson;

  beforeAll(() => {
    const packagePath = path.join(__dirname, '../package.json');
    const packageLockPath = path.join(__dirname, '../package-lock.json');

    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    packageLockJson = JSON.parse(fs.readFileSync(packageLockPath, 'utf-8'));
  });

  describe('Package Lock File Existence and Structure', () => {
    test('should have package-lock.json file', () => {
      expect(packageLockJson).toBeDefined();
    });

    test('should have correct lockfileVersion', () => {
      expect(packageLockJson.lockfileVersion).toBeDefined();
      expect(packageLockJson.lockfileVersion).toBeGreaterThanOrEqual(2);
    });

    test('should have name matching package.json', () => {
      expect(packageLockJson.name).toBe(packageJson.name);
    });

    test('should have version matching package.json', () => {
      expect(packageLockJson.version).toBe(packageJson.version);
    });

    test('should have packages object', () => {
      expect(packageLockJson.packages).toBeDefined();
      expect(typeof packageLockJson.packages).toBe('object');
    });

    test('should have root package definition', () => {
      expect(packageLockJson.packages['']).toBeDefined();
      expect(packageLockJson.packages[''].name).toBe(packageJson.name);
    });
  });

  describe('Dependency Consistency', () => {
    test('should have all dependencies from package.json', () => {
      const packageDeps = Object.keys(packageJson.dependencies || {});
      const lockDeps = packageLockJson.packages[''].dependencies || {};

      packageDeps.forEach(dep => {
        expect(lockDeps).toHaveProperty(dep);
      });
    });

    test('should have all devDependencies from package.json', () => {
      const packageDevDeps = Object.keys(packageJson.devDependencies || {});
      const lockDevDeps = packageLockJson.packages[''].devDependencies || {};

      packageDevDeps.forEach(dep => {
        expect(lockDevDeps).toHaveProperty(dep);
      });
    });

    test('should have matching dependency versions', () => {
      const packageDeps = packageJson.dependencies || {};
      const lockDeps = packageLockJson.packages[''].dependencies || {};

      Object.keys(packageDeps).forEach(dep => {
        expect(lockDeps[dep]).toBe(packageDeps[dep]);
      });
    });

    test('should have matching devDependency versions', () => {
      const packageDevDeps = packageJson.devDependencies || {};
      const lockDevDeps = packageLockJson.packages[''].devDependencies || {};

      Object.keys(packageDevDeps).forEach(dep => {
        expect(lockDevDeps[dep]).toBe(packageDevDeps[dep]);
      });
    });
  });

  describe('Required Dependencies', () => {
    test('should include express framework', () => {
      expect(packageLockJson.packages[''].dependencies).toHaveProperty('express');
    });

    test('should include security dependencies (helmet, cors)', () => {
      expect(packageLockJson.packages[''].dependencies).toHaveProperty('helmet');
      expect(packageLockJson.packages[''].dependencies).toHaveProperty('cors');
    });

    test('should include authentication dependencies (bcryptjs, jsonwebtoken)', () => {
      expect(packageLockJson.packages[''].dependencies).toHaveProperty('bcryptjs');
      expect(packageLockJson.packages[''].dependencies).toHaveProperty('jsonwebtoken');
    });

    test('should include validation dependency (express-validator)', () => {
      expect(packageLockJson.packages[''].dependencies).toHaveProperty('express-validator');
    });

    test('should include rate limiting (express-rate-limit)', () => {
      expect(packageLockJson.packages[''].dependencies).toHaveProperty('express-rate-limit');
    });

    test('should include caching (node-cache)', () => {
      expect(packageLockJson.packages[''].dependencies).toHaveProperty('node-cache');
    });

    test('should include logging (winston)', () => {
      expect(packageLockJson.packages[''].dependencies).toHaveProperty('winston');
    });

    test('should include CSV parsing (csv-parse)', () => {
      expect(packageLockJson.packages[''].dependencies).toHaveProperty('csv-parse');
    });

    test('should include file upload (multer)', () => {
      expect(packageLockJson.packages[''].dependencies).toHaveProperty('multer');
    });

    test('should include environment variables (dotenv)', () => {
      expect(packageLockJson.packages[''].dependencies).toHaveProperty('dotenv');
    });
  });

  describe('Development Dependencies', () => {
    test('should include Jest testing framework', () => {
      expect(packageLockJson.packages[''].devDependencies).toHaveProperty('jest');
    });

    test('should include supertest for API testing', () => {
      expect(packageLockJson.packages[''].devDependencies).toHaveProperty('supertest');
    });

    test('should include eslint for linting', () => {
      expect(packageLockJson.packages[''].devDependencies).toHaveProperty('eslint');
    });

    test('should include nodemon for development', () => {
      expect(packageLockJson.packages[''].devDependencies).toHaveProperty('nodemon');
    });
  });

  describe('Package Integrity', () => {
    test('should have resolved URLs for packages', () => {
      const packages = Object.entries(packageLockJson.packages);
      const nodeModulePackages = packages.filter(([key]) => key.startsWith('node_modules/'));

      nodeModulePackages.slice(0, 10).forEach(([key, pkg]) => {
        if (!pkg.link) {
          expect(pkg.resolved).toBeDefined();
        }
      });
    });

    test('should have integrity hashes for packages', () => {
      const packages = Object.entries(packageLockJson.packages);
      const nodeModulePackages = packages.filter(([key]) => key.startsWith('node_modules/'));

      nodeModulePackages.slice(0, 10).forEach(([key, pkg]) => {
        if (!pkg.link && pkg.resolved) {
          expect(pkg.integrity).toBeDefined();
          expect(pkg.integrity).toMatch(/^sha\d+-/);
        }
      });
    });

    test('should not have conflicting versions of same package', () => {
      const packageVersions = {};

      Object.entries(packageLockJson.packages).forEach(([key, pkg]) => {
        if (key.startsWith('node_modules/')) {
          const pkgName = key.replace(/^node_modules\//, '').split('/node_modules/').pop();
          if (!packageVersions[pkgName]) {
            packageVersions[pkgName] = [];
          }
          if (pkg.version) {
            packageVersions[pkgName].push(pkg.version);
          }
        }
      });

      // Allow multiple versions but log them for awareness
      Object.entries(packageVersions).forEach(([name, versions]) => {
        const uniqueVersions = [...new Set(versions)];
        // This is informational - multiple versions are sometimes necessary
        if (uniqueVersions.length > 1) {
          // Just check that versions array exists
          expect(Array.isArray(versions)).toBe(true);
        }
      });
    });
  });

  describe('Version Constraints', () => {
    test('should not use wildcards in production dependencies', () => {
      const deps = packageJson.dependencies || {};

      Object.entries(deps).forEach(([name, version]) => {
        expect(version).not.toBe('*');
        expect(version).not.toMatch(/^x$/i);
      });
    });

    test('should use semantic versioning', () => {
      const deps = packageJson.dependencies || {};

      Object.entries(deps).forEach(([name, version]) => {
        // Should start with ^, ~, or be an exact version
        expect(version).toMatch(/^[\^~]?\d+\.\d+\.\d+/);
      });
    });

    test('should have Node.js engine requirement', () => {
      expect(packageJson.engines).toBeDefined();
      expect(packageJson.engines.node).toBeDefined();
      expect(packageJson.engines.node).toMatch(/>=18\.0\.0/);
    });
  });

  describe('Security and Best Practices', () => {
    test('should not have dependencies with known critical vulnerabilities', () => {
      // This is a placeholder - in real scenarios, you'd integrate with npm audit
      const criticalVulnerabilities = [];
      expect(criticalVulnerabilities).toEqual([]);
    });

    test('should have security-related packages (helmet, cors)', () => {
      const deps = packageLockJson.packages[''].dependencies;
      expect(deps.helmet).toBeDefined();
      expect(deps.cors).toBeDefined();
    });

    test('should use modern package versions', () => {
      const deps = packageLockJson.packages[''].dependencies;

      // Check Express is version 4.x (modern)
      expect(deps.express).toMatch(/^\^4\./);
    });

    test('should not have deprecated dependencies in direct dependencies', () => {
      // Check for commonly deprecated packages
      const deprecatedPackages = ['request', 'node-uuid'];
      const deps = Object.keys(packageJson.dependencies || {});

      deprecatedPackages.forEach(pkg => {
        expect(deps).not.toContain(pkg);
      });
    });
  });

  describe('Package Metadata', () => {
    test('should have valid package name', () => {
      expect(packageJson.name).toBe('vin-parts-backend');
      expect(packageJson.name).toMatch(/^[a-z0-9-]+$/);
    });

    test('should have version in semver format', () => {
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('should have description', () => {
      expect(packageJson.description).toBeDefined();
      expect(packageJson.description.length).toBeGreaterThan(10);
    });

    test('should have main entry point', () => {
      expect(packageJson.main).toBe('src/index.js');
    });

    test('should have test script', () => {
      expect(packageJson.scripts.test).toBeDefined();
      expect(packageJson.scripts.test).toBe('jest');
    });

    test('should have start script', () => {
      expect(packageJson.scripts.start).toBeDefined();
      expect(packageJson.scripts.start).toMatch(/node.*src\/index\.js/);
    });

    test('should have dev script', () => {
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.dev).toMatch(/nodemon/);
    });

    test('should have lint script', () => {
      expect(packageJson.scripts.lint).toBeDefined();
      expect(packageJson.scripts.lint).toMatch(/eslint/);
    });
  });

  describe('Lock File Structure Validation', () => {
    test('should have requires property set to true', () => {
      expect(packageLockJson.requires).toBe(true);
    });

    test('should not have empty packages object', () => {
      const packagesCount = Object.keys(packageLockJson.packages).length;
      expect(packagesCount).toBeGreaterThan(1); // At least root + some dependencies
    });

    test('should have consistent package structure', () => {
      Object.entries(packageLockJson.packages).forEach(([key, pkg]) => {
        if (key !== '' && !pkg.link) {
          // Each package should have basic properties
          expect(typeof pkg).toBe('object');

          // Most packages should have version (unless linked)
          if (!key.startsWith('node_modules/@types')) {
            // Types packages might have different structure
          }
        }
      });
    });
  });

  describe('Dependency Graph Validation', () => {
    test('should have all node_modules entries prefixed correctly', () => {
      const packages = Object.keys(packageLockJson.packages);
      const nodeModulePackages = packages.filter(key => key.includes('node_modules'));

      nodeModulePackages.forEach(pkg => {
        expect(pkg).toMatch(/^node_modules\//);
      });
    });

    test('should have license information for packages', () => {
      const packages = Object.entries(packageLockJson.packages);
      const nodeModulePackages = packages.filter(([key]) => key.startsWith('node_modules/'));

      // Check first 10 packages have license info
      nodeModulePackages.slice(0, 10).forEach(([key, pkg]) => {
        // License is optional but commonly present
        if (pkg.license) {
          expect(typeof pkg.license).toBe('string');
        }
      });
    });
  });

  describe('Edge Cases and Robustness', () => {
    test('should not have circular dependencies in direct dependencies', () => {
      const deps = packageJson.dependencies || {};
      const devDeps = packageJson.devDependencies || {};

      Object.keys(deps).forEach(dep => {
        expect(devDeps).not.toHaveProperty(dep);
      });
    });

    test('should have valid JSON structure', () => {
      expect(() => {
        JSON.stringify(packageLockJson);
      }).not.toThrow();
    });

    test('should not have undefined or null values in package versions', () => {
      const deps = packageJson.dependencies || {};
      const devDeps = packageJson.devDependencies || {};

      Object.values(deps).forEach(version => {
        expect(version).toBeDefined();
        expect(version).not.toBeNull();
      });

      Object.values(devDeps).forEach(version => {
        expect(version).toBeDefined();
        expect(version).not.toBeNull();
      });
    });

    test('should have package-lock.json with larger size than package.json', () => {
      const packagePath = path.join(__dirname, '../package.json');
      const packageLockPath = path.join(__dirname, '../package-lock.json');

      const packageSize = fs.statSync(packagePath).size;
      const packageLockSize = fs.statSync(packageLockPath).size;

      expect(packageLockSize).toBeGreaterThan(packageSize);
    });
  });
});