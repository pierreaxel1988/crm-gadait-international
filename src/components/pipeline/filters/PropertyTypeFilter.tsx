
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { PropertyType } from '@/types/lead';

interface PropertyTypeFilterProps {
  propertyType: PropertyType | null;
  onPropertyTypeChange: (propertyType: PropertyType | null) => void;
  propertyTypes?: PropertyType[];
  onPropertyTypesChange?: (propertyTypes: PropertyType[]) => void;
  allowMultiple?: boolean;
}

const PropertyTypeFilter = ({ 
  propertyType, 
  onPropertyTypeChange, 
  propertyTypes = [], 
  onPropertyTypesChange, 
  allowMultiple = true 
}: PropertyTypeFilterProps) => {
  // Liste des types de propriétés utilisés dans la fiche des leads
  const availablePropertyTypes: (PropertyType | null)[] = [
    null, 'Villa', 'Appartement', 'Penthouse', 'Chalet', 'Maison', 
    'Duplex', 'Terrain', 'Manoir', 'Maison de ville', 'Château', 
    'Local commercial'
  ];
  
  const togglePropertyType = (type: PropertyType) => {
    if (allowMultiple && onPropertyTypesChange) {
      if (propertyTypes.includes(type)) {
        onPropertyTypesChange(propertyTypes.filter(t => t !== type));
      } else {
        onPropertyTypesChange([...propertyTypes, type]);
      }
    } else {
      onPropertyTypeChange(propertyType === type ? null : type);
    }
  };

  const clearAllTypes = () => {
    if (allowMultiple && onPropertyTypesChange) {
      onPropertyTypesChange([]);
    } else {
      onPropertyTypeChange(null);
    }
  };

  const isSelected = (type: PropertyType) => {
    if (allowMultiple) {
      return propertyTypes.includes(type);
    }
    return propertyType === type;
  };

  const hasSelection = allowMultiple ? propertyTypes.length > 0 : propertyType !== null;

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Home className="h-4 w-4" /> Type de bien
        {allowMultiple && propertyTypes.length > 0 && (
          <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
            {propertyTypes.length}
          </span>
        )}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        <Button
          variant={!hasSelection ? "default" : "outline"}
          size="sm"
          className="text-xs h-7 px-2 whitespace-nowrap"
          onClick={clearAllTypes}
        >
          {allowMultiple ? "Aucun" : "Tous"}
        </Button>
        {availablePropertyTypes.filter(t => t !== null).map((type) => (
          <Button
            key={type}
            variant={isSelected(type as PropertyType) ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-2 whitespace-nowrap"
            onClick={() => togglePropertyType(type as PropertyType)}
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PropertyTypeFilter;
