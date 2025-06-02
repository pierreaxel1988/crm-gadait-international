
import React from 'react';
import { LeadDetailed, PropertyType, ViewType } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Building, Bed } from 'lucide-react';
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
  const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: "Villa", label: "Villa" },
    { value: "Apartment", label: "Appartement" },
    { value: "House", label: "Maison" },
    { value: "Land", label: "Terrain" },
    { value: "Other", label: "Autre" }
  ];

  const viewTypes: ViewType[] = ['Mer', 'Montagne', 'Golf', 'Autres'];

  const bedroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8+"];

  const handleBedroomToggle = (value: string) => {
    const numValue = value === "8+" ? 8 : parseInt(value);
    const currentBedrooms = Array.isArray(lead.bedrooms) 
      ? [...lead.bedrooms] 
      : lead.bedrooms 
      ? [lead.bedrooms] 
      : [];
    const newBedrooms = currentBedrooms.includes(numValue)
      ? currentBedrooms.filter(b => b !== numValue)
      : [...currentBedrooms, numValue];
    onDataChange({ bedrooms: newBedrooms.length ? newBedrooms : undefined });
  };

  const getSelectedBedrooms = () => {
    if (!lead.bedrooms) return [];
    if (Array.isArray(lead.bedrooms)) {
      return lead.bedrooms.map(num => num >= 8 ? "8+" : num.toString());
    }
    const value = lead.bedrooms;
    return [value >= 8 ? "8+" : value.toString()];
  };

  const handleViewToggle = (view: ViewType) => {
    const currentViews = lead.views || [];
    const newViews = currentViews.includes(view)
      ? currentViews.filter(v => v !== view)
      : [...currentViews, view];
    onDataChange({ views: newViews });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="propertyType" className="text-sm">Type de propriété</Label>
        <StyledSelect
          id="propertyType"
          value={lead.propertyType || ''}
          onChange={(e) => onDataChange({ propertyType: e.target.value as PropertyType })}
          placeholder="Sélectionner un type"
          options={propertyTypes}
          icon={<Building className="h-4 w-4" />}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="livingArea" className="text-sm">Surface habitable (m²)</Label>
        <Input 
          id="livingArea" 
          value={lead.livingArea || ''} 
          onChange={e => onDataChange({ livingArea: e.target.value })} 
          placeholder="Ex : 150" 
          className="w-full font-futura" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="landArea" className="text-sm">Surface terrain (m²)</Label>
        <Input 
          id="landArea" 
          value={lead.landArea || ''} 
          onChange={e => onDataChange({ landArea: e.target.value })} 
          placeholder="Ex : 800" 
          className="w-full font-futura" 
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm flex items-center gap-2">
          <Bed className="h-4 w-4" />
          Nombre de chambres
        </Label>
        <div className="flex flex-wrap gap-2">
          {bedroomOptions.map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => handleBedroomToggle(number)}
              className={`flex items-center justify-center w-12 h-12 rounded-lg font-semibold text-sm transition-all ${
                getSelectedBedrooms().includes(number)
                  ? 'bg-loro-navy text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {number}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm">Vue</Label>
        <MultiSelectButtons
          options={viewTypes}
          selectedValues={lead.views || []}
          onToggle={handleViewToggle}
        />
      </div>
    </div>
  );
};

export default OwnerPropertySection;
