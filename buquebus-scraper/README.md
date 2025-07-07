# Buquebus Scraper API

A lightweight web scraper built with Next.js and Puppeteer to extract real-time round-trip prices from buquebus.com.

## Features

- **Puppeteer with Stealth Plugin**: Avoids detection using puppeteer-extra-plugin-stealth
- **Serverless Ready**: Configured for Same.dev serverless environment
- **Round-Trip Pricing**: Scrapes both departure and return trip pricing
- **Date Validation**: Only accepts dates from today up to 3 months in the future
- **Multiple Formats**: Returns JSON data or downloadable CSV
- **Vehicle Options**: Supports car transport or passenger-only bookings
- **Error Handling**: Comprehensive validation and error responses
- **Postman Ready**: Easy testing with GET requests and query parameters

## API Endpoints

### Health Check
```
GET /api/test
```
Returns API status and usage information.

### Scrape Endpoint
```
GET /api/scrape
```
Scrapes buquebus.com for pricing data.

**Required Parameters:**
- `origin`: Origin city (e.g., "Montevideo")
- `destination`: Destination city (e.g., "Buenos Aires")
- `date`: Departure date in YYYY-MM-DD format
- `returnDate`: Return date in YYYY-MM-DD format

**Optional Parameters:**
- `vehicle`: Vehicle type - "car" or "none" (default: "none")
- `format`: Response format - "json" or "csv" (default: "json")

## Quick Start

### Installation
```bash
cd buquebus-scraper
bun install
```

### Development
```bash
bun run dev
```

### Example Request
```bash
curl "http://localhost:3000/api/scrape?origin=Montevideo&destination=Buenos Aires&date=2025-02-15&returnDate=2025-02-20&vehicle=none&format=json"
```

## Response Format

### JSON Response
```json
{
  "success": true,
  "data": [
    {
      "origin": "Montevideo",
      "destination": "Buenos Aires",
      "departureDate": "2025-02-15",
      "returnDate": "2025-02-20",
      "vehicleType": "none",
      "basePrice": "150.00",
      "taxes": "25.00",
      "totalPrice": "175.00",
      "departureTime": "08:00",
      "returnTime": "To be determined",
      "optionIndex": 1
    }
  ],
  "meta": {
    "searchCriteria": {...},
    "scrapedAt": "2025-01-07T10:30:00.000Z",
    "resultCount": 1
  }
}
```

### CSV Export
Add `format=csv` to get downloadable CSV with the same data structure.

## Testing with Postman

See [POSTMAN_TESTING.md](./POSTMAN_TESTING.md) for comprehensive testing guide including:
- Sample requests
- Expected responses
- Error cases
- Troubleshooting tips

## Configuration

### Next.js Config
- Disabled Turbopack for compatibility
- Added `serverExternalPackages` for Puppeteer
- Configured for serverless deployment

### Puppeteer Config
- Stealth plugin enabled
- Headless mode with sandbox disabled
- Optimized for serverless environments

## Date Constraints

- **From Today**: Only accepts dates from today onwards
- **3 Month Limit**: Maximum 3 months from today
- **Return After Departure**: Return date must be after departure date
- **Format**: YYYY-MM-DD (ISO date format)

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success with data
- `400`: Bad request (validation errors)
- `404`: No pricing data found
- `405`: Method not allowed (non-GET requests)
- `500`: Internal server error

## Performance Notes

- Each scraping request takes 10-30 seconds
- Uses browser automation for accurate data extraction
- Implements proper cleanup of browser resources
- No built-in rate limiting (add as needed)

## Dependencies

- **next**: Next.js framework
- **puppeteer**: Browser automation
- **puppeteer-extra**: Plugin system for Puppeteer
- **puppeteer-extra-plugin-stealth**: Stealth mode plugin
- **csv-writer**: CSV file generation

## Deployment

Configured for serverless deployment on platforms like:
- Netlify Functions
- Vercel Functions
- AWS Lambda
- Same.dev (primary target)

## License

This project is for educational and personal use only. Please respect buquebus.com's terms of service and robots.txt when using this scraper.
