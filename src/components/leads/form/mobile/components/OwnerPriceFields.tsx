
import React from 'react';
import { LeadDetailed, Currency } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import StyledSelect from './StyledSelect';

interface OwnerPriceFieldsProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerPriceFields: React.FC<OwnerPriceFieldsProps> = ({
  lead,
  onDataChange
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="desired_price" className="text-sm">Prix souhaité</Label>
        <Input 
          id="desired_price" 
          value={lead.desired_price || ''} 
          onChange={e => onDataChange({ desired_price: e.target.value })} 
          placeholder="Ex : 450 000" 
          className="w-full font-futura" 
          type="text" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fees" className="text-sm">Honoraires</Label>
        <Input 
          id="fees" 
          value={lead.fees || ''} 
          onChange={e => onDataChange({ fees: e.target.value })} 
          placeholder="Ex : 5%" 
          className="w-full font-futura" 
          type="text" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency" className="text-sm">Devise</Label>
        <StyledSelect
          id="currency"
          value={lead.currency || 'EUR'}
          onChange={e => onDataChange({ currency: e.target.value as Currency })}
          options={[
            { value: "EUR", label: "EUR (€)" },
            { value: "USD", label: "USD ($)" },
            { value: "GBP", label: "GBP (£)" },
            { value: "CHF", label: "CHF (Fr)" },
            { value: "AED", label: "AED (د.إ)" },
            { value: "MUR", label: "MUR (₨)" }
          ]}
        />
      </div>
    </div>
  );
};

export default OwnerPriceFields;
