
import React from 'react';
import { LeadDetailed, Currency } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Euro, DollarSign, PoundSterling } from 'lucide-react';
import StyledSelect from './StyledSelect';

interface OwnerPriceFieldsProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerPriceFields: React.FC<OwnerPriceFieldsProps> = ({
  lead,
  onDataChange
}) => {
  const CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP'];

  const getCurrencyIcon = (currency?: Currency) => {
    switch (currency) {
      case 'EUR': return Euro;
      case 'USD': return DollarSign;
      case 'GBP': return PoundSterling;
      default: return Euro;
    }
  };

  const CurrencyIcon = getCurrencyIcon(lead.currency);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="desired_price" className="text-sm flex items-center gap-2">
          <CurrencyIcon className="h-4 w-4 text-muted-foreground" />
          Prix souhaité
        </Label>
        <Input 
          id="desired_price" 
          value={lead.desired_price || ''} 
          onChange={e => onDataChange({ desired_price: e.target.value })} 
          placeholder="Ex: 500000" 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency" className="text-sm flex items-center gap-2">
          <CurrencyIcon className="h-4 w-4 text-muted-foreground" />
          Devise
        </Label>
        <StyledSelect
          id="currency"
          value={lead.currency || 'EUR'}
          onChange={e => onDataChange({ currency: e.target.value as Currency })}
          placeholder="Sélectionner une devise"
          options={CURRENCIES.map(currency => ({ 
            value: currency, 
            label: currency === 'EUR' ? '€ Euro' : currency === 'USD' ? '$ Dollar' : '£ Livre Sterling'
          }))}
        />
      </div>
    </div>
  );
};

export default OwnerPriceFields;
