//
//  AuthManager.swift
//  VINPartsScanner
//
//  Manages user authentication state
//

import Foundation
import SwiftUI

class AuthManager: ObservableObject {
    // MARK: - Published Properties
    
    @Published var isAuthenticated: Bool = false
    @Published var username: String?
    @Published var userRole: String?
    
    // MARK: - Private Properties
    
    private let tokenKey = "authToken"
    private let usernameKey = "username"
    private let roleKey = "userRole"
    
    // MARK: - Initialization
    
    init() {
        // Check for existing token
        if let token = UserDefaults.standard.string(forKey: tokenKey),
           !token.isEmpty {
            isAuthenticated = true
            username = UserDefaults.standard.string(forKey: usernameKey)
            userRole = UserDefaults.standard.string(forKey: roleKey)
        }
    }
    
    // MARK: - Methods
    
    func login(username: String, password: String) async throws {
        let response = try await APIService.shared.login(username: username, password: password)
        
        // Save token and user info
        await MainActor.run {
            UserDefaults.standard.set(response.token, forKey: tokenKey)
            UserDefaults.standard.set(response.user.username, forKey: usernameKey)
            UserDefaults.standard.set(response.user.role, forKey: roleKey)
            
            self.isAuthenticated = true
            self.username = response.user.username
            self.userRole = response.user.role
        }
    }
    
    func logout() {
        // Clear stored credentials
        UserDefaults.standard.removeObject(forKey: tokenKey)
        UserDefaults.standard.removeObject(forKey: usernameKey)
        UserDefaults.standard.removeObject(forKey: roleKey)
        
        isAuthenticated = false
        username = nil
        userRole = nil
    }
    
    var token: String? {
        UserDefaults.standard.string(forKey: tokenKey)
    }
}
