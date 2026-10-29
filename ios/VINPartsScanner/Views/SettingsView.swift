//
//  SettingsView.swift
//  VINPartsScanner
//
//  Settings and configuration screen
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var settingsManager: SettingsManager
    @EnvironmentObject var authManager: AuthManager
    @State private var showingLogin = false
    
    var body: some View {
        NavigationStack {
            Form {
                // Price Threshold Section
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Price Threshold")
                            Spacer()
                            Text("£\(Int(settingsManager.priceThreshold))")
                                .foregroundColor(.secondary)
                        }
                        
                        Slider(
                            value: $settingsManager.priceThreshold,
                            in: 10...200,
                            step: 5
                        )
                    }
                } header: {
                    Text("Recommendation Settings")
                } footer: {
                    Text("Parts with average eBay price below this threshold will be marked as 'Don't Take'")
                }
                
                // Part State Section
                Section {
                    Picker("Part Condition", selection: $settingsManager.partState) {
                        Text("Used").tag("used")
                        Text("New").tag("new")
                    }
                    .pickerStyle(.segmented)
                } header: {
                    Text("eBay Search Filter")
                } footer: {
                    Text("Filter eBay results by part condition")
                }
                
                // Cache Section
                Section {
                    Toggle("Enable Caching", isOn: $settingsManager.cachingEnabled)
                    
                    if settingsManager.cachingEnabled {
                        Picker("Cache Duration", selection: $settingsManager.cacheDuration) {
                            Text("6 hours").tag(6)
                            Text("12 hours").tag(12)
                            Text("24 hours").tag(24)
                        }
                    }
                    
                    Button("Clear Cache", role: .destructive) {
                        settingsManager.clearCache()
                    }
                } header: {
                    Text("Cache Settings")
                } footer: {
                    Text("Caching eBay results reduces API calls and speeds up subsequent scans")
                }
                
                // Server Section
                Section {
                    HStack {
                        Text("Server URL")
                        Spacer()
                        TextField("URL", text: $settingsManager.serverURL)
                            .multilineTextAlignment(.trailing)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .foregroundColor(.secondary)
                    }
                } header: {
                    Text("Server Configuration")
                }
                
                // Account Section
                Section {
                    if authManager.isAuthenticated {
                        HStack {
                            Text("Logged in as")
                            Spacer()
                            Text(authManager.username ?? "Unknown")
                                .foregroundColor(.secondary)
                        }
                        
                        Button("Sign Out", role: .destructive) {
                            authManager.logout()
                        }
                    } else {
                        Button("Sign In") {
                            showingLogin = true
                        }
                    }
                } header: {
                    Text("Account")
                } footer: {
                    Text("Sign in to access inventory management and sync history")
                }
                
                // About Section
                Section {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                    
                    Link(destination: URL(string: "https://github.com")!) {
                        HStack {
                            Text("View on GitHub")
                            Spacer()
                            Image(systemName: "arrow.up.right.square")
                                .foregroundColor(.secondary)
                        }
                    }
                } header: {
                    Text("About")
                }
            }
            .navigationTitle("Settings")
            .sheet(isPresented: $showingLogin) {
                LoginView()
            }
        }
    }
}

// MARK: - Login View

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) var dismiss
    
    @State private var username = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Username", text: $username)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    
                    SecureField("Password", text: $password)
                }
                
                if let error = errorMessage {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                    }
                }
                
                Section {
                    Button(action: login) {
                        if isLoading {
                            ProgressView()
                        } else {
                            Text("Sign In")
                        }
                    }
                    .disabled(username.isEmpty || password.isEmpty || isLoading)
                }
            }
            .navigationTitle("Sign In")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private func login() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                try await authManager.login(username: username, password: password)
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(SettingsManager())
        .environmentObject(AuthManager())
}
