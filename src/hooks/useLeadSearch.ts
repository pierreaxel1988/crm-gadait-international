
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
  deleted_at?: string;
}

export interface PropertyResult {
  id: string;
  title: string;
  price?: number | string;
  location?: string;
  property_type?: string;
  external_id?: string;
}

export function useLeadSearch(initialSearchTerm: string = '', adminGlobalSearch: boolean = false) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 150);

  // Memoized search function to avoid recreating it on each render
  const searchProperties = useCallback(async (term: string): Promise<PropertyResult[]> => {
    if (!term || term.length < 1) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('properties_backoffice')
        .select('id, title, price, location, property_type, external_id')
        .or(`title.ilike.'%${term}%', location.ilike.'%${term}%', external_id.ilike.'%${term}%'`)
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
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const searchTerm = debouncedSearchTerm.trim();
        
        // Build query based on admin status
        let query = supabase
          .from('leads')
          .select('id, name, email, phone, status, desired_location, pipeline_type, nationality, source, tax_residence, preferred_language, property_reference, created_at, tags, budget, deleted_at, assigned_to')
          .or(`name.ilike.'%${searchTerm}%',email.ilike.'%${searchTerm}%',phone.ilike.'%${searchTerm}%',property_reference.ilike.'%${searchTerm}%'`);

        // If not admin global search, apply role-based filtering
        if (!adminGlobalSearch) {
          // Get current user to apply commercial filtering
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: teamMember } = await supabase
              .from('team_members')
              .select('id, role, is_admin')
              .eq('email', user.email)
              .single();

            // If commercial, only show their assigned leads
            if (teamMember && teamMember.role === 'commercial' && !teamMember.is_admin) {
              query = query.eq('assigned_to', teamMember.id);
            }
          }
        }

        const { data, error } = await query
          .order('deleted_at', { ascending: true, nullsFirst: true })
          .order('created_at', { ascending: false })
          .limit(30);
        

        if (error) {
          console.error('Error searching leads:', error);
          setResults([]);
        } else if (data) {
          // Transformer les résultats en ajoutant un statut "Deleted" si deleted_at existe
          const formattedResults = data.map(lead => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            status: lead.deleted_at ? 'Deleted' : lead.status,
            desiredLocation: lead.desired_location,
            pipelineType: lead.pipeline_type,
            nationality: lead.nationality,
            source: lead.source,
            taxResidence: lead.tax_residence,
            preferredLanguage: lead.preferred_language,
            propertyReference: lead.property_reference,
            createdAt: lead.created_at,
            tags: lead.tags,
            budget: lead.budget,
            deleted_at: lead.deleted_at
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
    isLoading,
    searchProperties
  };
}
