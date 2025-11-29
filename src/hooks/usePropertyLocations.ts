import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { normalizeCountryForDatoCMS } from '@/utils/propertyMatchingUtils';
import { getAllLocations, getLocationsByCountry } from '@/utils/locationsByCountry';

export const usePropertyLocations = (country?: string) => {
  return useQuery({
    queryKey: ['property-locations', country],
    queryFn: async () => {
      // If no country, return all locations from static file as fallback
      if (!country) {
        return getAllLocations();
      }

      // Normalize country for DatoCMS format
      const normalizedCountry = normalizeCountryForDatoCMS(country);
      
      if (!normalizedCountry) {
        // If normalization fails, use static data as fallback
        return getLocationsByCountry(country);
      }

      // Query DatoCMS properties for locations
      const { data, error } = await supabase
        .from('properties_backoffice')
        .select('location')
        .eq('country', normalizedCountry)
        .eq('status', 'published')
        .not('location', 'is', null);

      if (error) {
        console.error('Error fetching locations from DatoCMS:', error);
        // Fallback to static data on error
        return getLocationsByCountry(country);
      }

      if (!data || data.length === 0) {
        // No properties found for this country, use static data as fallback
        return getLocationsByCountry(country);
      }

      // Extract unique locations and sort alphabetically
      const uniqueLocations = [...new Set(data.map(p => p.location).filter(Boolean) as string[])];
      return uniqueLocations.sort((a, b) => a.localeCompare(b));
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: true,
  });
};
