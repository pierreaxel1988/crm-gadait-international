
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCountriesFromDatabase = () => {
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('leads')
          .select('country')
          .not('country', 'is', null)
          .order('country');

        if (error) {
          console.error('Error fetching countries:', error);
          setError(error.message);
          return;
        }

        // Extract unique countries
        const uniqueCountries = Array.from(
          new Set(data.map(item => item.country).filter(Boolean))
        ).sort();

        setCountries(uniqueCountries);
      } catch (err) {
        console.error('Error in fetchCountries:', err);
        setError('Failed to fetch countries');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};
