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
import { ArrowLeft, ExternalLink, MapPin, Bed, Bath, Home, Star, Globe, Hash, Maximize2, Phone, Mail, Trees, Calendar, Layers, Play } from 'lucide-react';
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Récupérer les paramètres de retour
  const returnTo = searchParams.get('returnTo');
  const leadId = searchParams.get('leadId');

  useEffect(() => {
    fetchPropertyDetail();
  }, [id]);

  const fetchPropertyDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gadait_properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors du chargement de la propriété:', error);
        return;
      }

      setProperty(data);
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
      
      <div className={`pt-[144px] bg-white min-h-screen ${isMobile ? 'px-4' : 'px-[35px]'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header avec bouton retour */}
          <div className="mb-6">
            {returnTo === 'lead' && leadId ? (
              <Button 
                onClick={() => navigate(`/leads/${leadId}?tab=criteria`)} 
                variant="outline" 
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au lead
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/properties')} 
                variant="outline" 
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux propriétés
              </Button>
            )}
            
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-loro-navy mb-2">{property.title}</h1>
                <div className="flex items-center gap-2 text-loro-navy/70 mb-2">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">{property.location || 'Localisation non spécifiée'}</span>
                  {property.country && (
                    <>
                      <span>•</span>
                      <Globe className="h-4 w-4" />
                      <span>{property.country}</span>
                    </>
                  )}
                </div>
                {displayReference && (
                  <div className="flex items-center gap-1 text-sm text-loro-navy/60">
                    <Hash className="h-4 w-4" />
                    <span>Référence {displayReference}</span>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-loro-navy mb-2">
                  {formatPrice(property.price, property.currency)}
                </div>
                <div className="flex gap-2">
                  {property.is_featured && (
                    <Badge className="bg-loro-sand text-loro-navy">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {property.property_type && (
                    <Badge variant="outline" className="border-loro-pearl text-loro-navy">
                      {property.property_type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Nouvelle galerie photos */}
            <div className="lg:col-span-2">
              <PropertyGallery
                title={property.title}
                images={property.images || []}
                mainImage={property.main_image}
              />

              {/* Section vidéos YouTube */}
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

              {/* Description */}
              {property.description && (
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-loro-navy mb-4">Description</h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {property.description}
                      </p>
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
