
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Bed, Bath, Home, Star, Globe, Hash, Maximize2 } from 'lucide-react';

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
    external_id?: string;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Prix sur demande';
    
    // Format number with proper spacing for large amounts
    const formatted = price >= 1000000 
      ? `${(price / 1000000).toFixed(1)}M` 
      : price >= 1000 
      ? `${(price / 1000).toFixed(0)}K` 
      : price.toLocaleString();
    
    return `${formatted} ${currency || 'EUR'}`;
  };

  return (
    <Card className="group overflow-hidden hover:shadow-luxury-hover transition-all duration-300 border-loro-pearl bg-loro-white">
      {/* Image avec overlay */}
      <div className="relative aspect-video overflow-hidden">
        {property.main_image ? (
          <>
            <img
              src={property.main_image}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            {/* Fallback pour images cassées */}
            <div className="hidden absolute inset-0 bg-gradient-to-br from-loro-pearl to-loro-white flex items-center justify-center">
              <Home className="h-12 w-12 text-loro-navy/30" />
            </div>
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {property.is_featured && (
                <Badge className="bg-loro-sand text-loro-navy font-futura shadow-lg">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {property.property_type && (
                <Badge variant="outline" className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura">
                  {property.property_type}
                </Badge>
              )}
            </div>
            
            {/* Prix en overlay */}
            <div className="absolute bottom-3 left-3">
              <div className="bg-loro-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                <span className="text-lg font-semibold text-loro-navy font-futura">
                  {formatPrice(property.price, property.currency)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-loro-pearl to-loro-white flex items-center justify-center">
            <Home className="h-12 w-12 text-loro-navy/30" />
          </div>
        )}
      </div>
      
      <CardContent className="p-5 space-y-4">
        {/* Caractéristiques principales en haut */}
        <div className="grid grid-cols-4 gap-3 border-b border-loro-pearl pb-3">
          {/* Type de propriété */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-loro-pearl rounded-lg mb-1">
              <Home className="h-4 w-4 text-loro-navy" />
            </div>
            <span className="text-xs text-loro-navy/70 font-futura">
              {property.property_type || 'N/A'}
            </span>
          </div>
          
          {/* Surface */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-loro-pearl rounded-lg mb-1">
              <Maximize2 className="h-4 w-4 text-loro-navy" />
            </div>
            <span className="text-xs text-loro-navy/70 font-futura">
              {property.area ? `${property.area} ${property.area_unit || 'm²'}` : 'N/A'}
            </span>
          </div>
          
          {/* Chambres */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-loro-pearl rounded-lg mb-1">
              <Bed className="h-4 w-4 text-loro-navy" />
            </div>
            <span className="text-xs text-loro-navy/70 font-futura">
              {property.bedrooms || 'N/A'}
            </span>
          </div>
          
          {/* Salles de bain */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-loro-pearl rounded-lg mb-1">
              <Bath className="h-4 w-4 text-loro-navy" />
            </div>
            <span className="text-xs text-loro-navy/70 font-futura">
              {property.bathrooms || 'N/A'}
            </span>
          </div>
        </div>
        
        {/* Titre et prix */}
        <div>
          <h3 className="font-futura font-medium text-lg text-loro-navy line-clamp-2 mb-2 group-hover:text-loro-hazel transition-colors">
            {property.title}
          </h3>
          
          {/* Prix si pas déjà affiché en overlay */}
          {!property.main_image && (
            <div className="mb-3">
              <span className="text-xl font-semibold text-loro-navy font-futura">
                {formatPrice(property.price, property.currency)}
              </span>
            </div>
          )}
          
          <div className="space-y-2">
            {/* Localisation principale */}
            <div className="flex items-center gap-1 text-sm text-loro-navy/70">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="font-futura truncate">
                {property.location && property.country 
                  ? `${property.location}, ${property.country}`
                  : property.location || property.country || 'Localisation non spécifiée'
                }
              </span>
            </div>
            
            {/* Informations supplémentaires : Référence */}
            {property.external_id && (
              <div className="flex items-center gap-1 text-xs text-loro-navy/60">
                <Hash className="h-3 w-3 flex-shrink-0" />
                <span className="font-futura">Référence {property.external_id}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* CTA */}
        <Button
          variant="outline"
          className="w-full h-10 font-futura border-loro-sand text-loro-navy hover:bg-loro-sand hover:text-loro-navy transition-all duration-200"
          onClick={() => window.open(property.url, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Découvrir la propriété
        </Button>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
