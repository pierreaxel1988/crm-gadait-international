import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Bed, Bath, Home, Star, Globe, Maximize2, LandPlot, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { countryToFlag } from '@/utils/countryUtils';
import { getExternalPropertyUrl } from '@/utils/slugUtils';
interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    title_translations?: any;
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
    external_url?: string;
    is_featured?: boolean;
    external_id?: string;
    reference?: string;
    slug?: string;
    slug_fr?: string;
    slug_en?: string;
    source?: string;
    url?: string;
    url_fr?: string;
    url_en?: string;
  };
  returnTo?: string;
  leadId?: string;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (propertyId: string) => void;
  locale?: 'fr' | 'en';
}
const getLocalizedTitle = (property: PropertyCardProps['property'], locale: 'fr' | 'en' = 'fr'): string => {
  if (property.title_translations && typeof property.title_translations === 'object') {
    return property.title_translations[locale] || property.title;
  }
  return property.title;
};

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  returnTo,
  leadId,
  selectionMode = false,
  isSelected = false,
  locale = 'fr',
  onToggleSelection
}) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Combine main image with other images, filter out empty values
  const allImages = property.main_image ? [property.main_image, ...(property.images || [])].filter(Boolean) : (property.images || []).filter(Boolean);
  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Prix sur demande';

    // Format number with proper spacing for large amounts
    const formatted = price >= 1000000 ? `${(price / 1000000).toFixed(1)}M` : price >= 1000 ? `${(price / 1000).toFixed(0)}K` : price.toLocaleString();
    return `${formatted} ${currency || 'EUR'}`;
  };

  // Use reference column directly
  const displayReference = property.reference;
  const handleCardClick = (e: React.MouseEvent) => {
    // Si on est en mode sélection, on toggle la sélection
    if (selectionMode && onToggleSelection) {
      e.preventDefault();
      onToggleSelection(property.id);
      return;
    }

    // Sinon, navigation normale - utiliser le slug si disponible
    const propertyPath = property.slug || `id/${property.id}`;
    if (returnTo === 'lead' && leadId) {
      navigate(`/properties/${propertyPath}?returnTo=lead&leadId=${leadId}`);
    } else {
      navigate(`/properties/${propertyPath}`);
    }
  };
  const handleSelectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelection) {
      onToggleSelection(property.id);
    }
  };
  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Use utility function to get the correct URL
    const targetUrl = getExternalPropertyUrl(property, 'en');
    console.log('🌐 Opening external URL:', {
      title: property.title,
      source: property.source,
      url: targetUrl
    });
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
  return <Card className="group overflow-hidden hover:shadow-xl transition-all duration-500 border-loro-pearl bg-loro-white cursor-pointer hover:-translate-y-1 rounded-xl" onClick={handleCardClick}>
      {/* Image avec aspect ratio plus haut */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {currentImage ? <>
            <div className="relative w-full h-full">
              <img src={currentImage} alt={property.title} className={`w-full h-full object-cover transition-all duration-200 ease-out group-hover:scale-105 ${isTransitioning ? 'opacity-90 scale-[1.02]' : 'opacity-100 scale-100'}`} onError={e => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
          }} />
              
              {/* Fallback pour images cassées */}
              <div className="hidden absolute inset-0 bg-gradient-to-br from-loro-pearl to-loro-white flex items-center justify-center">
                <Home className="h-16 w-16 text-loro-navy/30" />
              </div>
            </div>
            
            {/* Overlay gradient amélioré */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            
            {/* Zones de navigation pour les images */}
            {allImages.length > 1 && <>
                {/* Zone de clic gauche pour navigation précédente */}
                <div className="absolute left-0 top-0 bottom-0 w-1/4 z-40 cursor-pointer flex items-center justify-start pl-2 opacity-0 group-hover:opacity-100 transition-all duration-200" onClick={prevImage}>
                  <div className="p-1 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all duration-150">
                    <ChevronLeft className="h-5 w-5 text-white transition-transform duration-150 hover:scale-110" />
                  </div>
                </div>
                
                {/* Zone de clic droite pour navigation suivante */}
                <div className="absolute right-0 top-0 bottom-0 w-1/4 z-40 cursor-pointer flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-all duration-200" onClick={nextImage}>
                  <div className="p-1 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all duration-150">
                    <ChevronRight className="h-5 w-5 text-white transition-transform duration-150 hover:scale-110" />
                  </div>
                </div>
              </>}
            
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
            
            {/* Prix en haut à droite */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura shadow-sm backdrop-blur-sm">
                {formatPrice(property.price, property.currency)}
              </Badge>
            </div>

            {/* Indicateur du nombre d'images */}
            {allImages.length > 1 && <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <Badge className={`bg-black/50 text-white font-futura text-xs transition-all duration-150 ${isTransitioning ? 'scale-110' : 'scale-100'}`}>
                  {currentImageIndex + 1} / {allImages.length}
                </Badge>
              </div>}

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
            
            {/* Checkbox de sélection et tag terrain en bas à droite */}
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
              {/* Cœur de sélection */}
              {selectionMode && <div onClick={handleSelectionClick} className={`group/heart relative p-3 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer border shadow-lg z-50 ${isSelected ? 'bg-gradient-to-br from-red-400/95 to-red-500/95 border-red-400/50 shadow-red-400/30' : 'bg-white/95 border-white/30 hover:bg-gradient-to-br hover:from-red-50/95 hover:to-white/95 hover:border-red-200/50'}`}>
                  {/* Effet de brillance au survol */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/heart:opacity-100 transition-opacity duration-300" />
                  
                  {/* Cœur */}
                  <Heart className={`relative z-10 h-5 w-5 transition-all duration-300 ${isSelected ? 'text-white fill-current scale-110' : 'text-red-400 group-hover/heart:text-red-500 group-hover/heart:scale-110'}`} />
                  
                  {/* Effet de pulsation pour les propriétés sélectionnées */}
                  {isSelected && <div className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-pulse" />}
                </div>}
              
              {/* Tag terrain */}
              {property.land_area && <Badge variant="outline" className="bg-loro-white/90 text-loro-navy border-loro-pearl font-futura text-xs backdrop-blur-sm">
                  <LandPlot className="h-3 w-3 mr-1" />
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
          <h3 className="font-futura text-lg text-loro-navy line-clamp-2 transition-colors duration-300 font-medium">
            {getLocalizedTitle(property, locale)}
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
          {displayReference && <div className="flex items-center gap-1 text-xs text-loro-navy/70">
              
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