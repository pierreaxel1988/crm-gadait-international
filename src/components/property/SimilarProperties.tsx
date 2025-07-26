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
  currentPropertyLocation?: string;
  limit?: number;
}

const SimilarProperties: React.FC<SimilarPropertiesProps> = ({
  currentPropertyId,
  currentPropertyCountry,
  currentPropertyType,
  currentPropertyPrice,
  currentPropertyLocation,
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
      
      // Fonction pour déterminer la région de Maurice basée sur la localisation
      const getMauritiusRegion = (location: string) => {
        const locationLower = location.toLowerCase();
        
        // Région Nord
        if (locationLower.includes('grand baie') || locationLower.includes('pereybere') || 
            locationLower.includes('cap malheureux') || locationLower.includes('grand bay') ||
            locationLower.includes('petit raffray') || locationLower.includes('mont mascal') ||
            locationLower.includes('pointe aux piments') || locationLower.includes('trou aux biches')) {
          return 'nord';
        }
        
        // Région Est
        if (locationLower.includes('belle mare') || locationLower.includes('palmar') || 
            locationLower.includes('trou d\'eau douce') || locationLower.includes('flacq') ||
            locationLower.includes('quatre cocos') || locationLower.includes('roches noires')) {
          return 'est';
        }
        
        // Région Sud
        if (locationLower.includes('bel ombre') || locationLower.includes('le morne') || 
            locationLower.includes('chamarel') || locationLower.includes('baie du cap') ||
            locationLower.includes('souillac') || locationLower.includes('st felix')) {
          return 'sud';
        }
        
        // Région Ouest
        if (locationLower.includes('rivière noire') || locationLower.includes('tamarin') || 
            locationLower.includes('wolmar') || locationLower.includes('flic en flac') ||
            locationLower.includes('albion') || locationLower.includes('mont choisy')) {
          return 'ouest';
        }
        
        // Région Centre (Port Louis et alentours)
        if (locationLower.includes('port louis') || locationLower.includes('beau bassin') || 
            locationLower.includes('rose hill') || locationLower.includes('quatre bornes') ||
            locationLower.includes('vacoas') || locationLower.includes('phoenix')) {
          return 'centre';
        }
        
        return 'unknown';
      };

      const currentRegion = currentPropertyCountry === 'Mauritius' && currentPropertyLocation 
        ? getMauritiusRegion(currentPropertyLocation) 
        : null;

      let query = supabase
        .from('gadait_properties')
        .select('id, title, price, currency, location, country, property_type, bedrooms, bathrooms, area, area_unit, main_image, images, url, is_featured, external_id, slug')
        .neq('id', currentPropertyId)
        .eq('is_available', true)
        .not('main_image', 'is', null)
        .limit(limit * 3); // Augmenter pour avoir plus de choix

      // Si c'est Maurice et qu'on a identifié une région, prioriser cette région
      if (currentPropertyCountry === 'Mauritius' && currentRegion && currentRegion !== 'unknown') {
        query = query.eq('country', 'Mauritius');
      } else if (currentPropertyCountry) {
        query = query.eq('country', currentPropertyCountry);
      }

      const { data: allProperties, error } = await query;
      
      if (error) {
        console.error('Error fetching similar properties:', error);
        return;
      }

      let similarProperties = allProperties || [];

      // Si c'est Maurice, trier par région pour prioriser la même région
      if (currentPropertyCountry === 'Mauritius' && currentRegion && currentRegion !== 'unknown') {
        similarProperties = similarProperties.sort((a, b) => {
          const regionA = getMauritiusRegion(a.location || '');
          const regionB = getMauritiusRegion(b.location || '');
          
          // Prioriser la même région
          if (regionA === currentRegion && regionB !== currentRegion) return -1;
          if (regionB === currentRegion && regionA !== currentRegion) return 1;
          
          // Puis par type de propriété si c'est la même région
          if (regionA === currentRegion && regionB === currentRegion) {
            if (currentPropertyType) {
              if (a.property_type === currentPropertyType && b.property_type !== currentPropertyType) return -1;
              if (b.property_type === currentPropertyType && a.property_type !== currentPropertyType) return 1;
            }
          }
          
          return 0;
        });
      } else {
        // Logique de tri existante pour les autres pays
        similarProperties = similarProperties.sort((a, b) => {
          if (currentPropertyType) {
            if (a.property_type === currentPropertyType && b.property_type !== currentPropertyType) return -1;
            if (b.property_type === currentPropertyType && a.property_type !== currentPropertyType) return 1;
          }
          return 0;
        });
      }

      // Filter out properties without essential data
      const completeProperties = similarProperties.filter(prop => {
        const hasImage = prop.main_image || (prop.images && prop.images.length > 0);
        const hasEssentialData = prop.title && prop.title.trim() !== '' && 
                                prop.location && prop.location.trim() !== '' &&
                                prop.price && prop.price > 0;
        const hasValidReference = !prop.external_id || 
                                 (!prop.external_id.startsWith('datocms-') && 
                                  !(prop.external_id.includes('-') && prop.external_id.length > 10));
        
        return hasImage && hasEssentialData && hasValidReference;
      });
      
      // Use only complete properties
      const finalProperties = completeProperties.slice(0, limit);
        
      setProperties(finalProperties);
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