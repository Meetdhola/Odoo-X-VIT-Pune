// Mapping country names to their official currency codes
const countryCurrencyMap = {
  'India': 'INR',
  'United States': 'USD',
  'USA': 'USD',
  'United Kingdom': 'GBP',
  'UK': 'GBP',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Germany': 'EUR',
  'France': 'EUR',
  'Japan': 'JPY',
  'China': 'CNY',
  'United Arab Emirates': 'AED',
  'UAE': 'AED',
  'Singapore': 'SGD',
  'Netherlands': 'EUR',
  'Bangladesh': 'BDT',
  'Pakistan': 'PKR',
  'Sri Lanka': 'LKR',
  'Nepal': 'NPR'
};

/**
 * Get currency code from country name
 * @param {string} countryName 
 * @returns {string} currencyCode (defaults to USD)
 */
export const getCurrencyFromCountry = (countryName) => {
  if (!countryName) return 'USD';
  
  // Try to find matching currency
  const normalizedCountry = countryName.trim();
  const currency = countryCurrencyMap[normalizedCountry];
  
  return currency || 'USD';
};
