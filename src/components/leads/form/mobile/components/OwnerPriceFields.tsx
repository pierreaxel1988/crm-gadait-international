
import React, { useEffect } from 'react';
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
  // Fonction pour calculer la commission hors taxe
  const calculateCommission = (price: string, fees: string): string => {
    if (!price || !fees) return '';
    
    // Nettoyer les valeurs (supprimer les espaces, virgules, etc.)
    const cleanPrice = price.replace(/[^\d.,]/g, '').replace(',', '.');
    const cleanFees = fees.replace(/[^\d.,]/g, '').replace(',', '.');
    
    const priceNum = parseFloat(cleanPrice);
    const feesNum = parseFloat(cleanFees);
    
    if (isNaN(priceNum) || isNaN(feesNum)) return '';
    
    // Calculer la commission (prix × pourcentage / 100)
    const commission = (priceNum * feesNum) / 100;
    
    // Formater avec des espaces pour les milliers
    return commission.toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };

  // Effet pour recalculer automatiquement la commission quand le prix ou les honoraires changent
  useEffect(() => {
    if (lead.desired_price && lead.fees) {
      const newCommission = calculateCommission(lead.desired_price, lead.fees);
      if (newCommission !== lead.commission_ht) {
        onDataChange({ commission_ht: newCommission });
      }
    } else if (lead.commission_ht) {
      // Si un des champs requis est vide, vider la commission
      onDataChange({ commission_ht: '' });
    }
  }, [lead.desired_price, lead.fees]);

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

      {/* Nouveau champ commission hors taxe (lecture seule) */}
      {lead.commission_ht && (
        <div className="space-y-2">
          <Label htmlFor="commission_ht" className="text-sm">Commission HT</Label>
          <Input 
            id="commission_ht" 
            value={lead.commission_ht} 
            readOnly 
            className="w-full font-futura bg-gray-50 text-gray-700" 
            type="text"
          />
        </div>
      )}

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

      {/* Section mobilier */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 pt-2">
          <Label htmlFor="furnished" className="text-sm">Meublé</Label>
          <Switch 
            id="furnished" 
            checked={!!lead.furnished} 
            onCheckedChange={checked => {
              onDataChange({
                furnished: checked,
                furniture_included_in_price: checked ? true : false,
                furniture_price: checked ? lead.furniture_price : undefined
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
