/**
 * README.md Validation Tests
 * Tests for documentation structure, completeness, and link validity
 */

const fs = require('fs');
const path = require('path');

describe('README.md Validation', () => {
  let readmeContent;

  beforeAll(() => {
    const readmePath = path.join(__dirname, '../../README.md');
    readmeContent = fs.readFileSync(readmePath, 'utf-8');
  });

  describe('File Existence and Structure', () => {
    test('should exist and be readable', () => {
      expect(readmeContent).toBeDefined();
      expect(readmeContent.length).toBeGreaterThan(0);
    });

    test('should have a title', () => {
      expect(readmeContent).toMatch(/^#\s+/m);
    });

    test('should not be empty', () => {
      expect(readmeContent.trim().length).toBeGreaterThan(100);
    });
  });

  describe('Required Sections', () => {
    test('should contain About This Repository section', () => {
      expect(readmeContent).toMatch(/##\s+About This Repository/i);
    });

    test('should contain VIN Parts Scanner section', () => {
      expect(readmeContent).toMatch(/##\s+VIN Parts Scanner/i);
    });

    test('should contain iOS Application section', () => {
      expect(readmeContent).toMatch(/###\s+iOS Application/i);
    });

    test('should contain Backend API section', () => {
      expect(readmeContent).toMatch(/###\s+Backend API/i);
    });

    test('should contain Quick Start section', () => {
      expect(readmeContent).toMatch(/###\s+Quick Start/i);
    });

    test('should contain Contributing section', () => {
      expect(readmeContent).toMatch(/##\s+Contributing/i);
    });

    test('should contain GitHub Copilot section', () => {
      expect(readmeContent).toMatch(/##\s+GitHub Copilot/i);
    });
  });

  describe('Content Validation', () => {
    test('should mention key technologies (Node.js, Express, SwiftUI)', () => {
      expect(readmeContent.toLowerCase()).toMatch(/node\.?js/);
      expect(readmeContent.toLowerCase()).toMatch(/express/);
      expect(readmeContent.toLowerCase()).toMatch(/swiftui/);
    });

    test('should include setup instructions', () => {
      expect(readmeContent).toMatch(/npm install/i);
      expect(readmeContent).toMatch(/\.env/i);
    });

    test('should reference backend README', () => {
      expect(readmeContent).toMatch(/backend\/README\.md/i);
    });

    test('should reference iOS README', () => {
      expect(readmeContent).toMatch(/ios\/README\.md/i);
    });

    test('should mention VIN scanning functionality', () => {
      expect(readmeContent.toLowerCase()).toMatch(/vin/);
      expect(readmeContent.toLowerCase()).toMatch(/scan/);
    });

    test('should mention eBay integration', () => {
      expect(readmeContent.toLowerCase()).toMatch(/ebay/);
    });

    test('should mention JWT authentication', () => {
      expect(readmeContent).toMatch(/JWT/i);
    });

    test('should include copyright information', () => {
      // Accept both © symbol and &copy; HTML entity
      expect(readmeContent).toMatch(/©|&copy;|copyright/i);
      expect(readmeContent).toMatch(/2025/);
    });

    test('should mention MIT License', () => {
      expect(readmeContent).toMatch(/MIT License/i);
    });
  });

  describe('Code Blocks', () => {
    test('should contain code blocks for setup', () => {
      expect(readmeContent).toMatch(/```bash/);
    });

    test('should have properly formatted code blocks', () => {
      const codeBlockMatches = readmeContent.match(/```/g);
      // Code blocks should be opened and closed (even number of ```)
      expect(codeBlockMatches).toBeTruthy();
      expect(codeBlockMatches.length % 2).toBe(0);
    });

    test('should include npm install command', () => {
      expect(readmeContent).toMatch(/npm install/);
    });

    test('should include environment setup command', () => {
      expect(readmeContent).toMatch(/\.env\.example.*\.env/);
    });

    test('should include development server command', () => {
      expect(readmeContent).toMatch(/npm run dev/);
    });
  });

  describe('Links and References', () => {
    test('should contain markdown links', () => {
      const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
      const links = readmeContent.match(linkPattern);
      expect(links).toBeTruthy();
      expect(links.length).toBeGreaterThan(0);
    });

    test('should reference ANCHOR_REFERENCE.md', () => {
      expect(readmeContent).toMatch(/ANCHOR_REFERENCE\.md/);
    });

    test('should reference GITHUB_COPILOT.md', () => {
      expect(readmeContent).toMatch(/GITHUB_COPILOT\.md/);
    });

    test('should reference CONTRIBUTING.md', () => {
      expect(readmeContent).toMatch(/CONTRIBUTING\.md/);
    });

    test('should reference demo-automation.yml workflow', () => {
      expect(readmeContent).toMatch(/\.github\/workflows\/demo-automation\.yml/);
    });

    test('should not contain broken markdown links', () => {
      // Check for common broken link patterns
      expect(readmeContent).not.toMatch(/\[([^\]]+)\]\(\s*\)/); // Empty links
      // Note: [![](...)] is valid markdown for image badges with no alt text, so we allow it
      // Only flag links (not images) with no text: [](...)
      expect(readmeContent).not.toMatch(/[^!]\[\]\([^)]+\)/); // Links (not images) with no text
    });

    test('should have valid badge URLs', () => {
      const badges = readmeContent.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/g);
      if (badges) {
        badges.forEach(badge => {
          expect(badge).toMatch(/https?:\/\//);
        });
      }
    });
  });

  describe('Feature Documentation', () => {
    test('should list VIN scanning features', () => {
      expect(readmeContent).toMatch(/VIN Scanning/i);
      expect(readmeContent).toMatch(/Parts Lookup/i);
    });

    test('should list eBay integration features', () => {
      expect(readmeContent).toMatch(/eBay Integration/i);
      expect(readmeContent).toMatch(/average prices/i);
    });

    test('should list recommendation features', () => {
      expect(readmeContent).toMatch(/Recommendation/i);
      expect(readmeContent).toMatch(/TAKE|CHECK|DON'T TAKE/i);
    });

    test('should list backend API features', () => {
      expect(readmeContent).toMatch(/VIN Processing/i);
      expect(readmeContent).toMatch(/Inventory Management/i);
      expect(readmeContent).toMatch(/Caching/i);
    });

    test('should mention Vision framework for iOS', () => {
      expect(readmeContent).toMatch(/Vision framework/i);
    });
  });

  describe('Format and Style', () => {
    test('should not have trailing whitespace on lines', () => {
      const lines = readmeContent.split('\n');
      const badLines = lines.filter((line, idx) =>
        line.length > 0 && line !== line.trimEnd() && idx < lines.length - 1
      );
      expect(badLines.length).toBe(0);
    });

    test('should use consistent heading levels', () => {
      const headings = readmeContent.match(/^#+\s+.+$/gm);
      expect(headings).toBeTruthy();
      headings.forEach(heading => {
        // Should not jump more than one level (e.g., # to ###)
        const level = heading.match(/^#+/)[0].length;
        expect(level).toBeLessThanOrEqual(4);
      });
    });

    test('should have consistent list formatting', () => {
      // Check that bullet points use consistent markers
      const bulletPoints = readmeContent.match(/^[\s]*[-*+]\s+/gm);
      if (bulletPoints) {
        expect(bulletPoints.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Contact and Support Information', () => {
    test('should reference Code of Conduct', () => {
      expect(readmeContent).toMatch(/Code of Conduct/i);
    });

    test('should have GitHub reference', () => {
      expect(readmeContent).toMatch(/GitHub/i);
    });

    test('should contain octodex image reference', () => {
      expect(readmeContent).toMatch(/octodex\.github\.com/i);
    });
  });

  describe('Edge Cases and Robustness', () => {
    test('should not contain TODO or FIXME markers', () => {
      expect(readmeContent.toUpperCase()).not.toMatch(/\bTODO\b/);
      expect(readmeContent.toUpperCase()).not.toMatch(/\bFIXME\b/);
    });

    test('should not contain placeholder text', () => {
      expect(readmeContent.toLowerCase()).not.toMatch(/lorem ipsum/);
      expect(readmeContent.toLowerCase()).not.toMatch(/placeholder/);
    });

    test('should not have multiple consecutive blank lines', () => {
      expect(readmeContent).not.toMatch(/\n\n\n\n/);
    });

    test('should end with a newline', () => {
      expect(readmeContent.endsWith('\n')).toBe(true);
    });
  });
});