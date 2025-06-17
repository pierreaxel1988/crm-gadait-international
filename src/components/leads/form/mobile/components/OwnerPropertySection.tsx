
import React, { useState, useEffect } from 'react';
import { LeadDetailed, Owner, PropertyType, AssetType, Equipment, PropertyState } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import StyledSelect from './StyledSelect';
import MultiSelectButtons from '../../MultiSelectButtons';

interface OwnerPropertySectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerPropertySection: React.FC<OwnerPropertySectionProps> = ({
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
          description: "Impossible de mettre à jour les données du bien."
        });
        return;
      }

      setOwnerData(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Succès",
        description: "Données du bien mises à jour."
      });
    } catch (error) {
      console.error('Error in updateOwnerData:', error);
    }
  };

  const propertyTypes: PropertyType[] = [
    "Villa", "Appartement", "Penthouse", "Maison", "Duplex", "Chalet",
    "Terrain", "Manoir", "Maison de ville", "Château", "Local commercial",
    "Commercial", "Hotel", "Vignoble", "Autres"
  ];

  const assets: AssetType[] = [
    "Vue mer", "Vue panoramique", "Bord de mer", "Front de mer",
    "Domaine de chasse", "Écurie", "Bien d'architecte", "Style contemporain",
    "Monument classé", "Court de tennis", "Pied des pistes", "Proche montagne",
    "Proche aéroport", "Proche gare", "Proche golf"
  ];

  const equipment: Equipment[] = [
    "Piscine", "Ascenseur", "Garage & Parking", "Climatisation",
    "Salle de réception", "Dépendances", "Loge gardien", "Spa",
    "Viager", "Terrasse", "Jardin", "Meublé", "Cheminée",
    "Maison d'amis", "Bâtiments agricoles", "Chambre de bonne",
    "Accessible aux handicapés"
  ];

  const propertyStates: { value: PropertyState; label: string }[] = [
    { value: "Neuf", label: "Neuf" },
    { value: "Bon état", label: "Bon état" },
    { value: "À rafraîchir", label: "À rafraîchir" },
    { value: "À rénover", label: "À rénover" },
    { value: "À reconstruire", label: "À reconstruire" }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="property_type" className="text-sm">Type de propriété</Label>
        <StyledSelect
          id="property_type"
          value={ownerData?.property_type || ''}
          onChange={e => updateOwnerData({ property_type: e.target.value as PropertyType })}
          placeholder="Sélectionner un type"
          options={propertyTypes.map(type => ({ value: type, label: type }))}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Atouts</Label>
        <MultiSelectButtons 
          options={assets} 
          selectedValues={ownerData?.assets || []} 
          onToggle={(asset) => {
            const currentAssets = ownerData?.assets || [];
            const updatedAssets = currentAssets.includes(asset as AssetType)
              ? currentAssets.filter(a => a !== asset)
              : [...currentAssets, asset as AssetType];
            updateOwnerData({ assets: updatedAssets });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Équipements</Label>
        <MultiSelectButtons 
          options={equipment} 
          selectedValues={ownerData?.equipment || []} 
          onToggle={(equip) => {
            const currentEquipment = ownerData?.equipment || [];
            const updatedEquipment = currentEquipment.includes(equip as Equipment)
              ? currentEquipment.filter(e => e !== equip)
              : [...currentEquipment, equip as Equipment];
            updateOwnerData({ equipment: updatedEquipment });
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms" className="text-sm">Chambres</Label>
          <Input 
            id="bedrooms" 
            type="number"
            value={ownerData?.bedrooms || ''} 
            onChange={e => updateOwnerData({ bedrooms: parseInt(e.target.value) || 0 })} 
            placeholder="0" 
            className="w-full font-futura"
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms" className="text-sm">Salles de bain</Label>
          <Input 
            id="bathrooms" 
            type="number"
            value={ownerData?.bathrooms || ''} 
            onChange={e => updateOwnerData({ bathrooms: parseInt(e.target.value) || 0 })} 
            placeholder="0" 
            className="w-full font-futura"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="living_area" className="text-sm">Surface habitable (m²)</Label>
          <Input 
            id="living_area" 
            value={ownerData?.living_area || ''} 
            onChange={e => updateOwnerData({ living_area: e.target.value })} 
            placeholder="Ex : 150" 
            className="w-full font-futura"
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="land_area" className="text-sm">Surface terrain (m²)</Label>
          <Input 
            id="land_area" 
            value={ownerData?.land_area || ''} 
            onChange={e => updateOwnerData({ land_area: e.target.value })} 
            placeholder="Ex : 500" 
            className="w-full font-futura"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="property_state" className="text-sm">État du bien</Label>
        <StyledSelect
          id="property_state"
          value={ownerData?.property_state || ''}
          onChange={e => updateOwnerData({ property_state: e.target.value as PropertyState })}
          placeholder="Sélectionner l'état"
          options={propertyStates}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="construction_year" className="text-sm">Année de construction</Label>
        <Input 
          id="construction_year" 
          value={ownerData?.construction_year || ''} 
          onChange={e => updateOwnerData({ construction_year: e.target.value })} 
          placeholder="Ex : 2020" 
          className="w-full font-futura"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="property_description" className="text-sm">Description du bien</Label>
        <Textarea 
          id="property_description" 
          value={ownerData?.property_description || ''} 
          onChange={e => updateOwnerData({ property_description: e.target.value })} 
          placeholder="Décrivez le bien en détail..." 
          className="w-full font-futura min-h-20"
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default OwnerPropertySection;
