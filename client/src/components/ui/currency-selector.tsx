import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Globe } from 'lucide-react';
import { useCurrency, currencies } from '@/hooks/use-currency';

interface CurrencySelectorProps {
  showLabel?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

export default function CurrencySelector({ 
  showLabel = true, 
  variant = 'default',
  className = ''
}: CurrencySelectorProps) {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 px-2 ${className}`}
            data-testid="currency-selector-compact"
          >
            <Globe className="h-4 w-4 mr-1" />
            <span className="font-medium">{selectedCurrency.code}</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {currencies.map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => setSelectedCurrency(currency)}
              className="flex items-center justify-between cursor-pointer"
              data-testid={`currency-option-${currency.code}`}
            >
              <div className="flex items-center">
                <span className="font-medium mr-2">{currency.symbol}</span>
                <span className="text-sm">{currency.code}</span>
              </div>
              {selectedCurrency.code === currency.code && (
                <Badge variant="default" className="text-xs">Selected</Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-foreground flex items-center">
          <Globe className="h-4 w-4 mr-1" />
          Currency:
        </label>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="min-w-[140px] justify-between"
            data-testid="currency-selector"
          >
            <div className="flex items-center">
              <span className="font-medium mr-2">{selectedCurrency.symbol}</span>
              <span>{selectedCurrency.code}</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {currencies.map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => setSelectedCurrency(currency)}
              className="flex items-center justify-between cursor-pointer"
              data-testid={`currency-option-${currency.code}`}
            >
              <div className="flex items-center">
                <span className="font-medium mr-3">{currency.symbol}</span>
                <div>
                  <div className="font-medium">{currency.code}</div>
                  <div className="text-xs text-muted-foreground">{currency.name}</div>
                </div>
              </div>
              {selectedCurrency.code === currency.code && (
                <Badge variant="default" className="text-xs">Selected</Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}