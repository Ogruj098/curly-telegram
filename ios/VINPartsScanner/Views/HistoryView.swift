//
//  HistoryView.swift
//  VINPartsScanner
//
//  Displays scan history
//

import SwiftUI

struct HistoryView: View {
    @StateObject private var viewModel = HistoryViewModel()
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading history...")
                } else if viewModel.history.isEmpty {
                    EmptyHistoryView()
                } else {
                    List {
                        ForEach(viewModel.history) { scan in
                            NavigationLink(destination: HistoryDetailView(scanId: scan.id)) {
                                HistoryRowView(scan: scan)
                            }
                        }
                    }
                    .listStyle(.plain)
                    .refreshable {
                        await viewModel.loadHistory()
                    }
                }
            }
            .navigationTitle("History")
            .task {
                await viewModel.loadHistory()
            }
        }
    }
}

// MARK: - Empty History View

struct EmptyHistoryView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "clock")
                .font(.system(size: 60))
                .foregroundColor(.secondary)
            
            Text("No Scan History")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Your VIN scan history will appear here")
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - History Row View

struct HistoryRowView: View {
    let scan: ScanHistoryItem
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(scan.vin)
                    .font(.system(.body, design: .monospaced))
                    .fontWeight(.medium)
                
                Spacer()
                
                Text(scan.formattedDate)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            HStack(spacing: 16) {
                Label("\(scan.summary.takeCount) Take", systemImage: "checkmark.circle")
                    .foregroundColor(.green)
                
                Label("\(scan.summary.checkCount) Check", systemImage: "exclamationmark.circle")
                    .foregroundColor(.yellow)
                
                Label("\(scan.summary.dontTakeCount) Skip", systemImage: "xmark.circle")
                    .foregroundColor(.gray)
            }
            .font(.caption)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - History Detail View

struct HistoryDetailView: View {
    let scanId: String
    @StateObject private var viewModel = HistoryDetailViewModel()
    
    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else if let result = viewModel.scanResult {
                ResultsView(scanResult: result)
            } else {
                Text("Failed to load scan details")
                    .foregroundColor(.secondary)
            }
        }
        .task {
            await viewModel.loadScan(id: scanId)
        }
    }
}

// MARK: - History ViewModel

@MainActor
class HistoryViewModel: ObservableObject {
    @Published var history: [ScanHistoryItem] = []
    @Published var isLoading = false
    
    func loadHistory() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            history = try await APIService.shared.getHistory()
        } catch {
            print("Failed to load history: \(error)")
        }
    }
}

// MARK: - History Detail ViewModel

@MainActor
class HistoryDetailViewModel: ObservableObject {
    @Published var scanResult: ScanResult?
    @Published var isLoading = false
    
    func loadScan(id: String) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            scanResult = try await APIService.shared.getScanById(id: id)
        } catch {
            print("Failed to load scan: \(error)")
        }
    }
}

#Preview {
    HistoryView()
}
