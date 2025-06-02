import React from 'react';
import { LeadDetailed, PropertyType } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Building, Bed, MapPin, TreePine, Home } from 'lucide-react';
import StyledSelect from './mobile/components/StyledSelect';

interface SearchCriteriaSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const SearchCriteriaSection: React.FC<SearchCriteriaSectionProps> = ({
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

  const bedroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8+"];

  const handleBedroomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const numValue = value === "8+" ? 8 : parseInt(value);
    onDataChange({ bedrooms: numValue });
  };

  const getMapCoordinatesValue = () => {
    if (!lead.mapCoordinates) return '';
    if (typeof lead.mapCoordinates === 'string') return lead.mapCoordinates;
    return `${lead.mapCoordinates.lat}, ${lead.mapCoordinates.lng}`;
  };

  const handleMapCoordinatesChange = (value: string) => {
    onDataChange({ mapCoordinates: value });
  };

  return (
    <div className="space-y-6">
      {/* Type de propriété */}
      <div className="space-y-2">
        <Label htmlFor="propertyType" className="text-sm flex items-center gap-2">
          <Building className="h-4 w-4" />
          Type de propriété
        </Label>
        <StyledSelect
          id="propertyType"
          value={lead.propertyType || ''}
          onChange={e => onDataChange({ propertyType: e.target.value as PropertyType })}
          placeholder="Sélectionner un type"
          options={propertyTypes}
        />
      </div>

      {/* Nombre de chambres */}
      <div className="space-y-2">
        <Label htmlFor="bedrooms" className="text-sm flex items-center gap-2">
          <Bed className="h-4 w-4" />
          Nombre de chambres
        </Label>
        <StyledSelect
          id="bedrooms"
          value={lead.bedrooms ? lead.bedrooms.toString() : ''}
          onChange={handleBedroomChange}
          placeholder="Sélectionner..."
          options={bedroomOptions.map(number => ({ value: number, label: number }))}
        />
      </div>

      {/* Localisation souhaitée */}
      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Localisation souhaitée
        </Label>
        <Input
          value={lead.desiredLocation || ''}
          onChange={(e) => onDataChange({ desiredLocation: e.target.value })}
          placeholder="Ex: Côte d'Azur, Paris..."
          className="w-full font-futura"
        />
      </div>

      {/* Surface habitable */}
      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2">
          <Home className="h-4 w-4" />
          Surface habitable (m²)
        </Label>
        <Input
          value={lead.livingArea || ''}
          onChange={(e) => onDataChange({ livingArea: e.target.value })}
          placeholder="Ex: 120"
          className="w-full font-futura"
        />
      </div>

      {/* Terrain */}
      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2">
          <TreePine className="h-4 w-4" />
          Terrain (m²)
        </Label>
        <Input
          value={lead.landArea || ''}
          onChange={(e) => onDataChange({ landArea: e.target.value })}
          placeholder="Ex: 500"
          className="w-full font-futura"
        />
      </div>

      {/* Pin Location */}
      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Pin Location
        </Label>
        <Input
          name="mapCoordinates"
          value={getMapCoordinatesValue()}
          onChange={(e) => handleMapCoordinatesChange(e.target.value)}
          placeholder="Collez le lien Google Maps ici"
          className="w-full font-futura"
        />
        <p className="text-xs text-muted-foreground">
          Copiez-collez le lien Google Maps de la propriété
        </p>
      </div>
    </div>
  );
};

export default SearchCriteriaSection;
