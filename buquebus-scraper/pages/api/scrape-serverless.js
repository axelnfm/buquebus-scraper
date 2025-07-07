import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { createObjectCsvWriter } from 'csv-writer';
import { promises as fs } from 'fs';
import chromium from '@sparticuz/chromium';

puppeteer.use(StealthPlugin());

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { origin, destination, date, returnDate, vehicle = 'none', format = 'json' } = req.query;

    // Validate required parameters
    if (!origin || !destination || !date || !returnDate) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['origin', 'destination', 'date', 'returnDate'],
        received: { origin, destination, date, returnDate, vehicle }
      });
    }

    // Validate date format and range
    const departureDate = new Date(date);
    const returnDateTime = new Date(returnDate);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    if (isNaN(departureDate.getTime()) || isNaN(returnDateTime.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    if (departureDate < today || returnDateTime < today) {
      return res.status(400).json({ error: 'Dates must be from today onwards' });
    }

    if (departureDate > threeMonthsFromNow || returnDateTime > threeMonthsFromNow) {
      return res.status(400).json({ error: 'Dates must be within 3 months from today' });
    }

    if (returnDateTime <= departureDate) {
      return res.status(400).json({ error: 'Return date must be after departure date' });
    }

    // Determine if we're in serverless environment
    const isServerless = process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME;

    let browser;

    if (isServerless) {
      // Use optimized Chrome for serverless environments
      browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      // Use regular Puppeteer for local/traditional server environments
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }

    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    try {
      // Navigate to Buquebus website
      await page.goto('https://www.buquebus.com/BQBWebV2/web/CompraPasajes', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for the form to load
      await page.waitForSelector('form', { timeout: 10000 });

      // Fill in the search form
      await fillSearchForm(page, {
        origin,
        destination,
        departureDate: formatDateForSite(departureDate),
        returnDate: formatDateForSite(returnDateTime),
        vehicle
      });

      // Submit the search
      await page.click('button[type="submit"], input[type="submit"], .submit-btn, #submit');

      // Wait for results to load
      await page.waitForSelector('.results, .trip-options, .fare-table, table', { timeout: 30000 });

      // Extract pricing data
      const scrapedData = await extractPricingData(page, {
        origin,
        destination,
        departureDate: date,
        returnDate,
        vehicleType: vehicle
      });

      await browser.close();

      if (!scrapedData || scrapedData.length === 0) {
        return res.status(404).json({ error: 'No pricing data found for the specified criteria' });
      }

      // Handle CSV export
      if (format === 'csv') {
        const csvData = await generateCSV(scrapedData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="buquebus-prices-${date}-to-${returnDate}.csv"`);
        return res.status(200).send(csvData);
      }

      // Return JSON response
      return res.status(200).json({
        success: true,
        data: scrapedData,
        meta: {
          searchCriteria: {
            origin,
            destination,
            departureDate: date,
            returnDate,
            vehicleType: vehicle
          },
          scrapedAt: new Date().toISOString(),
          resultCount: scrapedData.length,
          environment: isServerless ? 'serverless' : 'traditional'
        }
      });

    } catch (scrapingError) {
      await browser.close();
      throw scrapingError;
    }

  } catch (error) {
    console.error('Scraping error:', error);
    return res.status(500).json({
      error: 'Scraping failed',
      message: error.message,
      timestamp: new Date().toISOString(),
      troubleshooting: {
        puppeteerDocs: 'https://pptr.dev/troubleshooting',
        suggestion: 'Try deploying to Vercel, Railway, or Render for better Puppeteer support'
      }
    });
  }
}

async function fillSearchForm(page, searchParams) {
  const { origin, destination, departureDate, returnDate, vehicle } = searchParams;

  // Fill origin
  await page.evaluate((value) => {
    const originField = document.querySelector('input[name*="origin"], input[name*="from"], select[name*="origin"], select[name*="from"]');
    if (originField) {
      if (originField.tagName === 'SELECT') {
        originField.value = value;
      } else {
        originField.value = value;
        originField.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }, origin);

  // Fill destination
  await page.evaluate((value) => {
    const destField = document.querySelector('input[name*="destination"], input[name*="to"], select[name*="destination"], select[name*="to"]');
    if (destField) {
      if (destField.tagName === 'SELECT') {
        destField.value = value;
      } else {
        destField.value = value;
        destField.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }, destination);

  // Fill departure date
  await page.evaluate((value) => {
    const dateField = document.querySelector('input[type="date"], input[name*="departure"], input[name*="salida"]');
    if (dateField) {
      dateField.value = value;
      dateField.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, departureDate);

  // Fill return date
  await page.evaluate((value) => {
    const returnField = document.querySelector('input[name*="return"], input[name*="regreso"], input[name*="vuelta"]');
    if (returnField) {
      returnField.value = value;
      returnField.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, returnDate);

  // Handle vehicle selection if provided
  if (vehicle === 'car') {
    await page.evaluate(() => {
      const vehicleCheckbox = document.querySelector('input[type="checkbox"][name*="vehicle"], input[type="checkbox"][name*="auto"], input[type="checkbox"][name*="car"]');
      if (vehicleCheckbox && !vehicleCheckbox.checked) {
        vehicleCheckbox.click();
      }
    });
  }

  // Wait a moment for form to process
  await page.waitForTimeout(1000);
}

async function extractPricingData(page, searchCriteria) {
  return await page.evaluate((criteria) => {
    const results = [];

    // Try multiple selectors for different layouts
    const priceContainers = document.querySelectorAll(
      '.price-option, .fare-option, .trip-option, tr, .price-row, .ticket-option'
    );

    priceContainers.forEach((container, index) => {
      try {
        // Extract price information
        const priceElement = container.querySelector(
          '.price, .total, .amount, .fare, [class*="price"], [class*="total"]'
        );
        const timeElement = container.querySelector(
          '.time, .schedule, .departure, [class*="time"], [class*="hora"]'
        );
        const taxElement = container.querySelector(
          '.tax, .taxes, .impuestos, [class*="tax"]'
        );

        if (priceElement) {
          const priceText = priceElement.textContent.trim();
          const timeText = timeElement ? timeElement.textContent.trim() : 'Not specified';
          const taxText = taxElement ? taxElement.textContent.trim() : '0';

          // Extract numeric values
          const totalPrice = extractNumber(priceText);
          const taxes = extractNumber(taxText);
          const basePrice = totalPrice - taxes;

          if (totalPrice > 0) {
            results.push({
              origin: criteria.origin,
              destination: criteria.destination,
              departureDate: criteria.departureDate,
              returnDate: criteria.returnDate,
              vehicleType: criteria.vehicleType,
              basePrice: basePrice.toFixed(2),
              taxes: taxes.toFixed(2),
              totalPrice: totalPrice.toFixed(2),
              departureTime: timeText,
              returnTime: 'To be determined',
              optionIndex: index + 1
            });
          }
        }
      } catch (err) {
        console.log('Error processing container:', err);
      }
    });

    // Helper function to extract numbers from text
    function extractNumber(text) {
      if (!text) return 0;
      const match = text.match(/[\d.,]+/);
      if (match) {
        return parseFloat(match[0].replace(',', '.'));
      }
      return 0;
    }

    return results;
  }, searchCriteria);
}

async function generateCSV(data) {
  const csvWriter = createObjectCsvWriter({
    path: '/tmp/buquebus-prices.csv',
    header: [
      { id: 'origin', title: 'Origin' },
      { id: 'destination', title: 'Destination' },
      { id: 'departureDate', title: 'Departure Date' },
      { id: 'returnDate', title: 'Return Date' },
      { id: 'vehicleType', title: 'Vehicle Type' },
      { id: 'basePrice', title: 'Base Price' },
      { id: 'taxes', title: 'Taxes' },
      { id: 'totalPrice', title: 'Total Price' },
      { id: 'departureTime', title: 'Departure Time' },
      { id: 'returnTime', title: 'Return Time' }
    ]
  });

  await csvWriter.writeRecords(data);
  const csvContent = await fs.readFile('/tmp/buquebus-prices.csv', 'utf8');

  // Clean up temp file
  try {
    await fs.unlink('/tmp/buquebus-prices.csv');
  } catch (err) {
    // Ignore cleanup errors
  }

  return csvContent;
}

function formatDateForSite(date) {
  return date.toISOString().split('T')[0];
}

export const config = {
  api: {
    responseLimit: '8mb',
  },
}
