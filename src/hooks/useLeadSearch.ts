
import { useState, useEffect, useCallback } from 'react';
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
  tags?: string[];
  budget?: string;
}

export interface PropertyResult {
  id: string;
  title: string;
  price?: number | string;
  location?: string;
  property_type?: string;
  external_id?: string;
}

export function useLeadSearch(initialSearchTerm: string = '') {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized search function to avoid recreating it on each render
  const searchProperties = useCallback(async (term: string): Promise<PropertyResult[]> => {
    if (!term || term.length < 1) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, price, location, property_type, external_id')
        .or(`title.ilike.%${term}%, location.ilike.%${term}%, external_id.ilike.%${term}%`)
        .limit(15);

      if (error) {
        console.error('Error searching properties:', error);
        return [];
      }

      return (data || []).map(property => ({
        id: property.id,
        title: property.title,
        price: property.price,
        location: property.location,
        property_type: property.property_type,
        external_id: property.external_id
      }));
    } catch (error) {
      console.error('Unexpected error during property search:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    const searchLeads = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 1) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      
      try {
        const searchLowerCase = debouncedSearchTerm.toLowerCase().trim();
        
        let query = supabase
          .from('leads')
          .select('id, name, email, phone, status, desired_location, pipeline_type, nationality, source, tax_residence, preferred_language, property_reference, created_at, tags, budget')
          .order('created_at', { ascending: false });
        
        // Build comprehensive OR conditions for search
        let orConditions = [];
        
        // Name search - exact, starts with, and contains
        orConditions.push(`name.ilike.%${debouncedSearchTerm}%`);
        
        // Email search - exact and partial matches
        orConditions.push(`email.ilike.%${debouncedSearchTerm}%`);
        
        // Phone search - remove any formatting and search
        const cleanPhone = debouncedSearchTerm.replace(/[\s\-\(\)\+]/g, '');
        if (cleanPhone.length > 0) {
          orConditions.push(`phone.ilike.%${cleanPhone}%`);
        }
        
        // Property reference search
        orConditions.push(`property_reference.ilike.%${debouncedSearchTerm}%`);
        
        // Split search terms for better name matching
        const searchTerms = debouncedSearchTerm.split(' ').filter(term => term.length > 0);
        
        if (searchTerms.length > 1) {
          // Multi-word searches - try different combinations
          orConditions.push(`name.ilike.%${searchTerms.join('%')}%`);
          orConditions.push(`name.ilike.%${searchTerms.reverse().join('%')}%`);
          
          // Individual term searches
          searchTerms.forEach(term => {
            if (term.length >= 2) {
              orConditions.push(`name.ilike.%${term}%`);
            }
          });
        }
        
        console.log('Search conditions:', orConditions);
        
        const { data, error } = await query
          .or(orConditions.join(','))
          .limit(50);

        if (error) {
          console.error('Error searching leads:', error);
          setResults([]);
        } else if (data) {
          console.log(`Search results for "${debouncedSearchTerm}":`, data.length);
          
          // Score results for better relevance
          const scoredResults = data.map(lead => {
            let score = 0;
            const nameLower = (lead.name || '').toLowerCase();
            const emailLower = (lead.email || '').toLowerCase();
            const phoneLower = (lead.phone || '').toLowerCase();
            
            // Exact matches get highest priority
            if (nameLower === searchLowerCase) score += 100;
            if (emailLower === searchLowerCase) score += 100;
            if (phoneLower === searchLowerCase) score += 100;
            
            // Starts with matches
            if (nameLower.startsWith(searchLowerCase)) score += 80;
            if (emailLower.startsWith(searchLowerCase)) score += 80;
            if (phoneLower.startsWith(searchLowerCase)) score += 80;
            
            // Contains matches
            if (nameLower.includes(searchLowerCase)) score += 50;
            if (emailLower.includes(searchLowerCase)) score += 50;
            if (phoneLower.includes(searchLowerCase)) score += 50;
            
            // Bonus for multi-word name matches
            if (searchTerms.length > 1) {
              const allTermsInName = searchTerms.every(term => 
                nameLower.includes(term.toLowerCase())
              );
              if (allTermsInName) score += 60;
            }
            
            return {
              score,
              lead: {
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
              }
            };
          });
          
          // Sort by score and return results
          const formattedResults = scoredResults
            .sort((a, b) => b.score - a.score)
            .map(item => item.lead);
          
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
    isLoading,
    searchProperties
  };
}
