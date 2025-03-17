
import React from 'react';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface BudgetFilterProps {
  minBudget: string;
  maxBudget: string;
  onBudgetChange: (type: 'min' | 'max', value: string) => void;
}

const BudgetFilter = ({ minBudget, maxBudget, onBudgetChange }: BudgetFilterProps) => {
  
  // Fonction pour formater le budget à l'affichage
  const formatBudgetDisplay = (value: string): string => {
    if (!value) return '';
    
    // Extraire les chiffres uniquement
    const numericValue = value.replace(/[^\d]/g, '');
    
    if (!numericValue) return '';
    
    // Convertir en nombre
    const number = parseInt(numericValue);
    
    // Formater avec séparateur de milliers
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(number);
  };
  
  // Gère la saisie du montant minimum
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBudgetChange('min', e.target.value);
  };
  
  // Gère la saisie du montant maximum
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBudgetChange('max', e.target.value);
  };
  
  // Formatage lors de la perte de focus
  const handleBlur = (type: 'min' | 'max', value: string) => {
    if (!value) return;
    
    const formatted = formatBudgetDisplay(value);
    onBudgetChange(type, formatted);
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <DollarSign className="h-4 w-4" /> Budget
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Min €</label>
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
          <label className="text-xs text-muted-foreground">Max €</label>
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
    </div>
  );
};

export default BudgetFilter;
