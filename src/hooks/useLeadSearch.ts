
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

export interface SearchResult {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  desiredLocation?: string;
  pipelineType?: string;
}

export function useLeadSearch(initialSearchTerm: string = '') {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const searchLeads = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('id, name, email, phone, status, desired_location, pipeline_type')
          .or(`name.ilike.%${debouncedSearchTerm}%, email.ilike.%${debouncedSearchTerm}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error searching leads:', error);
          setResults([]);
        } else {
          const formattedResults: SearchResult[] = data.map(lead => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            status: lead.status,
            desiredLocation: lead.desired_location,
            pipelineType: lead.pipeline_type
          }));
          
          setResults(formattedResults);
        }
      } catch (error) {
        console.error('Unexpected error during search:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchLeads();
  }, [debouncedSearchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading
  };
}
