
import React, { useState, useEffect } from 'react';
import { LeadDetailed, Currency, Owner } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import StyledSelect from './StyledSelect';

interface OwnerPriceFieldsProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerPriceFields: React.FC<OwnerPriceFieldsProps> = ({
  lead,
  onDataChange
}) => {
  const [ownerData, setOwnerData] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(false);

  // Récupérer les données du propriétaire associé au lead
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
          setOwnerData(data);
        }
      } catch (error) {
        console.error('Error in fetchOwnerData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [lead.id, lead.pipelineType]);

  // Mettre à jour les données du propriétaire
  const updateOwnerData = async (updates: Partial<Owner>) => {
    if (!lead.id || lead.pipelineType !== 'owners') return;

    try {
      const { error } = await supabase
        .from('owners')
        .update(updates)
        .eq('id', lead.id);

      if (error) {
        console.error('Error updating owner data:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre à jour les données du mobilier."
        });
        return;
      }

      setOwnerData(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Succès",
        description: "Données du mobilier mises à jour."
      });
    } catch (error) {
      console.error('Error in updateOwnerData:', error);
    }
  };

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

      {/* Section mobilier pour les propriétaires */}
      {lead.pipelineType === 'owners' && (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-3 pt-2">
              <Label htmlFor="furnished" className="text-sm">Meublé</Label>
              <Switch 
                id="furnished" 
                checked={!!ownerData?.furnished} 
                onCheckedChange={checked => {
                  const updates: Partial<Owner> = {
                    furnished: checked,
                    furniture_included_in_price: checked ? true : false,
                    furniture_price: checked ? ownerData?.furniture_price : undefined
                  };
                  updateOwnerData(updates);
                }} 
                disabled={loading}
              />
              <span className="ml-2 text-xs font-futura">
                {ownerData?.furnished ? 'Oui' : 'Non'}
              </span>
            </div>
          </div>

          {ownerData?.furnished && (
            <>
              <div className="space-y-2 mt-2">
                <Label htmlFor="furniture_included" className="text-sm">Mobilier inclus dans le prix</Label>
                <div className="flex items-center gap-3">
                  <Switch 
                    id="furniture_included" 
                    checked={!!ownerData?.furniture_included_in_price} 
                    onCheckedChange={checked => updateOwnerData({
                      furniture_included_in_price: checked,
                      furniture_price: checked ? undefined : ownerData?.furniture_price
                    })} 
                    disabled={loading}
                  />
                  <span className="ml-2 text-xs font-futura">
                    {ownerData?.furniture_included_in_price ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>

              {!ownerData?.furniture_included_in_price && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="furniture_price" className="text-sm">Valorisation du mobilier</Label>
                  <Input 
                    id="furniture_price" 
                    value={ownerData?.furniture_price || ''} 
                    onChange={e => updateOwnerData({ furniture_price: e.target.value })} 
                    placeholder="Ex : 45 000" 
                    className="w-full font-futura" 
                    type="text"
                    disabled={loading}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default OwnerPriceFields;
