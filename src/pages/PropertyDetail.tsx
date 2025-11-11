import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import PropertyGallery from '@/components/property/PropertyGallery';
import PropertyMap from '@/components/property/PropertyMap';
import YouTubePlayer from '@/components/property/YouTubePlayer';
import SimilarProperties from '@/components/property/SimilarProperties';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, MapPin, Bed, Bath, Home, Star, Globe, Hash, Maximize2, Phone, Mail, Trees, Calendar, Layers, Play, Heart, Expand, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingScreen from '@/components/layout/LoadingScreen';
interface PropertyDetail {
  id: string;
  external_id?: string;
  reference?: string;
  slug?: string;
  title: string;
  description?: string;
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
  images?: string[];
  features?: string[];
  amenities?: string[];
  external_url?: string;
  status?: string;
  is_featured?: boolean;
  video_urls?: string[];
  // Coordonnées GPS
  latitude?: number;
  longitude?: number;
  // Nouvelles propriétés pour plus de détails
  land_area?: number;
  land_area_unit?: string;
  floors?: number;
  construction_year?: number;
  rooms?: number;
  parking_spaces?: number;
  energy_class?: string;
  orientation?: string[];
}
const PropertyDetail = () => {
  const {
    id,
    slug
  } = useParams<{
    id?: string;
    slug?: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Récupérer les paramètres de retour
  const returnTo = searchParams.get('returnTo');
  const leadId = searchParams.get('leadId');
  useEffect(() => {
    if (slug || id) {
      fetchPropertyDetail();
    }
  }, [id, slug]);

  // Navigation au clavier pour les images
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!property) return;
      
      const allImages = [
        ...(property.main_image ? [property.main_image] : []),
        ...(property.images || [])
      ].filter((img, index, array) => array.indexOf(img) === index);
      
      if (allImages.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [property, currentImageIndex]);

  // Auto-play optionnel (commenté par défaut)
  // useEffect(() => {
  //   if (!property) return;
  //   const allImages = [
  //     ...(property.main_image ? [property.main_image] : []),
  //     ...(property.images || [])
  //   ].filter((img, index, array) => array.indexOf(img) === index);
  //   
  //   if (allImages.length <= 1) return;
  //   
  //   const interval = setInterval(() => {
  //     nextImage();
  //   }, 5000); // Change d'image toutes les 5 secondes
  //   
  //   return () => clearInterval(interval);
  // }, [property, currentImageIndex]);
  const fetchPropertyDetail = async () => {
    if (!slug && !id) return;
    try {
      setLoading(true);
      let query = supabase.from('properties_backoffice').select('*');
      if (slug) {
        // Try to find by slug first
        query = query.eq('slug', slug);
      } else if (id) {
        // Fallback to ID lookup
        query = query.eq('id', id);
      }
      const {
        data,
        error
      } = await query.single();
      if (error) {
        console.error('Erreur lors du chargement de la propriété:', error);
        return;
      }
      setProperty(data);

      // If accessed by ID but property has a slug, redirect to slug URL
      if (id && !slug && data?.slug) {
        const currentParams = searchParams.toString();
        navigate(`/properties/${data.slug}${currentParams ? `?${currentParams}` : ''}`, {
          replace: true
        });
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };
  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Prix sur demande';
    const formatted = price >= 1000000 ? `${(price / 1000000).toFixed(1)}M` : price >= 1000 ? `${(price / 1000).toFixed(0)}K` : price.toLocaleString();
    return `${formatted} ${currency || 'EUR'}`;
  };
  const getDisplayReference = () => {
    if (!property?.reference) return null;
    return property.reference;
  };

  // Navigation functions for image carousel avec transitions améliorées
  const nextImage = () => {
    if (!property || isImageTransitioning) return;
    
    setIsImageTransitioning(true);
    
    const allImages = [
      ...(property.main_image ? [property.main_image] : []),
      ...(property.images || [])
    ].filter((img, index, array) => array.indexOf(img) === index);
    
    setCurrentImageIndex((prev) => {
      const newIndex = (prev + 1) % allImages.length;
      return newIndex;
    });
    
    setTimeout(() => setIsImageTransitioning(false), 300);
  };

  const prevImage = () => {
    if (!property || isImageTransitioning) return;
    
    setIsImageTransitioning(true);
    
    const allImages = [
      ...(property.main_image ? [property.main_image] : []),
      ...(property.images || [])
    ].filter((img, index, array) => array.indexOf(img) === index);
    
    setCurrentImageIndex((prev) => {
      const newIndex = (prev - 1 + allImages.length) % allImages.length;
      return newIndex;
    });
    
    setTimeout(() => setIsImageTransitioning(false), 300);
  };

  // Gestion des gestes tactiles pour la navigation des images
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  const displayReference = getDisplayReference();
  if (loading) {
    return <LoadingScreen />;
  }
  if (!property) {
    return <div className="flex flex-col min-h-screen">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
          <SubNavigation />
        </div>
        <div className={`pt-[144px] bg-white min-h-screen ${isMobile ? 'px-4' : 'px-[35px]'}`}>
          <div className="max-w-7xl mx-auto text-center py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Propriété non trouvée</h1>
            <Button onClick={() => navigate('/properties')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux propriétés
            </Button>
          </div>
        </div>
      </div>;
  }
  return <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
        <SubNavigation />
      </div>
      
      {/* Hero Section - Image Carousel */}
      <div 
        className="relative h-[70vh] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {(() => {
          const allImages = [
            ...(property.main_image ? [property.main_image] : []),
            ...(property.images || [])
          ].filter((img, index, array) => array.indexOf(img) === index); // Remove duplicates

          const currentImage = allImages[currentImageIndex] || property.main_image;

          return (
            <>
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt={property.title} 
                  className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                    isImageTransitioning ? 'scale-105 opacity-90' : 'scale-100 opacity-100'
                  }`}
                  style={{
                    filter: isImageTransitioning ? 'blur(1px)' : 'blur(0px)'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-loro-sand/30 to-loro-pearl/50 flex items-center justify-center">
                  <Home className="h-32 w-32 text-loro-navy/30" />
                </div>
              )}

              {/* Navigation arrows - only show if there are multiple images */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white p-3 rounded-full transition-all duration-200 hover:scale-105"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white p-3 rounded-full transition-all duration-200 hover:scale-105"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {allImages.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              )}

              {/* Dots indicator */}
              {allImages.length > 1 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          );
        })()}
        
        {/* Overlay with action buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent">
          <div className={`absolute bottom-0 right-0 p-6 ${isMobile ? 'px-4' : 'px-[35px]'}`}>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-loro-navy" 
                onClick={() => {
                  console.log('Back button clicked');
                  if (returnTo) {
                    navigate(returnTo);
                  } else {
                    navigate('/properties');
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-loro-navy">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - All text content below hero */}
      <div className={`bg-white min-h-screen ${isMobile ? 'px-4' : 'px-[35px]'}`}>
        <div className="max-w-7xl mx-auto py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-black/60 text-sm mb-6">
            <Home className="h-4 w-4" />
            <span>/</span>
            <span>Buy</span>
            <span>/</span>
            <span>{property.country || 'Property'}</span>
            <span>/</span>
            <span>{property.location || 'Location'}</span>
          </div>
          
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-[32px] leading-[36px] font-normal text-loro-navy mb-6">
              {property.title}
            </h1>
            <div className="border-b border-loro-navy/20 w-full mb-8"></div>
          </div>
          
          {/* Price and Property Info Section */}
          <div className="mb-12">
            <div className="text-[24px] font-normal text-loro-navy mb-8">
              {formatPrice(property.price, property.currency)}
            </div>
            
            {/* Property Icons Row */}
            <div className="flex items-center gap-8 text-loro-navy/70">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <span>{property.property_type || 'Apartment'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5" />
                <span>{property.area ? `${property.area} m²` : '133 m²'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                <span>{property.bedrooms || '2'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5" />
                <span>{property.bathrooms || '2'}</span>
              </div>
              
              {property.floors && <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  <span>{property.floors}</span>
                </div>}
            </div>
          </div>
          
          {/* Description */}
          {property.description && <div className="mb-8">
              <div className="prose prose-gray max-w-none text-loro-navy/80 leading-relaxed">
                {property.description}
              </div>
            </div>}

          {/* Features and Amenities Badges Section */}
          <div className="mb-8">
            {/* Status and Reference */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-loro-navy/60 mb-2">Status</h3>
                <span className="text-loro-navy font-medium">Buy</span>
              </div>
              {displayReference && <div>
                  <h3 className="text-sm font-medium text-loro-navy/60 mb-2">Reference</h3>
                  <span className="text-loro-navy font-medium">{displayReference}</span>
                </div>}
            </div>


            {/* Amenities Tags */}
            {property.amenities && property.amenities.length > 0 && <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => <Badge key={index} variant="outline" className="border-loro-sand text-loro-navy text-xs px-3 py-1">
                      {amenity}
                    </Badge>)}
                </div>
              </div>}
          </div>

          {/* Gallery Section */}
          <div className="mb-12">
            <PropertyGallery title={property.title} images={property.images || []} mainImage={property.main_image} />
          </div>

          {/* Video Section */}
          {property.video_urls && property.video_urls.length > 0 && <div className="mb-12">
              <h2 className="text-xl font-semibold text-loro-navy mb-6 flex items-center gap-2">
                <Play className="h-5 w-5" />
                Vidéos de la propriété
              </h2>
              <div className="space-y-4">
                {property.video_urls.map((url, index) => <YouTubePlayer key={index} url={url} title={`${property.title} - Vidéo ${index + 1}`} className="w-full" />)}
              </div>
            </div>}

          {/* Detailed Characteristics Section */}
          <Card className="mb-8">
            
          </Card>

          {/* Location Map Section */}
          <PropertyMap 
            location={property.location} 
            country={property.country}
            latitude={property.latitude}
            longitude={property.longitude}
          />

          {/* Interested Section */}
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-loro-navy mb-4">
                Interested in this property?
              </h2>
              <div className="w-12 h-0.5 bg-loro-navy mx-auto mb-6"></div>
              <p className="text-loro-navy/70 mb-6 max-w-2xl mx-auto">
                For more information about this property, feel free to reach out to our expert team and we'll get in touch.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button className="bg-loro-sand hover:bg-loro-hazel text-loro-navy flex-1" onClick={() => {
                  // Construire l'URL correcte vers gadait-international.com avec le slug
                  let targetUrl = 'https://gadait-international.com';
                  
                  // Si on a un slug, construire l'URL spécifique de la propriété directement avec le slug
                  if (property.slug && property.slug.trim() !== '') {
                    targetUrl = `https://gadait-international.com/en/${property.slug}`;
                  } else if (property.external_url && property.external_url.includes('gadait-international.com')) {
                    // Utiliser l'URL existante si elle pointe déjà vers gadait-international.com
                    targetUrl = property.external_url;
                  }
                  
                  window.open(targetUrl, '_blank');
                }}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Learn more
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact us
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* You might also like section */}
          <div className="py-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-loro-navy mb-4">
                You might also like...
              </h2>
              <div className="w-12 h-0.5 bg-loro-navy mx-auto"></div>
            </div>
            
            <SimilarProperties
              currentPropertyId={property.id}
              currentPropertyCountry={property.country}
              currentPropertyType={property.property_type}
              currentPropertyPrice={property.price}
              limit={3}
            />
          </div>
        </div>
      </div>
    </div>;
};
export default PropertyDetail;