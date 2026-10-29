//
//  ScanResult.swift
//  VINPartsScanner
//
//  Scan result model containing VIN info, parts, and summary
//

import Foundation

struct ScanSummary: Codable {
    let total: Int
    let takeCount: Int
    let dontTakeCount: Int
    let checkCount: Int
    let estimatedValue: String?
    
    enum CodingKeys: String, CodingKey {
        case total
        case takeCount = "take_count"
        case dontTakeCount = "dont_take_count"
        case checkCount = "check_count"
        case estimatedValue = "estimated_value"
    }
}

struct ScanSettings: Codable {
    let thresholdGbp: Double
    let state: String
    
    enum CodingKeys: String, CodingKey {
        case thresholdGbp = "threshold_gbp"
        case state
    }
}

struct ScanResult: Codable {
    let vin: String
    let timestamp: Date
    let settings: ScanSettings
    let summary: ScanSummary
    let parts: [Part]
    
    enum CodingKeys: String, CodingKey {
        case vin
        case timestamp
        case settings
        case summary
        case parts
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        self.vin = try container.decode(String.self, forKey: .vin)
        
        // Parse ISO 8601 date string using shared utility
        let timestampString = try container.decode(String.self, forKey: .timestamp)
        self.timestamp = DateUtils.parseISO8601(timestampString)
        
        self.settings = try container.decode(ScanSettings.self, forKey: .settings)
        self.summary = try container.decode(ScanSummary.self, forKey: .summary)
        self.parts = try container.decode([Part].self, forKey: .parts)
    }
    
    init(vin: String, timestamp: Date, settings: ScanSettings, summary: ScanSummary, parts: [Part]) {
        self.vin = vin
        self.timestamp = timestamp
        self.settings = settings
        self.summary = summary
        self.parts = parts
    }
}

// MARK: - Scan History Item

struct ScanHistoryItem: Identifiable, Codable {
    let id: String
    let vin: String
    let timestamp: Date
    let settings: ScanSettings
    let summary: ScanSummary
    let user: String?
    
    var formattedDate: String {
        DateUtils.formatForDisplay(timestamp)
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case vin
        case timestamp
        case settings
        case summary
        case user
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        self.id = try container.decode(String.self, forKey: .id)
        self.vin = try container.decode(String.self, forKey: .vin)
        
        // Parse ISO 8601 date string using shared utility
        let timestampString = try container.decode(String.self, forKey: .timestamp)
        self.timestamp = DateUtils.parseISO8601(timestampString)
        
        self.settings = try container.decode(ScanSettings.self, forKey: .settings)
        self.summary = try container.decode(ScanSummary.self, forKey: .summary)
        self.user = try container.decodeIfPresent(String.self, forKey: .user)
    }
}

// MARK: - Preview Data

extension ScanResult {
    static let preview = ScanResult(
        vin: "WBA1234567ABCDE89",
        timestamp: Date(),
        settings: ScanSettings(thresholdGbp: 40, state: "used"),
        summary: ScanSummary(
            total: 15,
            takeCount: 8,
            dontTakeCount: 5,
            checkCount: 2,
            estimatedValue: "450.00"
        ),
        parts: [
            Part(
                oem: "34116771868",
                description: "Brake disc, front",
                category: "Brakes",
                ourQty: 0,
                ebayCount: 5,
                ebayAvgPriceGbp: 55.20,
                matchConfidence: 0.95,
                recommendation: .take
            ),
            Part(
                oem: "34116855781",
                description: "Brake pad set, front",
                category: "Brakes",
                ourQty: 3,
                ebayCount: 12,
                ebayAvgPriceGbp: 35.00,
                matchConfidence: 0.98,
                recommendation: .dontTake
            ),
            Part(
                oem: "17117509838",
                description: "Radiator",
                category: "Cooling",
                ourQty: 0,
                ebayCount: 0,
                matchConfidence: 0.7,
                recommendation: .check
            )
        ]
    )
}
