//
//  ContentView.swift
//  VINPartsScanner
//
//  Main navigation container for the app
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authManager: AuthManager
    
    var body: some View {
        TabView {
            VINInputView()
                .tabItem {
                    Label("Scan", systemImage: "barcode.viewfinder")
                }
            
            HistoryView()
                .tabItem {
                    Label("History", systemImage: "clock")
                }
            
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
        }
        .accentColor(.blue)
    }
}

#Preview {
    ContentView()
        .environmentObject(SettingsManager())
        .environmentObject(AuthManager())
}
