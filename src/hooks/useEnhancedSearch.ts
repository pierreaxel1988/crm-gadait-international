import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';
import { useAuth } from './useAuth';

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

export function useEnhancedSearch(initialSearchTerm: string = '', isAdminGlobalSearch: boolean = false) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 150);
  const { isAdmin } = useAuth();

  // Enhanced search function that uses RPC calls for better performance
  const performSearch = useCallback(async (term: string): Promise<SearchResult[]> => {
    if (!term || term.length < 1) {
      return [];
    }

    try {
      // Use separate queries to avoid baseQuery reuse conflicts
      const searchPattern = `%${term.trim()}%`;
      
      // Get role-based filtering info once
      let teamMemberFilter = null;
      if (!isAdminGlobalSearch && !isAdmin) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: teamMember } = await supabase
            .from('team_members')
            .select('id, role, is_admin')
            .eq('email', user.email)
            .single();

          if (teamMember && teamMember.role === 'commercial' && !teamMember.is_admin) {
            teamMemberFilter = teamMember.id;
          }
        }
      }

      console.log('🔍 Searching for:', term, 'Pattern:', searchPattern, 'Team filter:', teamMemberFilter);

      // Create separate queries for each search type
      const createQuery = (field: string) => {
        let query = supabase
          .from('leads')
          .select('id, name, email, phone, status, desired_location, pipeline_type, nationality, source, tax_residence, preferred_language, property_reference, created_at, tags, budget, deleted_at, assigned_to')
          .ilike(field, searchPattern);

        if (teamMemberFilter) {
          query = query.eq('assigned_to', teamMemberFilter);
        }

        return query
          .order('deleted_at', { ascending: true, nullsFirst: true })
          .order('created_at', { ascending: false })
          .limit(10);
      };

      // Execute all queries in parallel
      const [nameResults, emailResults, phoneResults, refResults] = await Promise.all([
        createQuery('name'),
        createQuery('email'),
        createQuery('phone'),
        createQuery('property_reference')
      ]);

      console.log('📧 Email search results:', emailResults.data?.length || 0, 'found');
      console.log('👤 Name search results:', nameResults.data?.length || 0, 'found');

      // Check for errors
      if (nameResults.error) console.error('Name search error:', nameResults.error);
      if (emailResults.error) console.error('Email search error:', emailResults.error);
      if (phoneResults.error) console.error('Phone search error:', phoneResults.error);
      if (refResults.error) console.error('Reference search error:', refResults.error);

      // Combine and deduplicate results
      const allResults = [
        ...(nameResults.data || []),
        ...(emailResults.data || []),
        ...(phoneResults.data || []),
        ...(refResults.data || [])
      ];

      // Remove duplicates by ID
      const uniqueResults = allResults.filter((lead, index, self) => 
        index === self.findIndex(l => l.id === lead.id)
      );

      // Sort: non-deleted first, then by creation date
      uniqueResults.sort((a, b) => {
        if (a.deleted_at && !b.deleted_at) return 1;
        if (!a.deleted_at && b.deleted_at) return -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      return uniqueResults.slice(0, 30).map(lead => ({
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

    } catch (error) {
      console.error('Enhanced search error:', error);
      return [];
    }
  }, [isAdminGlobalSearch, isAdmin]);

  // Property search function
  const searchProperties = useCallback(async (term: string): Promise<PropertyResult[]> => {
    if (!term || term.length < 1) {
      return [];
    }

    try {
      const searchPattern = `%${term.trim()}%`;
      
      const [titleResults, locationResults, externalIdResults] = await Promise.all([
        supabase
          .from('properties_backoffice')
          .select('id, title, price, location, property_type, external_id')
          .ilike('title', searchPattern)
          .limit(5),
        
        supabase
          .from('properties_backoffice')
          .select('id, title, price, location, property_type, external_id')
          .ilike('location', searchPattern)
          .limit(5),
        
        supabase
          .from('properties_backoffice')
          .select('id, title, price, location, property_type, external_id')
          .ilike('external_id', searchPattern)
          .limit(5)
      ]);

      // Combine and deduplicate results
      const allResults = [
        ...(titleResults.data || []),
        ...(locationResults.data || []),
        ...(externalIdResults.data || [])
      ];

      const uniqueResults = allResults.filter((prop, index, self) => 
        index === self.findIndex(p => p.id === prop.id)
      );

      return uniqueResults.slice(0, 15).map(property => ({
        id: property.id,
        title: property.title,
        price: property.price,
        location: property.location,
        property_type: property.property_type,
        external_id: property.external_id
      }));

    } catch (error) {
      console.error('Property search error:', error);
      return [];
    }
  }, []);

  // Main search effect
  useEffect(() => {
    const searchLeads = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 1) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        console.log('🔍 Enhanced search for:', debouncedSearchTerm);
        const searchResults = await performSearch(debouncedSearchTerm);
        console.log('✅ Enhanced search results:', searchResults.length, 'found');
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchLeads();
  }, [debouncedSearchTerm, performSearch]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    searchProperties
  };
}