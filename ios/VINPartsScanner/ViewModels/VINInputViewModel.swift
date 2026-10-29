//
//  VINInputViewModel.swift
//  VINPartsScanner
//
//  ViewModel for VIN input screen
//

import Foundation
import Combine

@MainActor
class VINInputViewModel: ObservableObject {
    @Published var vinInput: String = "" {
        didSet {
            validateVIN()
        }
    }
    @Published var isValidVIN: Bool = false
    @Published var validationError: String?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var scanResult: ScanResult?
    
    private func validateVIN() {
        let cleaned = vinInput.uppercased().trimmingCharacters(in: .whitespaces)
        
        // Reset validation state
        validationError = nil
        isValidVIN = false
        
        // Empty is not valid but not an error
        if cleaned.isEmpty {
            return
        }
        
        // Check length
        if cleaned.count != 17 {
            if cleaned.count > 17 {
                validationError = "VIN must be exactly 17 characters"
            }
            return
        }
        
        // Check for invalid characters
        if cleaned.contains(where: { "IOQ".contains($0) }) {
            validationError = "VIN cannot contain letters I, O, or Q"
            return
        }
        
        // Check alphanumeric only
        if !cleaned.allSatisfy({ $0.isLetter || $0.isNumber }) {
            validationError = "VIN can only contain letters and numbers"
            return
        }
        
        // Valid VIN
        isValidVIN = true
    }
    
    func scanVIN(threshold: Double, state: String) async {
        guard isValidVIN else { return }
        
        isLoading = true
        errorMessage = nil
        scanResult = nil
        
        defer { isLoading = false }
        
        do {
            let result = try await APIService.shared.scanVIN(
                vin: vinInput.uppercased(),
                thresholdGbp: threshold,
                state: state
            )
            scanResult = result
        } catch APIError.invalidResponse(let message) {
            errorMessage = message
        } catch APIError.serverError(let code, let message) {
            errorMessage = "Server error (\(code)): \(message)"
        } catch {
            errorMessage = "Failed to scan VIN: \(error.localizedDescription)"
        }
    }
}
