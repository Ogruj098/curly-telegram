//
//  APIService.swift
//  VINPartsScanner
//
//  Network service for communicating with the backend API
//

import Foundation

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse(String)
    case serverError(Int, String)
    case decodingError(Error)
    case networkError(Error)
    case unauthorized
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse(let message):
            return message
        case .serverError(let code, let message):
            return "Server error (\(code)): \(message)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .unauthorized:
            return "Unauthorized - please log in again"
        }
    }
}

class APIService {
    static let shared = APIService()
    
    private var baseURL: String {
        UserDefaults.standard.string(forKey: "serverURL") ?? "https://localhost:3000"
    }
    
    private var authToken: String? {
        UserDefaults.standard.string(forKey: "authToken")
    }
    
    private init() {}
    
    // MARK: - Generic Request Method
    
    private func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: [String: Any]? = nil,
        requiresAuth: Bool = false
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if requiresAuth {
            guard let token = authToken else {
                throw APIError.unauthorized
            }
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }
        
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse("Invalid response type")
            }
            
            switch httpResponse.statusCode {
            case 200...299:
                let decoder = JSONDecoder()
                do {
                    return try decoder.decode(T.self, from: data)
                } catch {
                    throw APIError.decodingError(error)
                }
                
            case 401:
                throw APIError.unauthorized
                
            case 400...499:
                let errorMessage = String(data: data, encoding: .utf8) ?? "Client error"
                throw APIError.invalidResponse(errorMessage)
                
            case 500...599:
                let errorMessage = String(data: data, encoding: .utf8) ?? "Server error"
                throw APIError.serverError(httpResponse.statusCode, errorMessage)
                
            default:
                throw APIError.serverError(httpResponse.statusCode, "Unexpected status code")
            }
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }
    
    // MARK: - VIN Scanning
    
    func scanVIN(vin: String, thresholdGbp: Double, state: String) async throws -> ScanResult {
        let body: [String: Any] = [
            "vin": vin,
            "threshold_gbp": thresholdGbp,
            "state": state
        ]
        
        return try await request(
            endpoint: "/api/v1/scan",
            method: "POST",
            body: body
        )
    }
    
    // MARK: - Parts
    
    func getPartDetails(oem: String) async throws -> PartDetails {
        return try await request(endpoint: "/api/v1/parts/\(oem)")
    }
    
    // MARK: - History
    
    func getHistory(limit: Int = 20) async throws -> [ScanHistoryItem] {
        let response: HistoryResponse = try await request(
            endpoint: "/api/v1/history?limit=\(limit)"
        )
        return response.history
    }
    
    func getScanById(id: String) async throws -> ScanResult {
        return try await request(endpoint: "/api/v1/history/\(id)")
    }
    
    // MARK: - Authentication
    
    func login(username: String, password: String) async throws -> LoginResponse {
        let body: [String: Any] = [
            "username": username,
            "password": password
        ]
        
        return try await request(
            endpoint: "/api/auth/login",
            method: "POST",
            body: body
        )
    }
}

// MARK: - Response Types

struct HistoryResponse: Codable {
    let count: Int
    let total: Int
    let history: [ScanHistoryItem]
}

struct LoginResponse: Codable {
    let token: String
    let user: UserInfo
}

struct UserInfo: Codable {
    let username: String
    let role: String
}

struct PartDetails: Codable {
    let oem: String
    let description: String
    let category: String?
    let manufacturer: String?
    let compatibility: [String]?
    let imageUrl: String?
    let inventory: InventoryInfo?
    let ebay: EbayInfo?
    
    enum CodingKeys: String, CodingKey {
        case oem, description, category, manufacturer, compatibility
        case imageUrl = "image_url"
        case inventory, ebay
    }
}

struct InventoryInfo: Codable {
    let sku: String
    let quantity: Int
    let location: String
}

struct EbayInfo: Codable {
    let count: Int
    let avgPriceGbp: Double?
    let minPriceGbp: Double?
    let maxPriceGbp: Double?
    let sampleListings: [EbayListing]?
    
    enum CodingKeys: String, CodingKey {
        case count
        case avgPriceGbp = "avg_price_gbp"
        case minPriceGbp = "min_price_gbp"
        case maxPriceGbp = "max_price_gbp"
        case sampleListings = "sample_listings"
    }
}

struct EbayListing: Codable {
    let itemId: String
    let title: String
    let price: String?
    let condition: String?
    let itemWebUrl: String?
    
    enum CodingKeys: String, CodingKey {
        case itemId = "item_id"
        case title, price, condition
        case itemWebUrl = "item_web_url"
    }
}
