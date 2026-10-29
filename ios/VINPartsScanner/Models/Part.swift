//
//  Part.swift
//  VINPartsScanner
//
//  Part model representing an OEM part with recommendation
//

import Foundation

enum Recommendation: String, Codable {
    case take = "TAKE"
    case dontTake = "DONT_TAKE"
    case check = "CHECK"
}

struct Part: Identifiable, Codable {
    let id: String
    let oem: String
    let description: String
    let category: String?
    let ourQty: Int
    let ebayCount: Int
    let ebayAvgPriceGbp: Double?
    let ebayMinPrice: Double?
    let ebayMaxPrice: Double?
    let matchConfidence: Double
    let recommendation: Recommendation
    let recommendationReason: String?
    let imageUrl: String?
    
    enum CodingKeys: String, CodingKey {
        case oem
        case description
        case category
        case ourQty = "our_qty"
        case ebayCount = "ebay_count"
        case ebayAvgPriceGbp = "ebay_avg_price_gbp"
        case ebayMinPrice = "ebay_min_price"
        case ebayMaxPrice = "ebay_max_price"
        case matchConfidence = "match_confidence"
        case recommendation
        case recommendationReason = "recommendation_reason"
        case imageUrl = "image_url"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        self.oem = try container.decode(String.self, forKey: .oem)
        self.id = oem // Use OEM as unique identifier
        self.description = try container.decode(String.self, forKey: .description)
        self.category = try container.decodeIfPresent(String.self, forKey: .category)
        self.ourQty = try container.decodeIfPresent(Int.self, forKey: .ourQty) ?? 0
        self.ebayCount = try container.decodeIfPresent(Int.self, forKey: .ebayCount) ?? 0
        self.ebayAvgPriceGbp = try container.decodeIfPresent(Double.self, forKey: .ebayAvgPriceGbp)
        self.ebayMinPrice = try container.decodeIfPresent(Double.self, forKey: .ebayMinPrice)
        self.ebayMaxPrice = try container.decodeIfPresent(Double.self, forKey: .ebayMaxPrice)
        self.matchConfidence = try container.decodeIfPresent(Double.self, forKey: .matchConfidence) ?? 1.0
        self.recommendation = try container.decode(Recommendation.self, forKey: .recommendation)
        self.recommendationReason = try container.decodeIfPresent(String.self, forKey: .recommendationReason)
        self.imageUrl = try container.decodeIfPresent(String.self, forKey: .imageUrl)
    }
    
    init(
        oem: String,
        description: String,
        category: String? = nil,
        ourQty: Int = 0,
        ebayCount: Int = 0,
        ebayAvgPriceGbp: Double? = nil,
        ebayMinPrice: Double? = nil,
        ebayMaxPrice: Double? = nil,
        matchConfidence: Double = 1.0,
        recommendation: Recommendation = .check,
        recommendationReason: String? = nil,
        imageUrl: String? = nil
    ) {
        self.id = oem
        self.oem = oem
        self.description = description
        self.category = category
        self.ourQty = ourQty
        self.ebayCount = ebayCount
        self.ebayAvgPriceGbp = ebayAvgPriceGbp
        self.ebayMinPrice = ebayMinPrice
        self.ebayMaxPrice = ebayMaxPrice
        self.matchConfidence = matchConfidence
        self.recommendation = recommendation
        self.recommendationReason = recommendationReason
        self.imageUrl = imageUrl
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(oem, forKey: .oem)
        try container.encode(description, forKey: .description)
        try container.encodeIfPresent(category, forKey: .category)
        try container.encode(ourQty, forKey: .ourQty)
        try container.encode(ebayCount, forKey: .ebayCount)
        try container.encodeIfPresent(ebayAvgPriceGbp, forKey: .ebayAvgPriceGbp)
        try container.encodeIfPresent(ebayMinPrice, forKey: .ebayMinPrice)
        try container.encodeIfPresent(ebayMaxPrice, forKey: .ebayMaxPrice)
        try container.encode(matchConfidence, forKey: .matchConfidence)
        try container.encode(recommendation, forKey: .recommendation)
        try container.encodeIfPresent(recommendationReason, forKey: .recommendationReason)
        try container.encodeIfPresent(imageUrl, forKey: .imageUrl)
    }
}

// MARK: - Preview Data

extension Part {
    static let preview = Part(
        oem: "34116771868",
        description: "Brake disc, front",
        category: "Brakes",
        ourQty: 0,
        ebayCount: 5,
        ebayAvgPriceGbp: 55.20,
        ebayMinPrice: 35.00,
        ebayMaxPrice: 75.00,
        matchConfidence: 0.95,
        recommendation: .take,
        recommendationReason: "No stock, avg price £55.20 >= £40 threshold"
    )
}
