
import React from 'react';
import { Input } from '@/components/ui/input';
import { DollarSign, EuroIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BudgetFilterProps {
  minBudget: string;
  maxBudget: string;
  onBudgetChange: (type: 'min' | 'max', value: string) => void;
  currency?: string;
  onCurrencyChange?: (value: string) => void;
}

const BudgetFilter = ({ 
  minBudget, 
  maxBudget, 
  onBudgetChange, 
  currency = 'EUR',
  onCurrencyChange 
}: BudgetFilterProps) => {
  
  // Function to format budget for display
  const formatBudgetDisplay = (value: string): string => {
    if (!value) return '';
    
    // Extract only numbers
    const numericValue = value.replace(/[^\d]/g, '');
    
    if (!numericValue) return '';
    
    // Convert to number
    const number = parseInt(numericValue);
    
    // Format with thousands separator
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(number);
  };
  
  // Handle minimum amount input
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBudgetChange('min', e.target.value);
  };
  
  // Handle maximum amount input
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBudgetChange('max', e.target.value);
  };
  
  // Format when focus is lost
  const handleBlur = (type: 'min' | 'max', value: string) => {
    if (!value) return;
    
    const formatted = formatBudgetDisplay(value);
    onBudgetChange(type, formatted);
  };

  // Get currency symbol
  const getCurrencySymbol = (currencyCode: string) => {
    switch (currencyCode) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'CHF': return 'CHF';
      default: return currencyCode;
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <DollarSign className="h-4 w-4" /> Budget
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Min</label>
          <Input
            type="text"
            value={minBudget}
            onChange={handleMinChange}
            onBlur={() => handleBlur('min', minBudget)}
            placeholder="Min"
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Max</label>
          <Input
            type="text"
            value={maxBudget}
            onChange={handleMaxChange}
            onBlur={() => handleBlur('max', maxBudget)}
            placeholder="Max"
            className="h-8 text-sm"
          />
        </div>
      </div>
      
      {onCurrencyChange && (
        <div className="mt-2">
          <label className="text-xs text-muted-foreground">Devise</label>
          <Select value={currency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Devise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">Euro (€)</SelectItem>
              <SelectItem value="USD">Dollar ($)</SelectItem>
              <SelectItem value="GBP">Livre (£)</SelectItem>
              <SelectItem value="CHF">Franc Suisse (CHF)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default BudgetFilter;
