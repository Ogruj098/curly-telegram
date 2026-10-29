/**
 * Parts List Service
 * 
 * Provides OEM parts data for vehicles based on VIN
 * In production, this would integrate with partslink24 or similar service
 */

const logger = require('../utils/logger');
const cacheService = require('./cacheService');
const { decodeVIN } = require('../utils/vinValidator');

// Sample parts database (in production, this would be from partslink24 or similar)
const SAMPLE_PARTS_DATABASE = {
  // BMW parts (WMI: WBA, WBS)
  'WBA': [
    { oem: '34116771868', description: 'Brake disc, front', category: 'Brakes' },
    { oem: '34116855781', description: 'Brake pad set, front', category: 'Brakes' },
    { oem: '34216775287', description: 'Brake disc, rear', category: 'Brakes' },
    { oem: '34216777649', description: 'Brake pad set, rear', category: 'Brakes' },
    { oem: '31336752735', description: 'Shock absorber, front left', category: 'Suspension' },
    { oem: '31336752736', description: 'Shock absorber, front right', category: 'Suspension' },
    { oem: '33526779985', description: 'Shock absorber, rear', category: 'Suspension' },
    { oem: '17117509838', description: 'Radiator', category: 'Cooling' },
    { oem: '17127531579', description: 'Coolant hose', category: 'Cooling' },
    { oem: '11127552280', description: 'Valve cover gasket', category: 'Engine' },
    { oem: '32106777470', description: 'Tie rod end', category: 'Steering' },
    { oem: '31126775972', description: 'Control arm, front lower', category: 'Suspension' },
    { oem: '63117352477', description: 'Headlight, LED right', category: 'Lighting' },
    { oem: '63117352478', description: 'Headlight, LED left', category: 'Lighting' },
    { oem: '51117293085', description: 'Front bumper', category: 'Body' }
  ],
  // Mercedes parts (WMI: WDB, WDD)
  'WDB': [
    { oem: 'A2044210512', description: 'Brake disc, front', category: 'Brakes' },
    { oem: 'A0064205020', description: 'Brake pad set, front', category: 'Brakes' },
    { oem: 'A2044231012', description: 'Brake disc, rear', category: 'Brakes' },
    { oem: 'A0064203920', description: 'Brake pad set, rear', category: 'Brakes' },
    { oem: 'A2043202030', description: 'Shock absorber, front', category: 'Suspension' },
    { oem: 'A2043202530', description: 'Shock absorber, rear', category: 'Suspension' },
    { oem: 'A2045000100', description: 'Radiator', category: 'Cooling' },
    { oem: 'A2711400101', description: 'Intake manifold', category: 'Engine' },
    { oem: 'A2044600400', description: 'Tie rod end', category: 'Steering' },
    { oem: 'A2048200156', description: 'Headlight, right', category: 'Lighting' },
    { oem: 'A2048200256', description: 'Headlight, left', category: 'Lighting' }
  ],
  // Audi/VW parts (WMI: WAU, WVW)
  'WAU': [
    { oem: '4G0615301AH', description: 'Brake disc, front', category: 'Brakes' },
    { oem: '4G0698151D', description: 'Brake pad set, front', category: 'Brakes' },
    { oem: '4G0615601F', description: 'Brake disc, rear', category: 'Brakes' },
    { oem: '4G0698451C', description: 'Brake pad set, rear', category: 'Brakes' },
    { oem: '4G0413031AM', description: 'Shock absorber, front', category: 'Suspension' },
    { oem: '4G0513035D', description: 'Shock absorber, rear', category: 'Suspension' },
    { oem: '4G0121251C', description: 'Radiator', category: 'Cooling' },
    { oem: '4G0407693L', description: 'Control arm, front', category: 'Suspension' },
    { oem: '4G0941773C', description: 'Headlight, Matrix LED right', category: 'Lighting' },
    { oem: '4G0941774C', description: 'Headlight, Matrix LED left', category: 'Lighting' }
  ]
};

// Default parts for unknown manufacturers
const DEFAULT_PARTS = [
  { oem: 'BRAKE-DISC-F', description: 'Brake disc, front (generic)', category: 'Brakes' },
  { oem: 'BRAKE-PAD-F', description: 'Brake pad set, front (generic)', category: 'Brakes' },
  { oem: 'BRAKE-DISC-R', description: 'Brake disc, rear (generic)', category: 'Brakes' },
  { oem: 'BRAKE-PAD-R', description: 'Brake pad set, rear (generic)', category: 'Brakes' },
  { oem: 'SHOCK-F', description: 'Shock absorber, front (generic)', category: 'Suspension' },
  { oem: 'SHOCK-R', description: 'Shock absorber, rear (generic)', category: 'Suspension' }
];

/**
 * Get parts list for a VIN
 * @param {string} vin - Vehicle Identification Number
 * @returns {Promise<array>} - List of parts for the vehicle
 */
async function getPartsForVIN(vin) {
  // Check cache first
  const cacheKey = cacheService.vinPartsKey(vin);
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const vinInfo = decodeVIN(vin);
    const wmi = vinInfo.wmi;

    logger.info(`Looking up parts for VIN: ${vin}, WMI: ${wmi}`);

    // Find parts based on manufacturer (WMI)
    let parts = SAMPLE_PARTS_DATABASE[wmi];
    
    if (!parts) {
      // Try partial WMI match
      const wmiPrefix = wmi.substring(0, 2);
      parts = Object.entries(SAMPLE_PARTS_DATABASE).find(
        ([key]) => key.startsWith(wmiPrefix)
      )?.[1];
    }

    if (!parts) {
      logger.warn(`No parts found for WMI: ${wmi}, using defaults`);
      parts = DEFAULT_PARTS;
    }

    // Add VIN-specific metadata
    const result = parts.map(part => ({
      ...part,
      vin: vin,
      year: vinInfo.year,
      matchConfidence: parts === DEFAULT_PARTS ? 0.5 : 0.95
    }));

    // Cache the result
    cacheService.set(cacheKey, result);

    return result;
  } catch (error) {
    logger.error('Parts lookup error:', error);
    throw error;
  }
}

/**
 * Get detailed part information by OEM number
 * @param {string} oem - OEM part number
 * @returns {Promise<object>} - Part details
 */
async function getPartByOEM(oem) {
  // Search all databases for the part
  for (const [manufacturer, parts] of Object.entries(SAMPLE_PARTS_DATABASE)) {
    const part = parts.find(p => p.oem === oem);
    if (part) {
      return {
        ...part,
        manufacturer,
        compatibility: [`${manufacturer} models`],
        imageUrl: null // Would come from parts catalog
      };
    }
  }

  return null;
}

module.exports = {
  getPartsForVIN,
  getPartByOEM
};
