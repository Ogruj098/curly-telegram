//
//  VINPartsScannerApp.swift
//  VINPartsScanner
//
//  Main entry point for the VIN Parts Scanner iOS application
//

import SwiftUI

@main
struct VINPartsScannerApp: App {
    @StateObject private var settingsManager = SettingsManager()
    @StateObject private var authManager = AuthManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(settingsManager)
                .environmentObject(authManager)
        }
    }
}
