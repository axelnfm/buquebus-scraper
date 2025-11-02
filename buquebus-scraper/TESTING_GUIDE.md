# Buquebus Scraper - Testing Guide

## ✅ Build Status

The project has been successfully built and is ready for testing!

## 🧪 Testing Options

### Option 1: Local Testing (Recommended for Development)

**Note:** Since you requested not to start servers, you'll need to run this manually when ready.

```bash
cd /vercel/sandbox/buquebus-scraper
npm run dev
```

Then access:
- **Web UI**: http://localhost:3000
- **API Test Endpoint**: http://localhost:3000/api/test
- **API Scrape Endpoint**: http://localhost:3000/api/scrape

### Option 2: Production Build Testing

The project is already built! To test the production build:

```bash
cd /vercel/sandbox/buquebus-scraper
npm start
```

Then access the same URLs as above.

### Option 3: Deploy to Cloud Platform

The project is configured for multiple deployment platforms:

#### **Vercel** (Easiest - Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /vercel/sandbox/buquebus-scraper
vercel
```

#### **Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd /vercel/sandbox/buquebus-scraper
netlify deploy --prod
```

#### **Railway**
- Push to GitHub
- Connect repository at https://railway.app
- Railway will auto-detect and deploy

#### **Render**
- Push to GitHub
- Connect repository at https://render.com
- Render will use the `render.yaml` configuration

## 🔍 API Testing Methods

### Method 1: Web Browser UI

1. Start the server (see options above)
2. Open http://localhost:3000 in your browser
3. Fill in the form:
   - **Origin**: Montevideo
   - **Destination**: Buenos Aires
   - **Departure Date**: Select a future date
   - **Return Date**: Select a date after departure
   - **Vehicle**: Passenger Only or With Car
   - **Format**: JSON or CSV
4. Click "Get Prices"
5. Wait 10-30 seconds for results

### Method 2: cURL Commands

#### Test Health Check
```bash
curl http://localhost:3000/api/test
```

#### Test Scraping (Basic)
```bash
curl "http://localhost:3000/api/scrape?origin=Montevideo&destination=Buenos%20Aires&date=2025-11-10&returnDate=2025-11-15&vehicle=none&format=json"
```

#### Test Scraping with Vehicle
```bash
curl "http://localhost:3000/api/scrape?origin=Buenos%20Aires&destination=Montevideo&date=2025-11-12&returnDate=2025-11-18&vehicle=car&format=json"
```

#### Test CSV Export
```bash
curl "http://localhost:3000/api/scrape?origin=Montevideo&destination=Buenos%20Aires&date=2025-11-10&returnDate=2025-11-15&format=csv" -o prices.csv
```

### Method 3: Postman

See the detailed [POSTMAN_TESTING.md](./POSTMAN_TESTING.md) file for:
- Complete Postman collection setup
- Sample requests
- Expected responses
- Error case testing

### Method 4: JavaScript/Node.js

```javascript
// test-api.js
const fetch = require('node-fetch');

async function testScraper() {
  const params = new URLSearchParams({
    origin: 'Montevideo',
    destination: 'Buenos Aires',
    date: '2025-11-10',
    returnDate: '2025-11-15',
    vehicle: 'none',
    format: 'json'
  });

  const response = await fetch(`http://localhost:3000/api/scrape?${params}`);
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

testScraper();
```

## 📋 Test Checklist

### Basic Functionality
- [ ] Health check endpoint (`/api/test`) returns 200
- [ ] Web UI loads successfully
- [ ] Form validation works (dates, required fields)
- [ ] Scraping returns results for valid routes
- [ ] JSON format returns proper structure
- [ ] CSV format downloads file

### Route Testing
- [ ] Montevideo → Buenos Aires
- [ ] Buenos Aires → Montevideo
- [ ] Colonia → Buenos Aires
- [ ] Buenos Aires → Colonia

### Vehicle Options
- [ ] Passenger only (vehicle=none)
- [ ] With car (vehicle=car)

### Date Validation
- [ ] Rejects past dates
- [ ] Rejects dates > 3 months in future
- [ ] Rejects return date before departure date
- [ ] Accepts valid date ranges

### Error Handling
- [ ] Missing parameters return 400
- [ ] Invalid date format returns 400
- [ ] No results found returns 404
- [ ] Server errors return 500

## 🐛 Troubleshooting

### Issue: "Cannot find module 'puppeteer'"
**Solution**: Run `npm install` in the project directory

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Issue: Scraping takes too long or times out
**Possible causes**:
- Buquebus website is slow or down
- Network connectivity issues
- Route/dates not available on Buquebus

**Solution**: 
- Try different dates (1-2 weeks in future works best)
- Check if buquebus.com is accessible
- Try a different route combination

### Issue: "No pricing data found"
**Possible causes**:
- Selected route is not available
- Dates are not available for booking
- Buquebus website structure changed

**Solution**:
- Try Montevideo ↔ Buenos Aires (most reliable route)
- Use dates 1-4 weeks in the future
- Check buquebus.com manually to verify availability

## 📊 Expected Response Times

- **Health Check**: < 100ms
- **Scraping Request**: 10-30 seconds (browser automation)
- **CSV Download**: 10-30 seconds + download time

## 🔐 Security Notes

- This scraper is for educational/personal use only
- Respect buquebus.com's terms of service
- Don't abuse the API with excessive requests
- Consider implementing rate limiting for production use

## 📝 Sample Expected Response

```json
{
  "success": true,
  "data": [
    {
      "origin": "Montevideo",
      "destination": "Buenos Aires",
      "departureDate": "2025-11-10",
      "returnDate": "2025-11-15",
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
      "departureDate": "2025-11-10",
      "returnDate": "2025-11-15",
      "vehicleType": "none"
    },
    "scrapedAt": "2025-11-02T10:30:00.000Z",
    "resultCount": 1
  }
}
```

## 🚀 Next Steps

1. **Start the development server** (when ready):
   ```bash
   npm run dev
   ```

2. **Test the health endpoint** in your browser:
   ```
   http://localhost:3000/api/test
   ```

3. **Try the web UI**:
   ```
   http://localhost:3000
   ```

4. **Deploy to production** using one of the cloud platforms mentioned above

## 📚 Additional Resources

- [README.md](./README.md) - Project overview and features
- [POSTMAN_TESTING.md](./POSTMAN_TESTING.md) - Detailed Postman testing guide
- [DEPLOYMENT_OPTIONS.md](./DEPLOYMENT_OPTIONS.md) - Deployment configurations
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Technical implementation details
