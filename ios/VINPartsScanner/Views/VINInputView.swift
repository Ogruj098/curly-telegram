//
//  VINInputView.swift
//  VINPartsScanner
//
//  Screen for entering or scanning VIN
//

import SwiftUI

struct VINInputView: View {
    @StateObject private var viewModel = VINInputViewModel()
    @EnvironmentObject var settingsManager: SettingsManager
    @State private var showingScanner = false
    @State private var showingResults = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Image(systemName: "car.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.blue)
                    
                    Text("VIN Parts Scanner")
                        .font(.title)
                        .fontWeight(.bold)
                    
                    Text("Enter or scan a VIN to find parts")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 40)
                
                // VIN Input Field
                VStack(alignment: .leading, spacing: 8) {
                    Text("Vehicle Identification Number")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack {
                        TextField("Enter VIN", text: $viewModel.vinInput)
                            .textInputAutocapitalization(.characters)
                            .autocorrectionDisabled()
                            .font(.system(.body, design: .monospaced))
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(10)
                        
                        Button(action: {
                            showingScanner = true
                        }) {
                            Image(systemName: "camera.fill")
                                .font(.title2)
                                .foregroundColor(.white)
                                .padding()
                                .background(Color.blue)
                                .cornerRadius(10)
                        }
                    }
                    
                    if let error = viewModel.validationError {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                    
                    Text("17 characters • No I, O, or Q")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal)
                
                // Scan Button
                Button(action: {
                    Task {
                        await viewModel.scanVIN(
                            threshold: settingsManager.priceThreshold,
                            state: settingsManager.partState
                        )
                        if viewModel.scanResult != nil {
                            showingResults = true
                        }
                    }
                }) {
                    HStack {
                        if viewModel.isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        } else {
                            Image(systemName: "magnifyingglass")
                        }
                        Text("Find Parts")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(viewModel.isValidVIN ? Color.blue : Color.gray)
                    .cornerRadius(12)
                }
                .disabled(!viewModel.isValidVIN || viewModel.isLoading)
                .padding(.horizontal)
                
                // Error Display
                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding(.horizontal)
                }
                
                Spacer()
                
                // Quick Settings Preview
                VStack(spacing: 8) {
                    Text("Current Settings")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack(spacing: 16) {
                        Label("£\(Int(settingsManager.priceThreshold))", systemImage: "sterlingsign.circle")
                        Label(settingsManager.partState.capitalized, systemImage: "shippingbox")
                    }
                    .font(.caption)
                    .foregroundColor(.secondary)
                }
                .padding(.bottom, 20)
            }
            .navigationTitle("Scan VIN")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showingScanner) {
                VINScannerView(scannedVIN: $viewModel.vinInput)
            }
            .navigationDestination(isPresented: $showingResults) {
                if let result = viewModel.scanResult {
                    ResultsView(scanResult: result)
                }
            }
        }
    }
}

#Preview {
    VINInputView()
        .environmentObject(SettingsManager())
        .environmentObject(AuthManager())
}
