//
//  SettingsManager.swift
//  VINPartsScanner
//
//  Manages app settings and preferences
//

import Foundation
import SwiftUI

class SettingsManager: ObservableObject {
    // MARK: - Published Properties
    
    @Published var priceThreshold: Double {
        didSet {
            UserDefaults.standard.set(priceThreshold, forKey: Keys.priceThreshold)
        }
    }
    
    @Published var partState: String {
        didSet {
            UserDefaults.standard.set(partState, forKey: Keys.partState)
        }
    }
    
    @Published var cachingEnabled: Bool {
        didSet {
            UserDefaults.standard.set(cachingEnabled, forKey: Keys.cachingEnabled)
        }
    }
    
    @Published var cacheDuration: Int {
        didSet {
            UserDefaults.standard.set(cacheDuration, forKey: Keys.cacheDuration)
        }
    }
    
    @Published var serverURL: String {
        didSet {
            UserDefaults.standard.set(serverURL, forKey: Keys.serverURL)
        }
    }
    
    // MARK: - Keys
    
    private enum Keys {
        static let priceThreshold = "priceThreshold"
        static let partState = "partState"
        static let cachingEnabled = "cachingEnabled"
        static let cacheDuration = "cacheDuration"
        static let serverURL = "serverURL"
    }
    
    // MARK: - Default Values
    
    private enum Defaults {
        static let priceThreshold: Double = 40.0
        static let partState = "used"
        static let cachingEnabled = true
        static let cacheDuration = 12
        static let serverURL = "https://localhost:3000"
    }
    
    // MARK: - Initialization
    
    init() {
        // Load saved values or use defaults
        self.priceThreshold = UserDefaults.standard.object(forKey: Keys.priceThreshold) as? Double ?? Defaults.priceThreshold
        self.partState = UserDefaults.standard.string(forKey: Keys.partState) ?? Defaults.partState
        self.cachingEnabled = UserDefaults.standard.object(forKey: Keys.cachingEnabled) as? Bool ?? Defaults.cachingEnabled
        self.cacheDuration = UserDefaults.standard.object(forKey: Keys.cacheDuration) as? Int ?? Defaults.cacheDuration
        self.serverURL = UserDefaults.standard.string(forKey: Keys.serverURL) ?? Defaults.serverURL
    }
    
    // MARK: - Methods
    
    func resetToDefaults() {
        priceThreshold = Defaults.priceThreshold
        partState = Defaults.partState
        cachingEnabled = Defaults.cachingEnabled
        cacheDuration = Defaults.cacheDuration
        serverURL = Defaults.serverURL
    }
    
    func clearCache() {
        // Clear cached VIN results
        let cacheKeys = UserDefaults.standard.dictionaryRepresentation().keys.filter { $0.hasPrefix("cache_") }
        cacheKeys.forEach { UserDefaults.standard.removeObject(forKey: $0) }
    }
}
