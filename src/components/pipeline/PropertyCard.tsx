
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Bed, Bath, Home } from 'lucide-react';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price?: number;
    currency?: string;
    location?: string;
    country?: string;
    property_type?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    area_unit?: string;
    main_image?: string;
    url: string;
    is_featured?: boolean;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Prix sur demande';
    return `${price.toLocaleString()} ${currency || 'EUR'}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {property.main_image && (
        <div className="aspect-video relative">
          <img
            src={property.main_image}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {property.is_featured && (
            <Badge className="absolute top-2 left-2 bg-loro-navy">
              Featured
            </Badge>
          )}
        </div>
      )}
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">
          {property.title}
        </CardTitle>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{property.location || property.country}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-loro-navy">
            {formatPrice(property.price, property.currency)}
          </span>
          {property.property_type && (
            <Badge variant="outline">
              {property.property_type}
            </Badge>
          )}
        </div>
        
        {(property.bedrooms || property.bathrooms || property.area) && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.area && (
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>{property.area} {property.area_unit}</span>
              </div>
            )}
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => window.open(property.url, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Voir la propriété
        </Button>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
