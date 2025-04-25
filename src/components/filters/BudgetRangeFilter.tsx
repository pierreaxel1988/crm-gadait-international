
import React from 'react';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FilterGroup from './FilterGroup';

interface BudgetRangeFilterProps {
  minBudget?: string;
  maxBudget?: string;
  onMinBudgetChange: (value: string) => void;
  onMaxBudgetChange: (value: string) => void;
  currency?: string;
  onCurrencyChange?: (value: string) => void;
  className?: string;
}

const BudgetRangeFilter = ({ 
  minBudget = '', 
  maxBudget = '', 
  onMinBudgetChange,
  onMaxBudgetChange,
  currency = 'EUR',
  onCurrencyChange,
  className
}: BudgetRangeFilterProps) => {
  
  // Format when focus is lost
  const formatBudget = (value: string): string => {
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
  
  const handleBlur = (type: 'min' | 'max', value: string) => {
    if (!value) return;
    
    const formatted = formatBudget(value);
    if (type === 'min') {
      onMinBudgetChange(formatted);
    } else {
      onMaxBudgetChange(formatted);
    }
  };

  return (
    <FilterGroup className={className}>
      <div className="flex items-center gap-2 text-sm">
        <DollarSign className="h-4 w-4" />
        <span className="font-medium">Budget</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Min</label>
          <Input
            type="text"
            value={minBudget}
            onChange={(e) => onMinBudgetChange(e.target.value)}
            onBlur={(e) => handleBlur('min', e.target.value)}
            placeholder="Min"
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Max</label>
          <Input
            type="text"
            value={maxBudget}
            onChange={(e) => onMaxBudgetChange(e.target.value)}
            onBlur={(e) => handleBlur('max', e.target.value)}
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
              <SelectItem value="AED">Dirham (AED)</SelectItem>
              <SelectItem value="MUR">Roupie Mauricienne (MUR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </FilterGroup>
  );
};

export default BudgetRangeFilter;
