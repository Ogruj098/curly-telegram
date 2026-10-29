//
//  PartDetailView.swift
//  VINPartsScanner
//
//  Detailed view for a single part
//

import SwiftUI

struct PartDetailView: View {
    let part: Part
    @Environment(\.dismiss) var dismiss
    @State private var isMarkedAsTaken: Bool = false
    
    var recommendationColor: Color {
        switch part.recommendation {
        case .take: return .green
        case .check: return .yellow
        case .dontTake: return .gray
        }
    }
    
    var recommendationText: String {
        switch part.recommendation {
        case .take: return "TAKE"
        case .check: return "CHECK"
        case .dontTake: return "DON'T TAKE"
        }
    }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Part Image Placeholder
                    if let imageUrl = part.imageUrl {
                        AsyncImage(url: URL(string: imageUrl)) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                        } placeholder: {
                            PartImagePlaceholder()
                        }
                        .frame(height: 200)
                    } else {
                        PartImagePlaceholder()
                    }
                    
                    // Recommendation Badge
                    Text(recommendationText)
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(recommendationColor)
                        .cornerRadius(20)
                    
                    // Part Details Card
                    VStack(alignment: .leading, spacing: 16) {
                        // OEM Number
                        DetailRow(label: "OEM Number", value: part.oem)
                        
                        Divider()
                        
                        // Description
                        DetailRow(label: "Description", value: part.description)
                        
                        if let category = part.category {
                            Divider()
                            DetailRow(label: "Category", value: category)
                        }
                        
                        Divider()
                        
                        // Confidence
                        HStack {
                            Text("Match Confidence")
                                .foregroundColor(.secondary)
                            Spacer()
                            Text("\(Int(part.matchConfidence * 100))%")
                                .fontWeight(.medium)
                            ConfidenceIndicator(confidence: part.matchConfidence)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(color: .black.opacity(0.05), radius: 5)
                    .padding(.horizontal)
                    
                    // Inventory & eBay Stats
                    HStack(spacing: 16) {
                        StatCard(
                            title: "Our Stock",
                            value: "\(part.ourQty)",
                            icon: "shippingbox",
                            color: part.ourQty > 0 ? .green : .red
                        )
                        
                        StatCard(
                            title: "eBay Listings",
                            value: "\(part.ebayCount)",
                            icon: "cart",
                            color: .blue
                        )
                    }
                    .padding(.horizontal)
                    
                    // eBay Pricing
                    if let avgPrice = part.ebayAvgPriceGbp {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("eBay Pricing")
                                .font(.headline)
                            
                            HStack(spacing: 20) {
                                PriceBox(label: "Average", price: avgPrice)
                                
                                if let minPrice = part.ebayMinPrice {
                                    PriceBox(label: "Min", price: minPrice)
                                }
                                
                                if let maxPrice = part.ebayMaxPrice {
                                    PriceBox(label: "Max", price: maxPrice)
                                }
                            }
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                        .shadow(color: .black.opacity(0.05), radius: 5)
                        .padding(.horizontal)
                    }
                    
                    // Reason
                    if let reason = part.recommendationReason {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Reason")
                                .font(.headline)
                            
                            Text(reason)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                        .padding(.horizontal)
                    }
                    
                    // Action Button
                    if part.recommendation == .take {
                        Button(action: {
                            isMarkedAsTaken.toggle()
                        }) {
                            HStack {
                                Image(systemName: isMarkedAsTaken ? "checkmark.circle.fill" : "plus.circle")
                                Text(isMarkedAsTaken ? "Marked as Taken" : "Mark as Taken")
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(isMarkedAsTaken ? Color.gray : Color.green)
                            .cornerRadius(12)
                        }
                        .padding(.horizontal)
                    }
                    
                    Spacer(minLength: 20)
                }
            }
            .background(Color(.systemGray6))
            .navigationTitle("Part Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Supporting Views

struct PartImagePlaceholder: View {
    var body: some View {
        VStack {
            Image(systemName: "photo")
                .font(.system(size: 40))
                .foregroundColor(.secondary)
            Text("No Image")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(height: 200)
        .frame(maxWidth: .infinity)
        .background(Color(.systemGray5))
    }
}

struct DetailRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack(alignment: .top) {
            Text(label)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
                .multilineTextAlignment(.trailing)
        }
    }
}

struct ConfidenceIndicator: View {
    let confidence: Double
    
    var color: Color {
        if confidence >= 0.8 { return .green }
        if confidence >= 0.6 { return .yellow }
        return .red
    }
    
    var body: some View {
        Circle()
            .fill(color)
            .frame(width: 12, height: 12)
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(value)
                .font(.title)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5)
    }
}

struct PriceBox: View {
    let label: String
    let price: Double
    
    var body: some View {
        VStack(spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text("£\(String(format: "%.2f", price))")
                .font(.headline)
        }
    }
}

#Preview {
    PartDetailView(part: Part.preview)
}
