
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { PropertyType } from '@/types/lead';
import FilterGroup from './FilterGroup';

interface PropertyTypeFilterProps {
  propertyType: PropertyType | null;
  onPropertyTypeChange: (propertyType: PropertyType | null) => void;
  className?: string;
}

const PropertyTypeFilter = ({ 
  propertyType, 
  onPropertyTypeChange,
  className
}: PropertyTypeFilterProps) => {
  // Tous les types de propriétés disponibles
  const propertyTypes: (PropertyType | null)[] = [
    null, 'Villa', 'Appartement', 'Penthouse', 'Maison', 'Duplex', 'Chalet', 
    'Terrain', 'Manoir', 'Maison de ville', 'Château', 'Local commercial', 
    'Commercial', 'Hotel', 'Vignoble', 'Autres'
  ];

  return (
    <FilterGroup className={className}>
      <div className="flex items-center gap-2 text-sm">
        <Home className="h-4 w-4" />
        <span className="font-medium">Type de bien</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 max-h-[120px] overflow-y-auto pr-1">
        <Button
          variant={propertyType === null ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => onPropertyTypeChange(null)}
        >
          Tous
        </Button>
        {propertyTypes.filter(t => t !== null).map((type) => (
          <Button
            key={type}
            variant={propertyType === type ? "default" : "outline"}
            size="sm"
            className="text-xs truncate"
            onClick={() => onPropertyTypeChange(type as PropertyType)}
          >
            {type}
          </Button>
        ))}
      </div>
    </FilterGroup>
  );
};

export default PropertyTypeFilter;
