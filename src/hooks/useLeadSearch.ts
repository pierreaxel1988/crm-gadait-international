
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

export interface SearchResult {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  phoneCountryCodeDisplay?: string;
  status?: string;
  desiredLocation?: string;
  pipelineType?: string;
  nationality?: string;
  source?: string;
  taxResidence?: string;
  preferredLanguage?: string;
  propertyReference?: string;
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
        // Diviser les termes de recherche en mots pour rechercher prénom/nom séparément
        const searchTerms = debouncedSearchTerm.split(' ').filter(term => term.length > 0);
        
        // Use only columns that we know exist in the database
        let query = supabase
          .from('leads')
          .select('id, name, email, phone, status, desired_location, pipeline_type, nationality, source')
          .order('created_at', { ascending: false })
          .limit(10);
        
        // Construction de la clause OR pour la recherche
        let orConditions = [];
        
        // Recherche par email
        orConditions.push(`email.ilike.%${debouncedSearchTerm}%`);
        
        // Recherche par téléphone
        orConditions.push(`phone.ilike.%${debouncedSearchTerm}%`);
        
        // Recherche par nom complet
        orConditions.push(`name.ilike.%${debouncedSearchTerm}%`);
        
        // Si nous avons plusieurs termes, rechercher individuellement pour chaque partie du nom
        if (searchTerms.length > 1) {
          for (const term of searchTerms) {
            if (term.length >= 2) {
              orConditions.push(`name.ilike.%${term}%`);
            }
          }
        }
        
        // Appliquer les conditions OR à la requête
        const { data, error } = await query.or(orConditions.join(','));

        if (error) {
          console.error('Error searching leads:', error);
          setResults([]);
        } else if (data) {
          const formattedResults: SearchResult[] = data.map(lead => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            status: lead.status,
            desiredLocation: lead.desired_location,
            pipelineType: lead.pipeline_type,
            nationality: lead.nationality,
            source: lead.source,
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
