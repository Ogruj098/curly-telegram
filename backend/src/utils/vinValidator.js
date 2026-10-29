/**
 * VIN Validation Utility
 * 
 * Validates Vehicle Identification Numbers according to ISO 3779
 */

/**
 * Validates a VIN (Vehicle Identification Number)
 * @param {string} vin - The VIN to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
function validateVIN(vin) {
  if (!vin || typeof vin !== 'string') {
    return { valid: false, error: 'VIN must be a non-empty string' };
  }

  const cleanVin = vin.trim().toUpperCase();

  // VIN must be exactly 17 characters
  if (cleanVin.length !== 17) {
    return { valid: false, error: 'VIN must be exactly 17 characters' };
  }

  // VIN cannot contain I, O, Q (to avoid confusion with 1, 0)
  if (/[IOQ]/i.test(cleanVin)) {
    return { valid: false, error: 'VIN cannot contain letters I, O, or Q' };
  }

  // VIN must only contain alphanumeric characters
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin)) {
    return { valid: false, error: 'VIN contains invalid characters' };
  }

  // Check digit validation (position 9)
  if (!validateCheckDigit(cleanVin)) {
    return { valid: false, error: 'VIN check digit is invalid' };
  }

  return { valid: true, vin: cleanVin };
}

/**
 * Validates the check digit (9th character) of a VIN
 * @param {string} vin - The VIN to validate
 * @returns {boolean} - Whether the check digit is valid
 */
function validateCheckDigit(vin) {
  const transliteration = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
    J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
    S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9
  };

  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = vin[i];
    let value;
    
    if (/[0-9]/.test(char)) {
      value = parseInt(char, 10);
    } else {
      value = transliteration[char];
    }
    
    sum += value * weights[i];
  }

  const remainder = sum % 11;
  const checkDigit = remainder === 10 ? 'X' : remainder.toString();

  return vin[8] === checkDigit;
}

/**
 * Extracts basic information from a VIN
 * @param {string} vin - The VIN to decode
 * @returns {object} - Basic VIN information
 */
function decodeVIN(vin) {
  const cleanVin = vin.trim().toUpperCase();
  
  return {
    wmi: cleanVin.substring(0, 3),      // World Manufacturer Identifier
    vds: cleanVin.substring(3, 9),      // Vehicle Descriptor Section
    vis: cleanVin.substring(9, 17),     // Vehicle Identifier Section
    year: decodeModelYear(cleanVin[9]),
    plant: cleanVin[10],
    serial: cleanVin.substring(11, 17)
  };
}

/**
 * Decodes the model year from VIN position 10
 * @param {string} char - The character at position 10
 * @returns {number|null} - The model year or null if unknown
 */
function decodeModelYear(char) {
  const yearCodes = {
    'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
    'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
    'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
    'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029,
    'Y': 2030, '1': 2001, '2': 2002, '3': 2003, '4': 2004,
    '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009
  };
  
  return yearCodes[char] || null;
}

module.exports = {
  validateVIN,
  decodeVIN
};
