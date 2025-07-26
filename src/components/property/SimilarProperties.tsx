import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Bed, Bath, Maximize2, MapPin, ExternalLink } from 'lucide-react';

interface Property {
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
  main_image?: string;
  slug?: string;
  url: string;
}

interface SimilarPropertiesProps {
  currentPropertyId: string;
  currentPropertyCountry?: string;
  currentPropertyType?: string;
  currentPropertyPrice?: number;
  limit?: number;
}

const SimilarProperties: React.FC<SimilarPropertiesProps> = ({
  currentPropertyId,
  currentPropertyCountry,
  currentPropertyType,
  currentPropertyPrice,
  limit = 3
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSimilarProperties();
  }, [currentPropertyId, currentPropertyCountry, currentPropertyType]);

  const fetchSimilarProperties = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('gadait_properties')
        .select('id, title, price, currency, location, country, property_type, bedrooms, bathrooms, area, main_image, slug, url')
        .neq('id', currentPropertyId)
        .eq('is_available', true)
        .limit(limit);

      // First try to find properties in the same country
      if (currentPropertyCountry) {
        query = query.eq('country', currentPropertyCountry);
      }

      const { data: countryProperties, error: countryError } = await query;
      
      if (countryError) {
        console.error('Error fetching similar properties:', countryError);
        return;
      }

      let similarProperties = countryProperties || [];

      // If we don't have enough properties from the same country, add some from the same type
      if (similarProperties.length < limit && currentPropertyType) {
        const remainingLimit = limit - similarProperties.length;
        const excludeIds = similarProperties.map(p => p.id).concat([currentPropertyId]);
        
        const { data: typeProperties } = await supabase
          .from('gadait_properties')
          .select('id, title, price, currency, location, country, property_type, bedrooms, bathrooms, area, main_image, slug, url')
          .eq('property_type', currentPropertyType)
          .eq('is_available', true)
          .not('id', 'in', `(${excludeIds.join(',')})`)
          .limit(remainingLimit);

        if (typeProperties) {
          similarProperties = [...similarProperties, ...typeProperties];
        }
      }

      // If still not enough, fill with any available properties
      if (similarProperties.length < limit) {
        const remainingLimit = limit - similarProperties.length;
        const excludeIds = similarProperties.map(p => p.id).concat([currentPropertyId]);
        
        const { data: anyProperties } = await supabase
          .from('gadait_properties')
          .select('id, title, price, currency, location, country, property_type, bedrooms, bathrooms, area, main_image, slug, url')
          .eq('is_available', true)
          .not('id', 'in', `(${excludeIds.join(',')})`)
          .limit(remainingLimit);

        if (anyProperties) {
          similarProperties = [...similarProperties, ...anyProperties];
        }
      }

      setProperties(similarProperties);
    } catch (error) {
      console.error('Error fetching similar properties:', error);
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

  const handlePropertyClick = (property: Property) => {
    if (property.slug) {
      navigate(`/properties/${property.slug}`);
    } else {
      navigate(`/properties/${property.id}`);
    }
  };

  const handleLearnMoreClick = (property: Property, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Construire l'URL correcte vers gadait-international.com avec le slug
    let targetUrl = 'https://gadait-international.com';
    
    if (property.slug && property.slug.trim() !== '') {
      targetUrl = `https://gadait-international.com/en/${property.slug}`;
    } else if (property.url && property.url.includes('gadait-international.com')) {
      targetUrl = property.url;
    }
    
    window.open(targetUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-[4/3] bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-loro-navy/60">Aucune propriété similaire trouvée pour le moment</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card 
          key={property.id} 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          onClick={() => handlePropertyClick(property)}
        >
          {/* Image */}
          <div className="aspect-[4/3] overflow-hidden">
            {property.main_image ? (
              <img
                src={property.main_image}
                alt={property.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-loro-sand/30 to-loro-pearl/50 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-loro-navy/30" />
              </div>
            )}
          </div>

          <CardContent className="p-4">
            {/* Title */}
            <h3 className="font-medium text-loro-navy text-sm mb-2 line-clamp-2 leading-tight">
              {property.title}
            </h3>

            {/* Location */}
            {property.location && (
              <div className="flex items-center gap-1 text-xs text-loro-navy/60 mb-3">
                <MapPin className="h-3 w-3" />
                <span>{property.location}, {property.country}</span>
              </div>
            )}

            {/* Property info */}
            <div className="flex items-center gap-3 text-xs text-loro-navy/70 mb-3">
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="h-3 w-3" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-3 w-3" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              
              {property.area && (
                <div className="flex items-center gap-1">
                  <Maximize2 className="h-3 w-3" />
                  <span>{property.area} m²</span>
                </div>
              )}
            </div>

            {/* Property type badge */}
            {property.property_type && (
              <Badge variant="outline" className="text-xs mb-3 border-loro-sand text-loro-navy">
                {property.property_type}
              </Badge>
            )}

            {/* Price and Learn More */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-loro-navy">
                {formatPrice(property.price, property.currency)}
              </div>
              
              <Button
                size="sm"
                variant="outline"
                className="text-xs px-3 py-1 h-7 border-loro-sand text-loro-navy hover:bg-loro-sand"
                onClick={(e) => handleLearnMoreClick(property, e)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Voir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SimilarProperties;