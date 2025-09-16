import React from 'react';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';
import { PropertyUse } from '@/types/lead';

interface PropertyUseFilterProps {
  propertyUse: PropertyUse | null;
  onPropertyUseChange: (use: PropertyUse | null) => void;
}

const propertyUses: PropertyUse[] = [
  'Investissement locatif',
  'Résidence principale'
];

const PropertyUseFilter: React.FC<PropertyUseFilterProps> = ({
  propertyUse,
  onPropertyUseChange
}) => {
  const handleUseSelect = (use: PropertyUse) => {
    if (propertyUse === use) {
      onPropertyUseChange(null);
    } else {
      onPropertyUseChange(use);
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Building className="h-4 w-4" /> Usage
        {propertyUse && (
          <span className="ml-1 text-primary font-medium">: {propertyUse}</span>
        )}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        <Button
          variant={!propertyUse ? "default" : "outline"}
          size="sm"
          className="text-xs h-7 px-3 min-w-0 whitespace-nowrap"
          onClick={() => onPropertyUseChange(null)}
        >
          Tous
        </Button>
        {propertyUses.map((use) => (
          <Button
            key={use}
            variant={propertyUse === use ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-3 min-w-0 whitespace-nowrap"
            onClick={() => handleUseSelect(use)}
          >
            {use}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PropertyUseFilter;