
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
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  budget?: number;
}

export interface SearchOptions {
  limit?: number;
  includeTags?: boolean;
  includeProperties?: boolean;
}

export function useLeadSearch(initialSearchTerm: string = '', options: SearchOptions = {}) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const {
    limit = 10,
    includeTags = false,
    includeProperties = false
  } = options;

  useEffect(() => {
    const searchLeads = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setResults([]);
        setTotalCount(0);
        return;
      }

      setIsLoading(true);
      
      try {
        // Diviser les termes de recherche en mots pour rechercher prénom/nom séparément
        const searchTerms = debouncedSearchTerm.split(' ').filter(term => term.length > 0);
        
        // Build the query with all columns we want to select
        let query = supabase
          .from('leads')
          .select(`
            id, 
            name, 
            email, 
            phone, 
            status, 
            desired_location,
            pipeline_type, 
            nationality, 
            source,
            tax_residence,
            preferred_language,
            property_reference,
            created_at,
            tags,
            budget
          `)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        // Construction de la clause OR pour la recherche
        let orConditions = [];
        
        // Recherche par email
        orConditions.push(`email.ilike.%${debouncedSearchTerm}%`);
        
        // Recherche par téléphone
        orConditions.push(`phone.ilike.%${debouncedSearchTerm}%`);
        
        // Recherche par nom complet
        orConditions.push(`name.ilike.%${debouncedSearchTerm}%`);

        // Recherche par emplacement souhaité
        orConditions.push(`desired_location.ilike.%${debouncedSearchTerm}%`);

        // Recherche par référence de propriété
        orConditions.push(`property_reference.ilike.%${debouncedSearchTerm}%`);

        // Recherche par status
        orConditions.push(`status.ilike.%${debouncedSearchTerm}%`);
        
        // Si nous avons plusieurs termes, rechercher individuellement pour chaque partie du nom
        if (searchTerms.length > 1) {
          for (const term of searchTerms) {
            if (term.length >= 2) {
              orConditions.push(`name.ilike.%${term}%`);
            }
          }
        }

        // Get the count in a separate query for performance
        const { count, error: countError } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .or(orConditions.join(','));

        if (countError) {
          console.error('Error counting leads:', countError);
        } else {
          setTotalCount(count || 0);
        }
        
        // Appliquer les conditions OR à la requête principale
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
            taxResidence: lead.tax_residence,
            preferredLanguage: lead.preferred_language,
            propertyReference: lead.property_reference,
            createdAt: lead.created_at,
            tags: lead.tags,
            budget: lead.budget
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
  }, [debouncedSearchTerm, limit, includeTags, includeProperties]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    totalCount
  };
}
