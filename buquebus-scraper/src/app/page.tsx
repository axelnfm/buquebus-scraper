'use client';

import { useState, useEffect } from 'react';

interface FormData {
  origin: string;
  destination: string;
  date: string;
  returnDate: string;
  vehicle: string;
  format: string;
}

interface PriceOption {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  vehicleType: string;
  basePrice: string;
  taxes: string;
  totalPrice: string;
  departureTime: string;
  returnTime: string;
  optionIndex: number;
}

interface ApiResponse {
  success: boolean;
  data: PriceOption[];
  meta: {
    searchCriteria: FormData;
    scrapedAt: string;
    resultCount: number;
  };
  error?: string;
}

interface Results {
  success?: boolean;
  data?: PriceOption[];
  meta?: {
    searchCriteria: FormData;
    scrapedAt: string;
    resultCount: number;
  };
  error?: string;
  message?: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    origin: 'Montevideo',
    destination: 'Buenos Aires',
    date: '',
    returnDate: '',
    vehicle: 'none',
    format: 'json'
  });

  // Set default dates (tomorrow and day after)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    setFormData(prev => ({
      ...prev,
      date: tomorrow.toISOString().split('T')[0],
      returnDate: dayAfter.toISOString().split('T')[0]
    }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const params = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        params.append(key, value);
      });
      const response = await fetch(`/api/scrape?${params.toString()}`);

      if (formData.format === 'csv') {
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `buquebus-prices-${formData.date}-to-${formData.returnDate}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setResults({ message: 'CSV downloaded successfully!' });
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to download CSV');
        }
      } else {
        const data: ApiResponse = await response.json();
        if (response.ok) {
          setResults(data);
        } else {
          setError(data.error || 'An error occurred');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Network error: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buquebus Price Scraper</h1>
          <p className="text-gray-600 mb-6">Get real-time round-trip ferry prices between Uruguay and Argentina</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
                  Origin
                </label>
                <select
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Montevideo">Montevideo</option>
                  <option value="Buenos Aires">Buenos Aires</option>
                  <option value="Colonia">Colonia</option>
                </select>
              </div>

              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <select
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Buenos Aires">Buenos Aires</option>
                  <option value="Montevideo">Montevideo</option>
                  <option value="Colonia">Colonia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  id="returnDate"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleInputChange}
                  min={formData.date}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle
                </label>
                <select
                  id="vehicle"
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">Passenger Only</option>
                  <option value="car">With Car</option>
                </select>
              </div>

              <div>
                <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                  Result Format
                </label>
                <select
                  id="format"
                  name="format"
                  value={formData.format}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="json">Show Results (JSON)</option>
                  <option value="csv">Download CSV</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Scraping Prices...' : 'Get Prices'}
            </button>
          </form>

          {loading && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">This may take 10-30 seconds...</p>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {results && formData.format === 'json' && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Results</h3>
              {results.success ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-green-800">
                      Found {results.data?.length || 0} pricing option(s) for your search
                    </p>
                  </div>

                  {results.data?.map((option: PriceOption, index: number) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Route:</span>
                          <p>{option.origin} → {option.destination}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Departure:</span>
                          <p>{option.departureDate} at {option.departureTime}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Return:</span>
                          <p>{option.returnDate}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Total Price:</span>
                          <p className="text-lg font-bold text-green-600">${option.totalPrice}</p>
                          <p className="text-xs text-gray-500">
                            Base: ${option.basePrice} + Tax: ${option.taxes}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <details className="mt-4">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      View Raw JSON Response
                    </summary>
                    <pre className="mt-2 bg-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{results.error || 'No results found'}</p>
                </div>
              )}
            </div>
          )}

          {results && results.message && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800">{results.message}</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">API Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Available Endpoints:</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• <code className="bg-gray-100 px-1 rounded">/api/test</code> - Health check</li>
                <li>• <code className="bg-gray-100 px-1 rounded">/api/scrape</code> - Price scraper</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Date Constraints:</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Dates must be from today onwards</li>
                <li>• Maximum 3 months in the future</li>
                <li>• Return date must be after departure</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
