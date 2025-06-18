
import React, { useState, useEffect } from 'react';
import { LeadDetailed, Owner, Currency } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import StyledSelect from './StyledSelect';
import { validateOwnerPrice } from '@/utils/ownerValidationHelper';
import { Euro, DollarSign, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface OptimizedOwnerPriceFieldsProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OptimizedOwnerPriceFields: React.FC<OptimizedOwnerPriceFieldsProps> = ({
  lead,
  onDataChange
}) => {
  const [ownerData, setOwnerData] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(false);
  const [priceValidation, setPriceValidation] = useState(validateOwnerPrice(''));
  const [feesValidation, setFeesValidation] = useState(validateOwnerPrice(''));
  const [furnitureValidation, setFurnitureValidation] = useState(validateOwnerPrice(''));

  // Debounce price updates to avoid too many API calls
  const debouncedDesiredPrice = useDebounce(ownerData?.desired_price || '', 500);
  const debouncedFees = useDebounce(ownerData?.fees || '', 500);
  const debouncedFurniturePrice = useDebounce(ownerData?.furniture_price || '', 500);

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (lead.pipelineType !== 'owners' || !lead.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('owners')
          .select('*')
          .eq('id', lead.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching owner data:', error);
          return;
        }

        if (data) {
          setOwnerData(data as Owner);
        }
      } catch (error) {
        console.error('Error in fetchOwnerData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [lead.id, lead.pipelineType]);

  // Update validations when prices change
  useEffect(() => {
    setPriceValidation(validateOwnerPrice(debouncedDesiredPrice));
  }, [debouncedDesiredPrice]);

  useEffect(() => {
    setFeesValidation(validateOwnerPrice(debouncedFees));
  }, [debouncedFees]);

  useEffect(() => {
    setFurnitureValidation(validateOwnerPrice(debouncedFurniturePrice));
  }, [debouncedFurniturePrice]);

  const updateOwnerData = async (updates: Partial<Owner>) => {
    if (!lead.id || lead.pipelineType !== 'owners') return;

    try {
      const updatesWithTimestamp = {
        ...updates,
        last_price_update: new Date().toISOString()
      };

      const { error } = await supabase
        .from('owners')
        .update(updatesWithTimestamp)
        .eq('id', lead.id);

      if (error) {
        console.error('Error updating owner data:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre à jour les informations tarifaires."
        });
        return;
      }

      setOwnerData(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error in updateOwnerData:', error);
    }
  };

  const currencies = [
    { value: 'EUR', label: '€ Euro', icon: Euro },
    { value: 'USD', label: '$ Dollar US', icon: DollarSign },
    { value: 'GBP', label: '£ Livre Sterling' },
    { value: 'CHF', label: 'CHF Franc Suisse' },
    { value: 'AED', label: 'AED Dirham' },
    { value: 'MUR', label: 'MUR Roupie' }
  ];

  const getCurrencySymbol = (currency: Currency) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'CHF': return 'CHF';
      case 'AED': return 'AED';
      case 'MUR': return 'MUR';
      default: return '€';
    }
  };

  const ValidationMessage = ({ validation, label }: { validation: any, label: string }) => {
    if (!validation.isValid) {
      return (
        <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
          <AlertCircle className="h-3 w-3" />
          {validation.errors[0]}
        </div>
      );
    }
    if (validation.warnings.length > 0) {
      return (
        <div className="flex items-center gap-1 text-amber-600 text-xs mt-1">
          <AlertCircle className="h-3 w-3" />
          {validation.warnings[0]}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Currency Selection */}
      <div className="space-y-2">
        <Label htmlFor="currency" className="text-sm font-futura">Devise</Label>
        <StyledSelect
          id="currency"
          value={ownerData?.currency || 'EUR'}
          onChange={e => updateOwnerData({ currency: e.target.value as Currency })}
          options={currencies}
          disabled={loading}
        />
      </div>

      {/* Desired Price */}
      <div className="space-y-2">
        <Label htmlFor="desired_price" className="text-sm font-futura">
          Prix souhaité
        </Label>
        <div className="relative">
          <Input 
            id="desired_price" 
            type="text"
            value={ownerData?.desired_price || ''}
            onChange={e => updateOwnerData({ desired_price: e.target.value })}
            placeholder={`Prix en ${getCurrencySymbol(ownerData?.currency || 'EUR')}`}
            className="font-futura pr-12"
            disabled={loading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm">
            {getCurrencySymbol(ownerData?.currency || 'EUR')}
          </div>
        </div>
        <ValidationMessage validation={priceValidation} label="Prix souhaité" />
      </div>

      {/* Fees */}
      <div className="space-y-2">
        <Label htmlFor="fees" className="text-sm font-futura">
          Frais (notaire, agence, etc.)
        </Label>
        <div className="relative">
          <Input 
            id="fees" 
            type="text"
            value={ownerData?.fees || ''}
            onChange={e => updateOwnerData({ fees: e.target.value })}
            placeholder={`Frais en ${getCurrencySymbol(ownerData?.currency || 'EUR')}`}
            className="font-futura pr-12"
            disabled={loading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm">
            {getCurrencySymbol(ownerData?.currency || 'EUR')}
          </div>
        </div>
        <ValidationMessage validation={feesValidation} label="Frais" />
      </div>

      {/* Furniture Section Toggle */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-sm font-futura flex items-center gap-2">
            <Package className="h-4 w-4" />
            Gestion du mobilier
          </Label>
          <Switch
            checked={ownerData?.is_furniture_relevant || false}
            onCheckedChange={(checked) => updateOwnerData({ is_furniture_relevant: checked })}
            disabled={loading}
          />
        </div>

        {ownerData?.is_furniture_relevant && (
          <div className="space-y-4 pl-6 border-l-2 border-blue-100">
            {/* Furnished */}
            <div className="flex items-center justify-between">
              <Label htmlFor="furnished" className="text-sm font-futura">
                Bien meublé
              </Label>
              <Switch
                id="furnished"
                checked={ownerData?.furnished || false}
                onCheckedChange={(checked) => updateOwnerData({ furnished: checked })}
                disabled={loading}
              />
            </div>

            {ownerData?.furnished && (
              <>
                {/* Furniture included in price */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="furniture_included_in_price" className="text-sm font-futura">
                    Mobilier inclus dans le prix
                  </Label>
                  <Switch
                    id="furniture_included_in_price"
                    checked={ownerData?.furniture_included_in_price || false}
                    onCheckedChange={(checked) => updateOwnerData({ furniture_included_in_price: checked })}
                    disabled={loading}
                  />
                </div>

                {/* Furniture Price */}
                {!ownerData?.furniture_included_in_price && (
                  <div className="space-y-2">
                    <Label htmlFor="furniture_price" className="text-sm font-futura">
                      Prix du mobilier
                    </Label>
                    <div className="relative">
                      <Input 
                        id="furniture_price" 
                        type="text"
                        value={ownerData?.furniture_price || ''}
                        onChange={e => updateOwnerData({ furniture_price: e.target.value })}
                        placeholder={`Prix mobilier en ${getCurrencySymbol(ownerData?.currency || 'EUR')}`}
                        className="font-futura pr-12"
                        disabled={loading}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm">
                        {getCurrencySymbol(ownerData?.currency || 'EUR')}
                      </div>
                    </div>
                    <ValidationMessage validation={furnitureValidation} label="Prix mobilier" />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Price Summary */}
      {ownerData?.desired_price && priceValidation.isValid && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-futura text-green-800">Récapitulatif des prix</span>
          </div>
          <div className="text-sm space-y-1">
            <div>Prix principal: {ownerData.desired_price} {getCurrencySymbol(ownerData?.currency || 'EUR')}</div>
            {ownerData.fees && <div>Frais: {ownerData.fees} {getCurrencySymbol(ownerData?.currency || 'EUR')}</div>}
            {ownerData.furniture_price && !ownerData.furniture_included_in_price && (
              <div>Mobilier: {ownerData.furniture_price} {getCurrencySymbol(ownerData?.currency || 'EUR')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedOwnerPriceFields;
