
import React from 'react';
import { LeadDetailed, PropertyType, AssetType, Equipment, PropertyState } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
          value={lead.propertyType || ''}
          onChange={e => onDataChange({ propertyType: e.target.value as PropertyType })}
          placeholder="Sélectionner un type"
          options={propertyTypes.map(type => ({ value: type, label: type }))}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Atouts</Label>
        <MultiSelectButtons 
          options={assets} 
          selectedValues={lead.assets || []} 
          onToggle={(asset) => {
            const currentAssets = lead.assets || [];
            const updatedAssets = currentAssets.includes(asset as AssetType)
              ? currentAssets.filter(a => a !== asset)
              : [...currentAssets, asset as AssetType];
            onDataChange({ assets: updatedAssets });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Équipements</Label>
        <MultiSelectButtons 
          options={equipment} 
          selectedValues={lead.equipment || []} 
          onToggle={(equip) => {
            const currentEquipment = lead.equipment || [];
            const updatedEquipment = currentEquipment.includes(equip as Equipment)
              ? currentEquipment.filter(e => e !== equip)
              : [...currentEquipment, equip as Equipment];
            onDataChange({ equipment: updatedEquipment });
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms" className="text-sm">Chambres</Label>
          <Input 
            id="bedrooms" 
            type="number"
            value={typeof lead.bedrooms === 'number' ? lead.bedrooms.toString() : ''} 
            onChange={e => onDataChange({ bedrooms: parseInt(e.target.value) || 0 })} 
            placeholder="0" 
            className="w-full font-futura"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms" className="text-sm">Salles de bain</Label>
          <Input 
            id="bathrooms" 
            type="number"
            value={lead.bathrooms || ''} 
            onChange={e => onDataChange({ bathrooms: parseInt(e.target.value) || 0 })} 
            placeholder="0" 
            className="w-full font-futura"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="living_area" className="text-sm">Surface habitable (m²)</Label>
          <Input 
            id="living_area" 
            value={lead.livingArea || ''} 
            onChange={e => onDataChange({ livingArea: e.target.value })} 
            placeholder="Ex : 150" 
            className="w-full font-futura"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="land_area" className="text-sm">Surface terrain (m²)</Label>
          <Input 
            id="land_area" 
            value={lead.landArea || ''} 
            onChange={e => onDataChange({ landArea: e.target.value })} 
            placeholder="Ex : 500" 
            className="w-full font-futura"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="property_state" className="text-sm">État du bien</Label>
        <StyledSelect
          id="property_state"
          value={lead.propertyState || ''}
          onChange={e => onDataChange({ propertyState: e.target.value as PropertyState })}
          placeholder="Sélectionner l'état"
          options={propertyStates}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="renovation_needed" className="text-sm">Rénovation nécessaire</Label>
        <div className="flex items-center space-x-2">
          <Switch
            id="renovation_needed"
            checked={lead.renovation_needed || false}
            onCheckedChange={(checked) => onDataChange({ renovation_needed: checked })}
          />
          <Label htmlFor="renovation_needed" className="text-sm text-muted-foreground">
            {lead.renovation_needed ? 'Oui, des travaux sont nécessaires' : 'Non, aucun travaux nécessaire'}
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="construction_year" className="text-sm">Année de construction</Label>
        <Input 
          id="construction_year" 
          value={lead.constructionYear || ''} 
          onChange={e => onDataChange({ constructionYear: e.target.value })} 
          placeholder="Ex : 2020" 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="property_description" className="text-sm">Description du bien</Label>
        <Textarea 
          id="property_description" 
          value={lead.propertyDescription || ''} 
          onChange={e => onDataChange({ propertyDescription: e.target.value })} 
          placeholder="Décrivez le bien en détail..." 
          className="w-full font-futura min-h-20"
        />
      </div>
    </div>
  );
};

export default OwnerPropertySection;
