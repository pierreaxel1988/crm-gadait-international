
import React, { useState } from 'react';
import { Banknote, Timer, CreditCard, Home } from 'lucide-react';
import { LeadDetailed, PurchaseTimeframe, FinancingMethod, PropertyUse, Currency } from '@/types/lead';
import FormInput from '../FormInput';
import RadioSelectButtons from '../RadioSelectButtons';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PurchaseDetailsSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
  purchaseTimeframes: PurchaseTimeframe[];
  financingMethods: FinancingMethod[];
  propertyUses: PropertyUse[];
}

const PurchaseDetailsSection = ({
  formData,
  handleInputChange,
  handleMultiSelectToggle,
  purchaseTimeframes,
  financingMethods,
  propertyUses,
}: PurchaseDetailsSectionProps) => {
  const [formattedBudget, setFormattedBudget] = useState(formData.budget || '');
  const [currency, setCurrency] = useState<Currency>(formData.currency as Currency || 'EUR');
  
  // Format budget function
  const formatBudgetInput = (value: string, currencyCode: Currency) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^\d]/g, '');
    
    if (!numericValue) return '';
    
    // Convert to number
    const number = parseInt(numericValue);
    
    // Format with thousands separator
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(number);
  };
  
  // Handle budget change
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Store formatted value for display
    setFormattedBudget(value);
    
    // Store the raw value for form data
    const rawValue = value.replace(/[^\d]/g, '') ? value : '';
    
    // Simulate an event to update formData
    const syntheticEvent = {
      target: {
        name: 'budget',
        value: rawValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };
  
  // Handle blur event to format budget
  const handleBudgetBlur = () => {
    if (!formattedBudget) return;
    
    const formatted = formatBudgetInput(formattedBudget, currency);
    setFormattedBudget(formatted);
    
    // Update the formData with the formatted value
    const syntheticEvent = {
      target: {
        name: 'budget',
        value: formatted
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };
  
  // Handle currency change
  const handleCurrencyChange = (value: Currency) => {
    setCurrency(value);
    
    // Update formData with new currency
    const syntheticEvent = {
      target: {
        name: 'currency',
        value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
    
    // Also reformat budget with new currency if there's a budget value
    if (formattedBudget) {
      const formatted = formatBudgetInput(formattedBudget, value);
      setFormattedBudget(formatted);
      
      const budgetEvent = {
        target: {
          name: 'budget',
          value: formatted
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleInputChange(budgetEvent);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FormInput
          label="Budget"
          name="budget"
          value={formattedBudget}
          onChange={handleBudgetChange}
          placeholder="ex: 1.500.000€"
          icon={Banknote}
          renderCustomField={() => (
            <div className="space-y-2">
              <Input
                name="budget"
                value={formattedBudget}
                onChange={handleBudgetChange}
                onBlur={handleBudgetBlur}
                placeholder="ex: 1.500.000"
                className="luxury-input w-full"
              />
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="luxury-input w-full">
                  <SelectValue placeholder="Devise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">Dollar ($)</SelectItem>
                  <SelectItem value="GBP">Livre Sterling (£)</SelectItem>
                  <SelectItem value="CHF">Franc Suisse (CHF)</SelectItem>
                  <SelectItem value="AED">Dirham (AED)</SelectItem>
                  <SelectItem value="MUR">Roupie Mauricienne (MUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </div>

      <FormInput
        label="Date d'achat souhaitée"
        name="purchaseTimeframe"
        value=""
        onChange={() => {}}
        icon={Timer}
        renderCustomField={() => (
          <RadioSelectButtons
            options={purchaseTimeframes}
            selectedValue={formData.purchaseTimeframe}
            onSelect={(value) => handleMultiSelectToggle('purchaseTimeframe', value)}
          />
        )}
      />

      <FormInput
        label="Mode de financement"
        name="financingMethod"
        value=""
        onChange={() => {}}
        icon={CreditCard}
        renderCustomField={() => (
          <RadioSelectButtons
            options={financingMethods}
            selectedValue={formData.financingMethod}
            onSelect={(value) => handleMultiSelectToggle('financingMethod', value)}
          />
        )}
      />

      <FormInput
        label="Type d'investissement"
        name="propertyUse"
        value=""
        onChange={() => {}}
        icon={Home}
        renderCustomField={() => (
          <RadioSelectButtons
            options={propertyUses}
            selectedValue={formData.propertyUse}
            onSelect={(value) => handleMultiSelectToggle('propertyUse', value)}
          />
        )}
      />
    </div>
  );
};

export default PurchaseDetailsSection;
