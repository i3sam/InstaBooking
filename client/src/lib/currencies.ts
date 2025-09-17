// Comprehensive currency list with symbols and ISO codes
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  country?: string;
}

export const currencies: Currency[] = [
  // Major currencies
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union' },
  { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', country: 'Switzerland' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', country: 'Canada' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China' },
  
  // Americas
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', country: 'Brazil' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', country: 'Mexico' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', country: 'Argentina' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso', country: 'Chile' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso', country: 'Colombia' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', country: 'Peru' },
  { code: 'UYU', symbol: '$', name: 'Uruguayan Peso', country: 'Uruguay' },
  
  // Europe
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', country: 'Norway' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', country: 'Sweden' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', country: 'Denmark' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', country: 'Poland' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', country: 'Czech Republic' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', country: 'Hungary' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', country: 'Romania' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', country: 'Bulgaria' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna', country: 'Croatia' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', country: 'Russia' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', country: 'Ukraine' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', country: 'Turkey' },
  
  // Asia-Pacific
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', country: 'South Korea' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', country: 'Hong Kong' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', country: 'Taiwan' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', country: 'Thailand' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', country: 'Malaysia' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', country: 'Indonesia' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', country: 'Philippines' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', country: 'Vietnam' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', country: 'New Zealand' },
  
  // Middle East & Africa
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', country: 'United Arab Emirates' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', country: 'Saudi Arabia' },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal', country: 'Qatar' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', country: 'Kuwait' },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', country: 'Bahrain' },
  { code: 'OMR', symbol: '﷼', name: 'Omani Rial', country: 'Oman' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', country: 'Israel' },
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound', country: 'Egypt' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', country: 'Nigeria' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', country: 'Kenya' },
  
  // Cryptocurrencies (popular ones)
  { code: 'BTC', symbol: '₿', name: 'Bitcoin' },
  { code: 'ETH', symbol: 'Ξ', name: 'Ethereum' },
  { code: 'USDC', symbol: 'USDC', name: 'USD Coin' },
  { code: 'USDT', symbol: 'USDT', name: 'Tether' },
];

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return currencies.find(currency => currency.code === code);
};

export const formatCurrencyDisplay = (currency: Currency): string => {
  return `${currency.symbol} ${currency.code} - ${currency.name}${currency.country ? ` (${currency.country})` : ''}`;
};

export const searchCurrencies = (query: string): Currency[] => {
  if (!query.trim()) return currencies;
  
  const lowercaseQuery = query.toLowerCase();
  return currencies.filter(currency => 
    currency.code.toLowerCase().includes(lowercaseQuery) ||
    currency.name.toLowerCase().includes(lowercaseQuery) ||
    currency.symbol.includes(query) ||
    (currency.country && currency.country.toLowerCase().includes(lowercaseQuery))
  );
};