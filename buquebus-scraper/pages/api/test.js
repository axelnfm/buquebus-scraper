export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    message: 'Buquebus Scraper API is working!',
    endpoints: {
      scrape: '/api/scrape',
      test: '/api/test'
    },
    usage: {
      method: 'GET',
      endpoint: '/api/scrape',
      parameters: {
        origin: 'Origin city (required)',
        destination: 'Destination city (required)',
        date: 'Departure date YYYY-MM-DD (required)',
        returnDate: 'Return date YYYY-MM-DD (required)',
        vehicle: 'car or none (optional, default: none)',
        format: 'json or csv (optional, default: json)'
      },
      example: '/api/scrape?origin=Montevideo&destination=Buenos Aires&date=2025-02-01&returnDate=2025-02-05&vehicle=none&format=json'
    },
    timestamp: new Date().toISOString()
  });
}
