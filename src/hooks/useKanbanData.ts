
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

export interface ExtendedKanbanItem extends LeadDetailed {
  assignedToId?: string;
  assignedTo?: string;
}

export interface KanbanColumn {
  title: string;
  status: string;
  items: LeadDetailed[];
}

export const useKanbanData = (
  activeTab: string,
  refreshTrigger: number,
  filters: KanbanFilters = {}
) => {
  const [data, setData] = useState<LeadDetailed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadedColumns, setLoadedColumns] = useState<KanbanColumn[]>([]);

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
      setData(convertedData);
      
      // Set columns for pipeline view
      const columns: KanbanColumn[] = [
        { title: 'Nouveau', status: 'new', items: convertedData.filter(lead => lead.status === 'new') },
        { title: 'En cours', status: 'in_progress', items: convertedData.filter(lead => lead.status === 'in_progress') },
        { title: 'Qualifié', status: 'qualified', items: convertedData.filter(lead => lead.status === 'qualified') },
        { title: 'Fermé', status: 'closed', items: convertedData.filter(lead => lead.status === 'closed') }
      ];
      setLoadedColumns(columns);
      
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
    loadedColumns,
    refetch: fetchData
  };
};
