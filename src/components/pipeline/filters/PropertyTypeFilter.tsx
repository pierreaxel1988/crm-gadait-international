
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { PropertyType } from '@/types/lead';

interface PropertyTypeFilterProps {
  propertyType: PropertyType | null;
  onPropertyTypeChange: (propertyType: PropertyType | null) => void;
}

const PropertyTypeFilter = ({ propertyType, onPropertyTypeChange }: PropertyTypeFilterProps) => {
  const propertyTypes: (PropertyType | null)[] = [
    null, 'Villa', 'Appartement', 'Penthouse', 'Maison', 'Duplex', 'Chalet', 
    'Terrain', 'Manoir', 'Maison de ville', 'Château', 'Local commercial', 
    'Commercial', 'Hotel', 'Vignoble', 'Autres'
  ];

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Home className="h-4 w-4" /> Type de bien
      </h4>
      <div className="grid grid-cols-3 gap-2 max-h-[100px] overflow-y-auto">
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
    </div>
  );
};

export default PropertyTypeFilter;
