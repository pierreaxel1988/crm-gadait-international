import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Bed, Bath, Home, Star, Globe, Hash, Maximize2, LandPlot, ChevronLeft, ChevronRight } from 'lucide-react';
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
    images?: string[];
    url: string;
    is_featured?: boolean;
    external_id?: string;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property
}) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Combine main image with other images, filter out empty values
  const allImages = property.main_image 
    ? [property.main_image, ...(property.images || [])].filter(Boolean)
    : (property.images || []).filter(Boolean);

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
    
    // Construire l'URL correcte vers gadait-international.com
    let targetUrl = 'https://gadait-international.com';
    
    // Si on a une référence externe valide, construire l'URL spécifique de la propriété
    if (property.external_id && !property.external_id.startsWith('datocms-')) {
      targetUrl = `https://gadait-international.com/propriete/${property.external_id}`;
    } else if (property.url && property.url.includes('gadait-international.com')) {
      // Utiliser l'URL existante si elle pointe déjà vers gadait-international.com
      targetUrl = property.url;
    }
    
    window.open(targetUrl, '_blank');
  };

  const changeImage = (newIndex: number) => {
    if (isTransitioning || newIndex === currentImageIndex) return;
    
    setIsTransitioning(true);
    setCurrentImageIndex(newIndex);
    
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    // Reset transition state after a short delay
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 150);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length > 1) {
      const newIndex = (currentImageIndex + 1) % allImages.length;
      changeImage(newIndex);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length > 1) {
      const newIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
      changeImage(newIndex);
    }
  };

  // Preload next and previous images for faster transitions
  React.useEffect(() => {
    if (allImages.length > 1) {
      const nextIndex = (currentImageIndex + 1) % allImages.length;
      const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
      
      // Preload next image
      const nextImg = new Image();
      nextImg.src = allImages[nextIndex];
      
      // Preload previous image
      const prevImg = new Image();
      prevImg.src = allImages[prevIndex];
    }
  }, [currentImageIndex, allImages]);

  const currentImage = allImages[currentImageIndex] || property.main_image;

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-500 border-loro-pearl bg-loro-white cursor-pointer hover:-translate-y-1 rounded-xl" onClick={handleCardClick}>
      {/* Image avec aspect ratio plus haut */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {currentImage ? (
          <>
            <div className="relative w-full h-full">
              <img 
                src={currentImage} 
                alt={property.title} 
                className={`w-full h-full object-cover transition-all duration-200 ease-out group-hover:scale-105 ${
                  isTransitioning ? 'opacity-90 scale-[1.02]' : 'opacity-100 scale-100'
                }`}
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }} 
              />
              
              {/* Fallback pour images cassées */}
              <div className="hidden absolute inset-0 bg-gradient-to-br from-loro-pearl to-loro-white flex items-center justify-center">
                <Home className="h-16 w-16 text-loro-navy/30" />
              </div>
            </div>
            
            {/* Overlay gradient amélioré */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            
            {/* Zones de navigation pour les images */}
            {allImages.length > 1 && (
              <>
                {/* Zone de clic gauche pour navigation précédente */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1/4 z-40 cursor-pointer flex items-center justify-start pl-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  onClick={prevImage}
                >
                  <div className="p-1 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all duration-150">
                    <ChevronLeft className="h-5 w-5 text-white transition-transform duration-150 hover:scale-110" />
                  </div>
                </div>
                
                {/* Zone de clic droite pour navigation suivante */}
                <div 
                  className="absolute right-0 top-0 bottom-0 w-1/4 z-40 cursor-pointer flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  onClick={nextImage}
                >
                  <div className="p-1 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all duration-150">
                    <ChevronRight className="h-5 w-5 text-white transition-transform duration-150 hover:scale-110" />
                  </div>
                </div>
              </>
            )}
            
            {/* Badges repositionnés */}
            <div className="absolute top-4 left-4 flex gap-2">
              {property.is_featured && (
                <Badge className="bg-loro-sand/95 text-loro-navy font-futura shadow-lg backdrop-blur-sm">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
              {property.property_type && (
                <Badge variant="outline" className="bg-loro-white/95 text-loro-navy border-loro-pearl font-futura backdrop-blur-sm">
                  {property.property_type}
                </Badge>
              )}
            </div>
            
            {/* Tag prix à droite */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura shadow-sm backdrop-blur-sm">
                {formatPrice(property.price, property.currency)}
              </Badge>
            </div>

            {/* Indicateur du nombre d'images */}
            {allImages.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <Badge className={`bg-black/50 text-white font-futura text-xs transition-all duration-150 ${
                  isTransitioning ? 'scale-110' : 'scale-100'
                }`}>
                  {currentImageIndex + 1} / {allImages.length}
                </Badge>
              </div>
            )}

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
            </div>
            
            {/* Tag terrain en bas à droite */}
            {property.land_area && (
              <div className="absolute bottom-4 right-4">
                <Badge variant="outline" className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura text-xs backdrop-blur-sm">
                  <LandPlot className="h-3 w-3 mr-1" />
                  {property.land_area} {property.land_area_unit || 'm²'}
                </Badge>
              </div>
            )}
          </>
        ) : <div className="w-full h-full bg-gradient-to-br from-loro-pearl to-loro-white flex items-center justify-center">
            <Home className="h-16 w-16 text-loro-navy/30" />
          </div>}
      </div>
      
      <CardContent className="p-5 space-y-4">
        {/* Titre et localisation condensés */}
        <div className="space-y-2">
          <h3 className="font-futura text-lg text-loro-navy line-clamp-2 transition-colors duration-300 font-medium">
            {property.title}
          </h3>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin className="h-4 w-4 text-loro-navy/60 flex-shrink-0" />
              <span className="text-sm text-loro-navy/70 font-futura truncate">
                {property.location || 'Localisation non spécifiée'}
              </span>
            </div>
            
            {property.country && property.country !== 'Non spécifié' && (
              <Badge variant="outline" className="bg-loro-pearl/30 text-loro-navy border-loro-pearl font-futura text-xs">
                <span className="mr-1">{countryToFlag(property.country)}</span>
                {property.country}
              </Badge>
            )}
          </div>

          {/* Référence si disponible */}
          {displayReference && (
            <div className="flex items-center gap-1 text-xs text-loro-navy/70">
              <Hash className="h-3 w-3 flex-shrink-0" />
              <span className="font-futura text-sm">Réf. {displayReference}</span>
            </div>
          )}
        </div>
        
        {/* CTA avec animation */}
        <Button 
          variant="outline" 
          className="w-full h-10 font-futura border-loro-sand text-loro-navy hover:bg-loro-sand hover:text-loro-navy hover:border-loro-hazel transition-all duration-300 hover:shadow-md" 
          onClick={handleExternalLinkClick}
        >
          <ExternalLink className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
          Voir sur Gadait
        </Button>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
