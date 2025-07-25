import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import PropertyGallery from '@/components/property/PropertyGallery';
import YouTubePlayer from '@/components/property/YouTubePlayer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, MapPin, Bed, Bath, Home, Star, Globe, Hash, Maximize2, Phone, Mail, Trees, Calendar, Layers, Play, Heart, Expand } from 'lucide-react';
import LoadingScreen from '@/components/layout/LoadingScreen';

interface PropertyDetail {
  id: string;
  external_id?: string;
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
  url: string;
  is_featured?: boolean;
  video_urls?: string[];
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
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Récupérer les paramètres de retour
  const returnTo = searchParams.get('returnTo');
  const leadId = searchParams.get('leadId');

  useEffect(() => {
    if (slug || id) {
      fetchPropertyDetail();
    }
  }, [id, slug]);

  const fetchPropertyDetail = async () => {
    if (!slug && !id) return;

    try {
      setLoading(true);
      let query = supabase.from('gadait_properties').select('*');
      
      if (slug) {
        // Try to find by slug first
        query = query.eq('slug', slug);
      } else if (id) {
        // Fallback to ID lookup
        query = query.eq('id', id);
      }
      
      const { data, error } = await query.single();

      if (error) {
        console.error('Erreur lors du chargement de la propriété:', error);
        return;
      }

      setProperty(data);
      
      // If accessed by ID but property has a slug, redirect to slug URL
      if (id && !slug && data?.slug) {
        const currentParams = searchParams.toString();
        navigate(`/properties/${data.slug}${currentParams ? `?${currentParams}` : ''}`, { replace: true });
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Prix sur demande';
    
    const formatted = price >= 1000000 
      ? `${(price / 1000000).toFixed(1)}M` 
      : price >= 1000 
      ? `${(price / 1000).toFixed(0)}K` 
      : price.toLocaleString();
    
    return `${formatted} ${currency || 'EUR'}`;
  };

  const getDisplayReference = () => {
    if (!property?.external_id) return null;
    if (property.external_id.startsWith('datocms-')) return null;
    return property.external_id;
  };

  const displayReference = getDisplayReference();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!property) {
    return (
      <div className="flex flex-col min-h-screen">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
        <SubNavigation />
      </div>
      
      {/* Hero Section - Image Only */}
      <div className="relative h-[70vh] overflow-hidden">
        {property.main_image ? (
          <img
            src={property.main_image}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-loro-sand/30 to-loro-pearl/50 flex items-center justify-center">
            <Home className="h-32 w-32 text-loro-navy/30" />
          </div>
        )}
        
        {/* Simple overlay for image enhancement */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent">
          <div className={`absolute bottom-0 right-0 p-6 ${isMobile ? 'px-4' : 'px-[35px]'}`}>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-loro-navy"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-loro-navy"
              >
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
          <div className="flex items-center gap-2 text-loro-navy/70 text-sm mb-6">
            <Home className="h-4 w-4" />
            <span>/</span>
            <span>Buy</span>
            <span>/</span>
            <span>{property.country || 'Property'}</span>
            <span>/</span>
            <span>{property.location || 'Location'}</span>
          </div>
          
          {/* Title and Reference */}
          <div className="mb-6">
            <h1 className="font-luxury text-[36px] leading-[40px] font-bold text-loro-navy mb-2">
              {property.title}
            </h1>
            {displayReference && (
              <div className="flex items-center gap-1 text-loro-navy/60 text-sm">
                <Hash className="h-4 w-4" />
                <span>Référence {displayReference}</span>
              </div>
            )}
          </div>
          
          {/* Price and Property Info Section */}
          <div className="mb-8">
            <div className="text-4xl font-bold text-loro-navy mb-6">
              {formatPrice(property.price, property.currency)}
            </div>
            
            {/* Property Icons Row */}
            <div className="flex items-center gap-8 text-loro-navy/70">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <span>{property.property_type || 'Apartment'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Expand className="h-5 w-5" />
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
              
              {property.floors && (
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  <span>{property.floors}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Description */}
          {property.description && (
            <div className="mb-8">
              <div className="prose prose-gray max-w-none text-loro-navy/80 leading-relaxed">
                {property.description}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gallery Section */}
            <div className="lg:col-span-2">
              <PropertyGallery
                title={property.title}
                images={property.images || []}
                mainImage={property.main_image}
              />

              {/* Video Section */}
              {property.video_urls && property.video_urls.length > 0 && (
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-loro-navy mb-4 flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Vidéos de la propriété
                    </h2>
                    <div className="space-y-4">
                      {property.video_urls.map((url, index) => (
                        <YouTubePlayer
                          key={index}
                          url={url}
                          title={`${property.title} - Vidéo ${index + 1}`}
                          className="w-full"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Sidebar avec détails */}
            <div className="space-y-6">
              {/* Caractéristiques principales */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-loro-navy mb-4">Caractéristiques</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Surface habitable */}
                    <div className="text-center p-3 bg-loro-pearl/30 rounded-lg transition-all duration-300 hover:bg-loro-sand/40 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
                      <Maximize2 className="h-6 w-6 text-loro-navy mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
                      <div className="text-sm text-loro-navy/60">Surface</div>
                      <div className="font-semibold text-loro-navy">
                        {property.area ? `${property.area} ${property.area_unit || 'm²'}` : 'N/A'}
                      </div>
                    </div>
                    
                    {/* Terrain (si disponible) */}
                    {property.land_area && (
                      <div className="text-center p-3 bg-loro-pearl/30 rounded-lg transition-all duration-300 hover:bg-loro-sand/40 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
                        <Trees className="h-6 w-6 text-loro-navy mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
                        <div className="text-sm text-loro-navy/60">Terrain</div>
                        <div className="font-semibold text-loro-navy">
                          {property.land_area} {property.land_area_unit || 'm²'}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center p-3 bg-loro-pearl/30 rounded-lg transition-all duration-300 hover:bg-loro-sand/40 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
                      <Bed className="h-6 w-6 text-loro-navy mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
                      <div className="text-sm text-loro-navy/60">Chambres</div>
                      <div className="font-semibold text-loro-navy">
                        {property.bedrooms || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-loro-pearl/30 rounded-lg transition-all duration-300 hover:bg-loro-sand/40 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
                      <Bath className="h-6 w-6 text-loro-navy mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
                      <div className="text-sm text-loro-navy/60">Salles de bain</div>
                      <div className="font-semibold text-loro-navy">
                        {property.bathrooms || 'N/A'}
                      </div>
                    </div>

                    {/* Nombre d'étages */}
                    {property.floors && (
                      <div className="text-center p-3 bg-loro-pearl/30 rounded-lg transition-all duration-300 hover:bg-loro-sand/40 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
                        <Layers className="h-6 w-6 text-loro-navy mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
                        <div className="text-sm text-loro-navy/60">Étages</div>
                        <div className="font-semibold text-loro-navy">
                          {property.floors}
                        </div>
                      </div>
                    )}

                    {/* Année de construction */}
                    {property.construction_year && (
                      <div className="text-center p-3 bg-loro-pearl/30 rounded-lg transition-all duration-300 hover:bg-loro-sand/40 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
                        <Calendar className="h-6 w-6 text-loro-navy mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
                        <div className="text-sm text-loro-navy/60">Construction</div>
                        <div className="font-semibold text-loro-navy">
                          {property.construction_year}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informations supplémentaires */}
                  {(property.rooms || property.parking_spaces || property.energy_class) && (
                    <div className="mt-4 pt-4 border-t border-loro-pearl/50">
                      <div className="grid grid-cols-1 gap-3">
                        {property.rooms && (
                          <div className="flex justify-between">
                            <span className="text-loro-navy/60">Nombre de pièces</span>
                            <span className="font-medium text-loro-navy">{property.rooms}</span>
                          </div>
                        )}
                        {property.parking_spaces && (
                          <div className="flex justify-between">
                            <span className="text-loro-navy/60">Places de parking</span>
                            <span className="font-medium text-loro-navy">{property.parking_spaces}</span>
                          </div>
                        )}
                        {property.energy_class && (
                          <div className="flex justify-between">
                            <span className="text-loro-navy/60">Classe énergétique</span>
                            <span className="font-medium text-loro-navy">{property.energy_class}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Équipements */}
              {property.features && property.features.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-loro-navy mb-4">Équipements</h2>
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="bg-loro-pearl/50 text-loro-navy">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Commodités */}
              {property.amenities && property.amenities.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-loro-navy mb-4">Commodités</h2>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="border-loro-sand text-loro-navy">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Button
                    className="w-full bg-loro-sand hover:bg-loro-hazel text-loro-navy"
                    onClick={() => window.open(property.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir sur le site Gadait
                  </Button>
                  
                  <div className="pt-4 border-t border-loro-pearl">
                    <p className="text-sm text-loro-navy/60 mb-3">Intéressé par cette propriété ?</p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Appeler
                      </Button>
                      <Button variant="outline" className="flex-1" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
