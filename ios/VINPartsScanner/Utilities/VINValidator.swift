//
//  VINValidator.swift
//  VINPartsScanner
//
//  Utility for validating VIN (Vehicle Identification Numbers)
//

import Foundation

struct VINValidator {
    
    /// Validates a VIN according to ISO 3779 standard
    /// - Parameter vin: The VIN string to validate
    /// - Returns: A tuple containing validation result and error message if invalid
    static func validate(_ vin: String) -> (isValid: Bool, error: String?) {
        let cleaned = vin.uppercased().trimmingCharacters(in: .whitespaces)
        
        // Check length
        guard cleaned.count == 17 else {
            return (false, "VIN must be exactly 17 characters")
        }
        
        // Check for invalid characters (I, O, Q not allowed)
        if cleaned.contains(where: { "IOQ".contains($0) }) {
            return (false, "VIN cannot contain letters I, O, or Q")
        }
        
        // Check alphanumeric only
        guard cleaned.allSatisfy({ $0.isLetter || $0.isNumber }) else {
            return (false, "VIN can only contain letters and numbers")
        }
        
        // Validate check digit (position 9)
        if !validateCheckDigit(cleaned) {
            return (false, "VIN check digit is invalid")
        }
        
        return (true, nil)
    }
    
    /// Validates the check digit at position 9 of the VIN
    private static func validateCheckDigit(_ vin: String) -> Bool {
        let transliteration: [Character: Int] = [
            "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7, "H": 8,
            "J": 1, "K": 2, "L": 3, "M": 4, "N": 5, "P": 7, "R": 9,
            "S": 2, "T": 3, "U": 4, "V": 5, "W": 6, "X": 7, "Y": 8, "Z": 9
        ]
        
        let weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]
        
        var sum = 0
        let vinArray = Array(vin)
        
        for i in 0..<17 {
            let char = vinArray[i]
            var value: Int
            
            if char.isNumber {
                value = Int(String(char)) ?? 0
            } else {
                value = transliteration[char] ?? 0
            }
            
            sum += value * weights[i]
        }
        
        let remainder = sum % 11
        let checkDigit: Character = remainder == 10 ? "X" : Character(String(remainder))
        
        return vinArray[8] == checkDigit
    }
    
    /// Decodes basic information from a VIN
    /// - Parameter vin: The VIN to decode
    /// - Returns: Decoded VIN information
    static func decode(_ vin: String) -> VINInfo {
        let cleaned = vin.uppercased().trimmingCharacters(in: .whitespaces)
        
        return VINInfo(
            wmi: String(cleaned.prefix(3)),
            vds: String(cleaned.dropFirst(3).prefix(6)),
            vis: String(cleaned.suffix(8)),
            year: decodeModelYear(cleaned),
            plant: String(cleaned[cleaned.index(cleaned.startIndex, offsetBy: 10)])
        )
    }
    
    /// Decodes the model year from position 10 of the VIN
    private static func decodeModelYear(_ vin: String) -> Int? {
        let yearCodes: [Character: Int] = [
            "A": 2010, "B": 2011, "C": 2012, "D": 2013, "E": 2014,
            "F": 2015, "G": 2016, "H": 2017, "J": 2018, "K": 2019,
            "L": 2020, "M": 2021, "N": 2022, "P": 2023, "R": 2024,
            "S": 2025, "T": 2026, "V": 2027, "W": 2028, "X": 2029,
            "Y": 2030, "1": 2001, "2": 2002, "3": 2003, "4": 2004,
            "5": 2005, "6": 2006, "7": 2007, "8": 2008, "9": 2009
        ]
        
        let yearChar = vin[vin.index(vin.startIndex, offsetBy: 9)]
        return yearCodes[yearChar]
    }
}

/// Decoded VIN information
struct VINInfo {
    /// World Manufacturer Identifier (positions 1-3)
    let wmi: String
    
    /// Vehicle Descriptor Section (positions 4-9)
    let vds: String
    
    /// Vehicle Identifier Section (positions 10-17)
    let vis: String
    
    /// Model year decoded from position 10
    let year: Int?
    
    /// Manufacturing plant code (position 11)
    let plant: String
}
