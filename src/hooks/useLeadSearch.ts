
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
        // Split search terms into words for better matching
        const searchTerms = debouncedSearchTerm.split(' ').filter(term => term.length > 0);
        const searchLowerCase = debouncedSearchTerm.toLowerCase();
        
        let query = supabase
          .from('leads')
          .select('id, name, email, phone, status, desired_location, pipeline_type, nationality, source, tax_residence, preferred_language, property_reference, created_at, tags, budget')
          .order('created_at', { ascending: false });
        
        // Build OR conditions for the search with better matching
        let orConditions = [];
        
        // Full name search with ilike
        orConditions.push(`name.ilike.%${debouncedSearchTerm}%`);
        
        // Email and phone searches
        if (debouncedSearchTerm.includes('@') || /^\S+@\S+$/.test(debouncedSearchTerm)) {
          orConditions.push(`email.ilike.%${debouncedSearchTerm}%`);
        } else {
          orConditions.push(`email.ilike.%${debouncedSearchTerm}%`);
          orConditions.push(`phone.ilike.%${debouncedSearchTerm}%`);
        }
        
        // Handle multi-word searches better
        if (searchTerms.length > 1) {
          // For multi-word searches like "first last", try both combinations
          if (searchTerms.length === 2) {
            orConditions.push(`name.ilike.%${searchTerms[0]}%${searchTerms[1]}%`);
            orConditions.push(`name.ilike.%${searchTerms[1]}%${searchTerms[0]}%`);
          }
          
          // Add searches for each term separately and with no spaces (for names like hernando vergara)
          orConditions.push(`name.ilike.%${searchTerms.join('')}%`); // Search without spaces
          orConditions.push(`name.ilike.%${searchTerms.join('%')}%`); // Search with any characters between terms

          // Add searches for each term separately
          for (const term of searchTerms) {
            if (term.length >= 1) {
              orConditions.push(`name.ilike.%${term}%`);
            }
          }
        }
        
        // Property reference search
        orConditions.push(`property_reference.ilike.%${debouncedSearchTerm}%`);
        
        // Apply the OR conditions and add limit
        const { data, error } = await query
          .or(orConditions.join(','))
          .limit(40);  // Increased limit for better results

        if (error) {
          console.error('Error searching leads:', error);
          setResults([]);
        } else if (data) {
          console.log(`Search results for "${debouncedSearchTerm}":`, data.length);
          
          // Additional scoring for better relevance
          const scoredResults = data.map(lead => {
            let score = 0;
            const nameLower = (lead.name || '').toLowerCase();
            
            // Exact match gets highest score
            if (nameLower === searchLowerCase) {
              score += 100;
            }
            // Name starts with search term
            else if (nameLower.startsWith(searchLowerCase)) {
              score += 50;
            }
            // Name includes search term
            else if (nameLower.includes(searchLowerCase)) {
              score += 25;
            }
            
            // Special handling for multi-word searches to improve matching
            if (searchTerms.length > 1) {
              // Check if all terms are included in any order (even if not adjacent)
              const allTermsIncluded = searchTerms.every(term => 
                nameLower.includes(term.toLowerCase())
              );
              if (allTermsIncluded) score += 40;
              
              // Give higher scores to names that include search terms in sequence
              const sequentialTerms = searchTerms.join('.*');
              if (new RegExp(sequentialTerms, 'i').test(nameLower)) {
                score += 30;
              }
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
          
          // Sort by score and map back to original format
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
