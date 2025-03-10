
import React from 'react';
import { Property } from '@/types/property';
import { MapPin, Home, Bed, Bath, Square, Euro } from 'lucide-react';
import CustomButton from '@/components/ui/CustomButton';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  onSelect?: () => void;
  showSelectButton?: boolean;
  className?: string;
}

const PropertyCard = ({
  property,
  isSelected = false,
  onSelect,
  showSelectButton = false,
  className
}: PropertyCardProps) => {
  const formatPrice = (price?: number) => {
    if (!price) return 'Prix sur demande';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: property.currency || 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div 
      className={cn(
        'luxury-card p-0 overflow-hidden transition-all hover:shadow-luxury', 
        isSelected && 'ring-2 ring-chocolate-dark',
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-loro-sand flex items-center justify-center">
            <Home className="h-12 w-12 text-loro-navy/50" />
          </div>
        )}
        {showSelectButton && (
          <div className="absolute top-2 right-2">
            <CustomButton
              variant={isSelected ? "chocolate" : "outline"}
              size="sm"
              onClick={onSelect}
              className="rounded-full aspect-square p-2 bg-white/70 border-chocolate-dark hover:bg-white"
            >
              {isSelected ? (
                <div className="h-4 w-4 rounded-full bg-chocolate-dark"></div>
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-chocolate-dark"></div>
              )}
            </CustomButton>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-loro-navy truncate">{property.title}</h3>
          <span className="text-chocolate-dark font-semibold">
            {formatPrice(property.price)}
          </span>
        </div>
        
        {property.location && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span>{property.location}{property.country ? `, ${property.country}` : ''}</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
          {property.property_type && (
            <div className="flex items-center">
              <Home className="h-3.5 w-3.5 mr-1" />
              <span>{property.property_type}</span>
            </div>
          )}
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="h-3.5 w-3.5 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-3.5 w-3.5 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center">
              <Square className="h-3.5 w-3.5 mr-1" />
              <span>{property.area} {property.area_unit || 'm²'}</span>
            </div>
          )}
        </div>
        
        {!showSelectButton && property.url && (
          <div className="mt-4">
            <CustomButton
              variant="chocolate"
              className="w-full"
              onClick={() => window.open(property.url, '_blank')}
            >
              Voir le détail
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
