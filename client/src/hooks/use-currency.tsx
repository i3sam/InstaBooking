import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Rate relative to USD
}

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.85 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.73 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.25 },
  { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar', rate: 0.376 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67 },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', rate: 3.75 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.35 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.52 },
];

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  convertPrice: (usdAmount: number) => number;
  formatPrice: (usdAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]); // Default to USD

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('bookinggen-currency');
    if (savedCurrency) {
      const currency = currencies.find(c => c.code === savedCurrency);
      if (currency) {
        setSelectedCurrency(currency);
      }
    }
  }, []);

  // Save currency to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('bookinggen-currency', selectedCurrency.code);
  }, [selectedCurrency]);

  const convertPrice = (usdAmount: number): number => {
    return Math.round((usdAmount * selectedCurrency.rate) * 100) / 100;
  };

  const formatPrice = (usdAmount: number): string => {
    const convertedAmount = convertPrice(usdAmount);
    
    // Format based on currency
    switch (selectedCurrency.code) {
      case 'INR':
      case 'BHD':
      case 'AED':
      case 'SAR':
        return `${selectedCurrency.symbol}${convertedAmount.toFixed(2)}`;
      default:
        return `${selectedCurrency.symbol}${convertedAmount.toFixed(2)}`;
    }
  };

  const handleSetSelectedCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      setSelectedCurrency: handleSetSelectedCurrency,
      convertPrice,
      formatPrice
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}