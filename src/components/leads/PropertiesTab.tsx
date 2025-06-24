
import React, { useEffect, useState } from 'react';
import { LeadDetailed } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Home, Bath, Bed } from 'lucide-react';

interface GadaitProperty {
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
  is_available?: boolean;
  is_featured?: boolean;
}

interface PropertiesTabProps {
  leadId: string;
  lead: LeadDetailed;
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({ leadId, lead }) => {
  const [properties, setProperties] = useState<GadaitProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGadaitProperties();
  }, []);

  const fetchGadaitProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gadait_properties')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      setProperties(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des propriétés:', err);
      setError('Erreur lors du chargement des propriétés');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Prix sur demande';
    return `${price.toLocaleString()} ${currency || 'EUR'}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Propriétés Gadait</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-loro-navy"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Propriétés Gadait</h2>
        <div className="text-center py-8 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Propriétés Gadait</h2>
        <Badge variant="secondary">{properties.length} propriétés</Badge>
      </div>
      
      {properties.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune propriété disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {property.main_image && (
                <div className="aspect-video relative">
                  <img
                    src={property.main_image}
                    alt={property.title}
                    className="w-full h-full object-cover"
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
                        <span>{property.area} {property.area_unit}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {property.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {property.description}
                  </p>
                )}
                
                {property.features && property.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {property.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {property.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{property.features.length - 3}
                      </Badge>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesTab;
