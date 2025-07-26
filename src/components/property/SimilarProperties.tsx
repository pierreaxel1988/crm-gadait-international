import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PropertyCard from '@/components/pipeline/PropertyCard';

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
  area_unit?: string;
  main_image?: string;
  images?: string[];
  url: string;
  is_featured?: boolean;
  external_id?: string;
  slug?: string;
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

  useEffect(() => {
    fetchSimilarProperties();
  }, [currentPropertyId, currentPropertyCountry, currentPropertyType]);

  const fetchSimilarProperties = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('gadait_properties')
        .select('id, title, price, currency, location, country, property_type, bedrooms, bathrooms, area, area_unit, main_image, images, url, is_featured, external_id, slug')
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
          .select('id, title, price, currency, location, country, property_type, bedrooms, bathrooms, area, area_unit, main_image, images, url, is_featured, external_id, slug')
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
          .select('id, title, price, currency, location, country, property_type, bedrooms, bathrooms, area, area_unit, main_image, images, url, is_featured, external_id, slug')
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

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/3] bg-loro-pearl/30 rounded-t-xl"></div>
            <div className="p-5 space-y-4 bg-white rounded-b-xl border border-t-0 border-loro-pearl">
              <div className="space-y-2">
                <div className="h-5 bg-loro-pearl/30 rounded w-3/4"></div>
                <div className="h-4 bg-loro-pearl/30 rounded w-1/2"></div>
              </div>
              <div className="h-10 bg-loro-pearl/30 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-loro-navy/60 font-futura">Aucune propriété similaire trouvée pour le moment</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard 
          key={property.id} 
          property={property}
        />
      ))}
    </div>
  );
};

export default SimilarProperties;