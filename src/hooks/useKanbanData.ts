
import { useState, useEffect, useCallback } from 'react';
import { LeadDetailed } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { convertToSimpleLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';

export interface KanbanFilters {
  assignedTo?: string;
  tags?: string[];
  source?: string;
  country?: string;
  propertyType?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  searchTerm?: string;
}

export const useKanbanData = (
  activeTab: string,
  refreshTrigger: number,
  filters: KanbanFilters = {}
) => {
  const [data, setData] = useState<LeadDetailed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Fetch team members
  const fetchTeamMembers = useCallback(async () => {
    try {
      const { data: members, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setTeamMembers(members || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  }, []);

  // Fetch leads data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('leads')
        .select('*')
        .eq('pipeline_type', activeTab);

      // Apply filters
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      if (filters.source) {
        query = query.eq('source', filters.source);
      }

      if (filters.country) {
        query = query.eq('country', filters.country);
      }

      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%, email.ilike.%${filters.searchTerm}%, phone.ilike.%${filters.searchTerm}%`);
      }

      // Add price range filter if provided
      if (filters.priceRange?.min) {
        query = query.gte('budget', filters.priceRange.min.toString());
      }
      if (filters.priceRange?.max) {
        query = query.lte('budget', filters.priceRange.max.toString());
      }

      const { data: rawData, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données."
        });
        return;
      }

      // Convert raw data to LeadDetailed format
      const convertedData = rawData?.map(convertToSimpleLead) || [];
      
      // Add missing fields with default values for compatibility
      const enrichedData = convertedData.map(lead => ({
        ...lead,
        attention_points: lead.attention_points || '',
        bathrooms: lead.bathrooms || 0,
        contact_source: lead.contact_source || '',
        first_contact_date: lead.first_contact_date || null,
        last_contact_date: lead.last_contact_date || null,
        next_action_date: lead.next_action_date || null,
        relationship_details: lead.relationship_details || '',
        relationship_status: lead.relationship_status || 'Nouveau contact',
        mandate_type: lead.mandate_type || '',
        specific_needs: lead.specific_needs || '',
        internal_notes: lead.internal_notes || '',
        property_description: lead.property_description || '',
        property_state: lead.property_state || '',
        construction_year: lead.construction_year || '',
        land_area: lead.land_area || '',
        assets: lead.assets || [],
        equipment: lead.equipment || [],
        furnished: lead.furnished || false,
        furniture_included_in_price: lead.furniture_included_in_price || false,
        furniture_price: lead.furniture_price || '',
        desired_price: lead.desired_price || '',
        fees: lead.fees || '',
        map_coordinates: lead.map_coordinates || ''
      }));

      setData(enrichedData);
      
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des données."
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, filters, refreshTrigger]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    teamMembers,
    refetch: fetchData
  };
};
