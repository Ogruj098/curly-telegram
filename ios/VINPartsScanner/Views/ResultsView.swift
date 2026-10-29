//
//  ResultsView.swift
//  VINPartsScanner
//
//  Displays scan results with parts list and recommendations
//

import SwiftUI

struct ResultsView: View {
    let scanResult: ScanResult
    @State private var selectedFilter: RecommendationFilter = .all
    @State private var selectedPart: Part?
    
    enum RecommendationFilter: String, CaseIterable {
        case all = "All"
        case take = "Take"
        case check = "Check"
        case dontTake = "Don't Take"
    }
    
    var filteredParts: [Part] {
        switch selectedFilter {
        case .all:
            return scanResult.parts
        case .take:
            return scanResult.parts.filter { $0.recommendation == .take }
        case .check:
            return scanResult.parts.filter { $0.recommendation == .check }
        case .dontTake:
            return scanResult.parts.filter { $0.recommendation == .dontTake }
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Summary Header
            VStack(spacing: 12) {
                HStack {
                    Text("VIN:")
                        .foregroundColor(.secondary)
                    Text(scanResult.vin)
                        .font(.system(.body, design: .monospaced))
                        .fontWeight(.medium)
                }
                
                HStack(spacing: 20) {
                    SummaryBadge(
                        count: scanResult.summary.takeCount,
                        label: "Take",
                        color: .green
                    )
                    SummaryBadge(
                        count: scanResult.summary.checkCount,
                        label: "Check",
                        color: .yellow
                    )
                    SummaryBadge(
                        count: scanResult.summary.dontTakeCount,
                        label: "Skip",
                        color: .gray
                    )
                }
                
                if let value = scanResult.summary.estimatedValue {
                    Text("Estimated Value: £\(value)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            
            // Filter Pills
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(RecommendationFilter.allCases, id: \.self) { filter in
                        FilterPill(
                            title: filter.rawValue,
                            isSelected: selectedFilter == filter
                        ) {
                            selectedFilter = filter
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical, 8)
            .background(Color(.systemGray6))
            
            // Parts List
            List {
                ForEach(filteredParts) { part in
                    PartRowView(part: part)
                        .onTapGesture {
                            selectedPart = part
                        }
                }
            }
            .listStyle(.plain)
        }
        .navigationTitle("Results")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(item: $selectedPart) { part in
            PartDetailView(part: part)
        }
    }
}

// MARK: - Summary Badge

struct SummaryBadge: View {
    let count: Int
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Text("\(count)")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(color)
            
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(minWidth: 60)
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .background(color.opacity(0.1))
        .cornerRadius(8)
    }
}

// MARK: - Filter Pill

struct FilterPill: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .foregroundColor(isSelected ? .white : .primary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.blue : Color(.systemBackground))
                .cornerRadius(20)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.gray.opacity(0.3), lineWidth: isSelected ? 0 : 1)
                )
        }
    }
}

// MARK: - Part Row View

struct PartRowView: View {
    let part: Part
    
    var recommendationColor: Color {
        switch part.recommendation {
        case .take: return .green
        case .check: return .yellow
        case .dontTake: return .gray
        }
    }
    
    var body: some View {
        HStack(spacing: 12) {
            // Recommendation Indicator
            Circle()
                .fill(recommendationColor)
                .frame(width: 12, height: 12)
            
            // Part Info
            VStack(alignment: .leading, spacing: 4) {
                Text(part.oem)
                    .font(.system(.body, design: .monospaced))
                    .fontWeight(.medium)
                
                Text(part.description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }
            
            Spacer()
            
            // Stats
            VStack(alignment: .trailing, spacing: 4) {
                if let price = part.ebayAvgPriceGbp {
                    Text("£\(String(format: "%.0f", price))")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                }
                
                HStack(spacing: 4) {
                    Text("Stock: \(part.ourQty)")
                        .font(.caption)
                        .foregroundColor(part.ourQty > 0 ? .green : .red)
                    
                    Text("eBay: \(part.ebayCount)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Image(systemName: "chevron.right")
                .foregroundColor(.secondary)
                .font(.caption)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    NavigationStack {
        ResultsView(scanResult: ScanResult.preview)
    }
}
