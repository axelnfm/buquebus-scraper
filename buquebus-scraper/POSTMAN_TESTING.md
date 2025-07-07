# Buquebus Scraper - Postman Testing Guide

## API Endpoints

### Base URL
```
http://localhost:3000 (local development)
https://your-deployed-url.com (production)
```

### Available Endpoints

#### 1. Test Endpoint
- **URL**: `/api/test`
- **Method**: GET
- **Purpose**: Verify API is working and get usage information

#### 2. Scrape Endpoint
- **URL**: `/api/scrape`
- **Method**: GET
- **Purpose**: Scrape buquebus.com for round-trip pricing data

## Postman Test Cases

### Test Case 1: API Health Check
```
GET /api/test
```
**Expected Response**: 200 OK with API information

### Test Case 2: Basic Round-Trip Search
```
GET /api/scrape?origin=Montevideo&destination=Buenos Aires&date=2025-02-15&returnDate=2025-02-20
```

### Test Case 3: Round-Trip with Vehicle
```
GET /api/scrape?origin=Buenos Aires&destination=Montevideo&date=2025-03-01&returnDate=2025-03-07&vehicle=car
```

### Test Case 4: CSV Export
```
GET /api/scrape?origin=Montevideo&destination=Buenos Aires&date=2025-02-15&returnDate=2025-02-20&format=csv
```

### Test Case 5: Error Cases

#### Missing Parameters
```
GET /api/scrape?origin=Montevideo&destination=Buenos Aires
```
**Expected**: 400 Bad Request

#### Invalid Date Format
```
GET /api/scrape?origin=Montevideo&destination=Buenos Aires&date=invalid&returnDate=2025-02-20
```
**Expected**: 400 Bad Request

#### Past Date
```
GET /api/scrape?origin=Montevideo&destination=Buenos Aires&date=2024-01-01&returnDate=2024-01-05
```
**Expected**: 400 Bad Request

#### Date Too Far in Future
```
GET /api/scrape?origin=Montevideo&destination=Buenos Aires&date=2025-12-01&returnDate=2025-12-05
```
**Expected**: 400 Bad Request

## Expected Response Formats

### JSON Response (Success)
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
    "searchCriteria": {
      "origin": "Montevideo",
      "destination": "Buenos Aires",
      "departureDate": "2025-02-15",
      "returnDate": "2025-02-20",
      "vehicleType": "none"
    },
    "scrapedAt": "2025-01-07T10:30:00.000Z",
    "resultCount": 1
  }
}
```

### CSV Response
When `format=csv` is specified, the response will be a downloadable CSV file with headers:
- Origin
- Destination
- Departure Date
- Return Date
- Vehicle Type
- Base Price
- Taxes
- Total Price
- Departure Time
- Return Time

### Error Response
```json
{
  "error": "Missing required parameters",
  "required": ["origin", "destination", "date", "returnDate"],
  "received": {
    "origin": "Montevideo",
    "destination": "Buenos Aires"
  }
}
```

## Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| origin | string | Yes | Origin city | Montevideo |
| destination | string | Yes | Destination city | Buenos Aires |
| date | string | Yes | Departure date (YYYY-MM-DD) | 2025-02-15 |
| returnDate | string | Yes | Return date (YYYY-MM-DD) | 2025-02-20 |
| vehicle | string | No | Vehicle type: 'car' or 'none' | car |
| format | string | No | Response format: 'json' or 'csv' | json |

## Date Constraints
- Dates must be from today onwards
- Dates must be within 3 months from today
- Return date must be after departure date
- Format: YYYY-MM-DD

## Rate Limiting & Performance
- Each request may take 10-30 seconds due to web scraping
- No built-in rate limiting (add as needed)
- Recommended to test with recent dates for better success rate

## Troubleshooting

### Common Issues
1. **Timeout errors**: Buquebus site may be slow or unavailable
2. **No data found**: Route or dates may not be available
3. **Stealth detection**: Very rare with current configuration

### Success Tips
1. Use realistic route combinations (Montevideo ↔ Buenos Aires)
2. Use dates 1-4 weeks in the future
3. Test during business hours (Uruguay/Argentina timezone)
4. Allow 30+ seconds for scraping to complete
