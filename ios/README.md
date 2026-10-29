# VIN Parts Scanner iOS App

iOS application for scanning Vehicle Identification Numbers (VIN) and finding OEM parts with eBay pricing and inventory matching.

## Features

- **VIN Input**: Enter VIN manually or scan using camera
- **Camera Scanning**: Real-time VIN recognition using Vision framework
- **Parts Lookup**: Get OEM parts list for any vehicle
- **eBay Integration**: View average prices and listing counts
- **Inventory Matching**: Compare with your local inventory
- **Recommendations**: Smart TAKE/CHECK/DON'T TAKE recommendations
- **History**: View previous scan results
- **Settings**: Configure price threshold, part condition, and server URL

## Requirements

- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+

## Project Structure

```
VINPartsScanner/
├── VINPartsScannerApp.swift      # App entry point
├── Models/
│   ├── Part.swift                # Part model with recommendation
│   └── ScanResult.swift          # Scan result model
├── Views/
│   ├── ContentView.swift         # Main tab navigation
│   ├── VINInputView.swift        # VIN entry screen
│   ├── VINScannerView.swift      # Camera scanner screen
│   ├── ResultsView.swift         # Scan results list
│   ├── PartDetailView.swift      # Individual part details
│   ├── HistoryView.swift         # Scan history
│   └── SettingsView.swift        # App settings
├── ViewModels/
│   └── VINInputViewModel.swift   # VIN input logic
├── Services/
│   ├── APIService.swift          # Backend API client
│   ├── SettingsManager.swift     # Settings persistence
│   └── AuthManager.swift         # Authentication handling
└── Utilities/
    └── VINValidator.swift        # VIN validation logic
```

## Setup

### 1. Open in Xcode

Open the project in Xcode 15 or later.

### 2. Configure Backend URL

Update the default server URL in `SettingsManager.swift` or configure it in the Settings screen at runtime.

### 3. Build and Run

1. Select your target device/simulator
2. Build and run (⌘R)

## Usage

### Scanning a VIN

1. Open the app and go to the "Scan" tab
2. Either:
   - Type the 17-character VIN manually, or
   - Tap the camera button to scan with your device camera
3. Tap "Find Parts" to search

### Understanding Results

Parts are color-coded by recommendation:

- 🟢 **TAKE**: Part is not in your inventory and has good eBay value
- 🟡 **CHECK**: Low confidence match or missing data - verify manually
- ⚪ **DON'T TAKE**: Already in inventory or below price threshold

### Adjusting Settings

1. Go to the Settings tab
2. Adjust:
   - **Price Threshold**: Minimum eBay average price (default £40)
   - **Part Condition**: Filter for new or used parts
   - **Cache Duration**: How long to cache eBay results
   - **Server URL**: Backend API endpoint

## API Integration

The app communicates with the VIN Parts Backend via REST API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/scan` | POST | Scan VIN and get parts |
| `/api/v1/parts/:oem` | GET | Get part details |
| `/api/v1/history` | GET | Get scan history |
| `/api/auth/login` | POST | Authenticate user |

## Recommendation Logic

Parts are recommended based on:

```
IF match_confidence < 0.8 → CHECK
ELSE IF ebay_data_missing → CHECK
ELSE IF our_qty > 0 → DON'T TAKE
ELSE IF ebay_avg_price < threshold → DON'T TAKE
ELSE → TAKE
```

## Privacy

- Camera access is required for VIN scanning
- VIN data is sent to the backend for processing
- Scan history is stored locally and optionally synced

## License

MIT
