//
//  DateUtils.swift
//  VINPartsScanner
//
//  Utility functions for date parsing and formatting
//

import Foundation

/// Utility for parsing ISO 8601 date strings from the API
enum DateUtils {
    
    /// Parses an ISO 8601 date string
    /// Supports both fractional seconds and standard format
    /// - Parameter string: The ISO 8601 date string to parse
    /// - Returns: The parsed Date, or current date if parsing fails
    static func parseISO8601(_ string: String) -> Date {
        let formatter = ISO8601DateFormatter()
        
        // Try with fractional seconds first
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: string) {
            return date
        }
        
        // Fall back to standard format
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: string) ?? Date()
    }
    
    /// Formats a date for display
    /// - Parameter date: The date to format
    /// - Returns: A formatted string (short date and time)
    static func formatForDisplay(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}
