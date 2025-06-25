import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Bed, Bath, Home, Star, Globe, Hash, Maximize2, TreePine } from 'lucide-react';
import { countryToFlag } from '@/utils/countryUtils';
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
    land_area?: number;
    land_area_unit?: string;
    main_image?: string;
    url: string;
    is_featured?: boolean;
    external_id?: string;
  };
}
const PropertyCard: React.FC<PropertyCardProps> = ({
  property
}) => {
  const navigate = useNavigate();
  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Prix sur demande';

    // Format number with proper spacing for large amounts
    const formatted = price >= 1000000 ? `${(price / 1000000).toFixed(1)}M` : price >= 1000 ? `${(price / 1000).toFixed(0)}K` : price.toLocaleString();
    return `${formatted} ${currency || 'EUR'}`;
  };

  // Fonction pour déterminer si on doit afficher la référence et comment
  const getDisplayReference = () => {
    if (!property.external_id) return null;

    // Si c'est une référence auto-générée (commence par 'datocms-'), ne pas l'afficher
    if (property.external_id.startsWith('datocms-')) {
      return null;
    }

    // Sinon, afficher la référence telle quelle (qu'elle soit numérique ou textuelle)
    return property.external_id;
  };
  const displayReference = getDisplayReference();
  const handleCardClick = () => {
    navigate(`/properties/${property.id}`);
  };
  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(property.url, '_blank');
  };
  return <Card className="group overflow-hidden hover:shadow-xl transition-all duration-500 border-loro-pearl bg-loro-white cursor-pointer hover:-translate-y-1 rounded-xl" onClick={handleCardClick}>
      {/* Image avec aspect ratio plus haut */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {property.main_image ? <>
            <img src={property.main_image} alt={property.title} className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" onError={e => {
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
        }} />
            {/* Fallback pour images cassées */}
            <div className="hidden absolute inset-0 bg-gradient-to-br from-loro-pearl to-loro-white flex items-center justify-center">
              <Home className="h-16 w-16 text-loro-navy/30" />
            </div>
            
            {/* Overlay gradient amélioré */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            
            {/* Badges repositionnés */}
            <div className="absolute top-4 left-4 flex gap-2">
              {property.is_featured && <Badge className="bg-loro-sand/95 text-loro-navy font-futura shadow-lg backdrop-blur-sm">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Featured
                </Badge>}
              {property.property_type && <Badge variant="outline" className="bg-loro-white/95 text-loro-navy border-loro-pearl font-futura backdrop-blur-sm">
                  {property.property_type}
                </Badge>}
            </div>
            
            {/* Tag prix à droite */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura shadow-sm backdrop-blur-sm">
                {formatPrice(property.price, property.currency)}
              </Badge>
            </div>

            {/* Tags des caractéristiques en bas de l'image */}
            <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
              <Badge variant="outline" className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura text-xs backdrop-blur-sm">
                <Maximize2 className="h-3 w-3 mr-1" />
                {property.area ? `${property.area} ${property.area_unit || 'm²'}` : 'N/A'}
              </Badge>
              <Badge variant="outline" className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura text-xs backdrop-blur-sm">
                <Bed className="h-3 w-3 mr-1" />
                {property.bedrooms || 'N/A'}
              </Badge>
              <Badge variant="outline" className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura text-xs backdrop-blur-sm">
                <Bath className="h-3 w-3 mr-1" />
                {property.bathrooms || 'N/A'}
              </Badge>
              {property.land_area && <Badge variant="outline" className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura text-xs backdrop-blur-sm">
                  <TreePine className="h-3 w-3 mr-1" />
                  {property.land_area} {property.land_area_unit || 'm²'}
                </Badge>}
            </div>
          </> : <div className="w-full h-full bg-gradient-to-br from-loro-pearl to-loro-white flex items-center justify-center">
            <Home className="h-16 w-16 text-loro-navy/30" />
          </div>}
      </div>
      
      <CardContent className="p-5 space-y-4">
        {/* Titre et localisation condensés */}
        <div className="space-y-2">
          <h3 className="font-futura text-lg text-loro-navy line-clamp-2 group-hover:text-loro-500 transition-colors duration-300 font-medium">
            {property.title}
          </h3>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin className="h-4 w-4 text-loro-navy/60 flex-shrink-0" />
              <span className="text-sm text-loro-navy/70 font-futura truncate">
                {property.location || 'Localisation non spécifiée'}
              </span>
            </div>
            
            {property.country && property.country !== 'Non spécifié' && <Badge variant="outline" className="bg-loro-pearl/30 text-loro-navy border-loro-pearl font-futura text-xs">
                <span className="mr-1">{countryToFlag(property.country)}</span>
                {property.country}
              </Badge>}
          </div>

          {/* Référence si disponible */}
          {displayReference && <div className="flex items-center gap-1 text-xs text-loro-navy/50">
              <Hash className="h-3 w-3 flex-shrink-0" />
              <span className="font-futura text-sm">Réf. {displayReference}</span>
            </div>}
        </div>
        
        {/* CTA avec animation */}
        <Button variant="outline" className="w-full h-10 font-futura border-loro-sand text-loro-navy hover:bg-loro-sand hover:text-loro-navy hover:border-loro-hazel transition-all duration-300 hover:shadow-md" onClick={handleExternalLinkClick}>
          <ExternalLink className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
          Voir sur Gadait
        </Button>
      </CardContent>
    </Card>;
};
export default PropertyCard;