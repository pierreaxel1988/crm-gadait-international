
import React from 'react';
import { LeadDetailed, Currency } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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

      <div className="space-y-2">
        <div className="flex items-center gap-3 pt-2">
          <Label htmlFor="furnished" className="text-sm">Meublé</Label>
          <Switch 
            id="furnished" 
            checked={!!lead.furnished} 
            onCheckedChange={checked => {
              const updatedFurnished = !!checked;
              onDataChange({
                furnished: updatedFurnished,
                furniture_included_in_price: updatedFurnished ? true : undefined,
                furniture_price: updatedFurnished ? undefined : lead.furniture_price
              });
            }} 
          />
          <span className="ml-2 text-xs font-futura">
            {lead.furnished ? 'Oui' : 'Non'}
          </span>
        </div>
      </div>

      {lead.furnished && (
        <>
          <div className="space-y-2 mt-2">
            <Label htmlFor="furniture_included" className="text-sm">Mobilier inclus dans le prix</Label>
            <div className="flex items-center gap-3">
              <Switch 
                id="furniture_included" 
                checked={!!lead.furniture_included_in_price} 
                onCheckedChange={checked => onDataChange({
                  furniture_included_in_price: checked,
                  furniture_price: checked ? undefined : lead.furniture_price
                })} 
              />
              <span className="ml-2 text-xs font-futura">
                {lead.furniture_included_in_price ? 'Oui' : 'Non'}
              </span>
            </div>
          </div>

          {!lead.furniture_included_in_price && (
            <div className="space-y-2 mt-2">
              <Label htmlFor="furniture_price" className="text-sm">Valorisation du mobilier</Label>
              <Input 
                id="furniture_price" 
                value={lead.furniture_price || ''} 
                onChange={e => onDataChange({ furniture_price: e.target.value })} 
                placeholder="Ex : 45 000" 
                className="w-full font-futura" 
                type="text" 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OwnerPriceFields;
