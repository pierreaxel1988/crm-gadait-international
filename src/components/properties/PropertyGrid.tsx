
import React from 'react';
import { Property } from '@/types/property';
import PropertyCard from './PropertyCard';

interface PropertyGridProps {
  properties: Property[];
  selectedProperties?: string[];
  onSelectProperty?: (propertyId: string) => void;
  showSelectButton?: boolean;
}

const PropertyGrid = ({
  properties,
  selectedProperties = [],
  onSelectProperty,
  showSelectButton = false
}: PropertyGridProps) => {
  if (properties.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Aucune propriété trouvée</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map(property => (
        <PropertyCard
          key={property.id}
          property={property}
          isSelected={selectedProperties.includes(property.id)}
          onSelect={() => onSelectProperty && onSelectProperty(property.id)}
          showSelectButton={showSelectButton}
        />
      ))}
    </div>
  );
};

export default PropertyGrid;
