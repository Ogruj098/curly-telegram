# VIN Parts Backend

Backend service for the VIN Parts Scanner iOS application. Provides API endpoints for VIN scanning, parts lookup, eBay integration, and inventory management.

## Features

- **VIN Scanning**: Validate and decode VINs, retrieve parts lists
- **eBay Integration**: Search eBay for parts, get pricing data
- **Inventory Management**: Track local inventory, import/export CSV
- **Recommendation Engine**: Intelligent TAKE/DONT_TAKE/CHECK recommendations
- **Caching**: Configurable caching for eBay results (12-24 hours)
- **Authentication**: JWT-based authentication

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for JWT tokens
- `EBAY_CLIENT_ID`: Your eBay Developer client ID
- `EBAY_CLIENT_SECRET`: Your eBay Developer client secret
- `CACHE_TTL_SECONDS`: Cache duration (default: 43200 = 12 hours)

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/ebay/callback` | eBay OAuth callback |

### Scanning

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/scan` | Scan VIN and get parts with recommendations |

**Request Body:**
```json
{
  "vin": "WBA1234567ABCDE89",
  "threshold_gbp": 40,
  "state": "used"
}
```

**Response:**
```json
{
  "vin": "WBA1234567ABCDE89",
  "timestamp": "2024-01-15T10:30:00Z",
  "settings": { "threshold_gbp": 40, "state": "used" },
  "summary": {
    "total": 15,
    "takeCount": 8,
    "dontTakeCount": 5,
    "checkCount": 2,
    "estimatedValue": "450.00"
  },
  "parts": [
    {
      "oem": "34116771868",
      "description": "Brake disc, front",
      "ourQty": 0,
      "ebayCount": 5,
      "ebayAvgPriceGbp": 55.2,
      "recommendation": "TAKE",
      "matchConfidence": 0.98
    }
  ]
}
```

### Parts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/parts/:oem` | Get detailed part information |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/inventory` | List all inventory items (auth required) |
| POST | `/api/v1/inventory/upload` | Upload CSV inventory (auth required) |
| GET | `/api/v1/inventory/export` | Export inventory as CSV (auth required) |
| GET | `/api/v1/inventory/:oem` | Get item by OEM (auth required) |
| PUT | `/api/v1/inventory/:oem` | Update item quantity (auth required) |

**CSV Format:**
```csv
sku,oem,quantity,location
SKU001,34116771868,2,Shelf A1
SKU002,34116855781,5,Shelf A2
```

### History

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/history` | Get scan history |
| GET | `/api/v1/history/:id` | Get specific scan result |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid VIN or parameters |
| 401 | Not authenticated |
| 404 | Resource not found |
| 429 | Rate limit exceeded (eBay) |
| 500 | Internal server error |

## Recommendation Logic

Parts are recommended based on:

1. **TAKE**: `our_qty == 0` AND `ebay_avg_price >= threshold` AND `match_confidence >= 0.8`
2. **DONT_TAKE**: `our_qty > 0` OR `ebay_avg_price < threshold`
3. **CHECK**: `match_confidence < 0.8` OR no eBay data available

## Testing

```bash
npm test
```

## Linting

```bash
npm run lint
```

## Architecture

```
backend/
├── src/
│   ├── index.js           # Main entry point
│   ├── routes/            # API route handlers
│   │   ├── auth.js
│   │   ├── scan.js
│   │   ├── parts.js
│   │   ├── inventory.js
│   │   └── history.js
│   ├── services/          # Business logic
│   │   ├── ebayService.js
│   │   ├── partsService.js
│   │   ├── inventoryService.js
│   │   ├── recommendationService.js
│   │   └── cacheService.js
│   ├── middleware/        # Express middleware
│   │   └── auth.js
│   └── utils/             # Utilities
│       ├── logger.js
│       └── vinValidator.js
├── package.json
├── .env.example
└── README.md
```

## License

MIT
