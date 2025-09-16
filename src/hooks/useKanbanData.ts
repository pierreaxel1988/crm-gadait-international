
import { useState, useEffect, useCallback } from 'react';
import { LeadDetailed } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { mapToLeadDetailed } from '@/services/utils/leadMappers';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/components/common/StatusBadge';

export interface KanbanFilters {
  pipelineType?: string;
  assignedTo?: string;
  tags?: string[];
  source?: string;
  country?: string;
  location?: string;
  propertyType?: string;
  propertyTypes?: string[];
  purchaseTimeframe?: string;
  currency?: string;
  status?: LeadStatus | null;
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
  status: LeadStatus;
  items: ExtendedKanbanItem[];
  pipelineType?: string;
}

export const useKanbanData = (
  activeTab: string,
  refreshTrigger: number,
  filters: KanbanFilters = {}
) => {
  const [data, setData] = useState<LeadDetailed[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      
      console.log('=== FETCHING LEADS DATA IN KANBAN ===');
      console.log('Active tab:', activeTab);
      console.log('Filters:', filters);
      
      let query = supabase
        .from('leads')
        .select('*');

      // Only filter by pipeline_type if it's explicitly set and not 'all'
      if (activeTab && activeTab !== 'all' && (!filters.pipelineType || filters.pipelineType === 'all')) {
        query = query.eq('pipeline_type', activeTab);
      } else if (filters.pipelineType && filters.pipelineType !== 'all') {
        query = query.eq('pipeline_type', filters.pipelineType);
      }

      // Handle deleted leads based on status filter
      if (filters.status === 'Deleted') {
        // When "Deleted" filter is selected, show only deleted leads
        query = query.not('deleted_at', 'is', null);
      } else {
        // By default, exclude deleted leads (unless specifically filtering for them)
        query = query.is('deleted_at', null);
      }

      // Apply other filters
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      if (filters.source) {
        query = query.eq('source', filters.source);
      }

      if (filters.country) {
        query = query.eq('country', filters.country);
      }

      if (filters.location) {
        query = query.eq('desired_location', filters.location);
      }

      // Filter by property types (supporting both single property type and multiple property types)
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        query = query.in('property_type', filters.propertyTypes);
      } else if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply status filter (except for "Deleted" which is handled above)
      if (filters.status && filters.status !== 'Deleted') {
        query = query.eq('status', filters.status);
      }

      if (filters.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%, email.ilike.%${filters.searchTerm}%, phone.ilike.%${filters.searchTerm}%`);
      }

      // Add price range filter if provided
      if (filters.priceRange?.min) {
        query = query.gte('budget_min', filters.priceRange.min.toString());
      }
      if (filters.priceRange?.max) {
        query = query.lte('budget', filters.priceRange.max.toString());
      }

      if (filters.purchaseTimeframe) {
        query = query.eq('purchase_timeframe', filters.purchaseTimeframe);
      }

      if (filters.currency) {
        query = query.eq('currency', filters.currency);
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

      console.log('Raw data from Supabase:', rawData?.length || 0, 'leads');
      
      // Convert raw data to LeadDetailed format using mapToLeadDetailed
      const convertedData = rawData?.map(lead => {
        const mappedLead = mapToLeadDetailed(lead);
        // If the lead is deleted, set its status to "Deleted" for display purposes
        if (lead.deleted_at) {
          mappedLead.status = 'Deleted' as LeadStatus;
        }
        return mappedLead;
      }) || [];
      
      console.log('Converted data:', convertedData.length, 'leads');
      
      // Log some sample leads for debugging
      if (convertedData.length > 0) {
        console.log('Sample leads:');
        convertedData.slice(0, 3).forEach((lead, index) => {
          console.log(`Lead ${index + 1}:`, {
            name: lead.name,
            status: lead.status,
            pipelineType: lead.pipelineType,
            assignedTo: lead.assignedTo,
            deleted_at: lead.deleted_at
          });
        });
      }
      
      setData(convertedData);
      
      // Set columns for pipeline view - using correct LeadStatus values
      // Group leads by their actual status values, not just hardcoded ones
      const statusGroups: Record<string, LeadDetailed[]> = {};
      convertedData.forEach(lead => {
        const status = lead.status || 'New';
        if (!statusGroups[status]) {
          statusGroups[status] = [];
        }
        statusGroups[status].push(lead);
      });
      
      console.log('Status groups:', Object.keys(statusGroups).map(status => `${status}: ${statusGroups[status].length}`));
      
      // Create columns based on actual data
      const columns: KanbanColumn[] = [
        { title: 'Nouveau', status: 'New' as LeadStatus, items: statusGroups['New'] || [], pipelineType: activeTab },
        { title: 'En cours', status: 'Contacted' as LeadStatus, items: statusGroups['Contacted'] || [], pipelineType: activeTab },
        { title: 'Qualifié', status: 'Qualified' as LeadStatus, items: statusGroups['Qualified'] || [], pipelineType: activeTab },
        { title: 'Fermé', status: 'Gagné' as LeadStatus, items: statusGroups['Gagné'] || [], pipelineType: activeTab }
      ];
      
      // Add "Deleted" column if there are deleted leads
      if (statusGroups['Deleted'] && statusGroups['Deleted'].length > 0) {
        columns.push({
          title: 'Supprimé',
          status: 'Deleted' as LeadStatus,
          items: statusGroups['Deleted'],
          pipelineType: activeTab
        });
      }
      
      // Add any additional status columns that exist in the data but aren't in our standard columns
      Object.keys(statusGroups).forEach(status => {
        const existingColumn = columns.find(col => col.status === status);
        if (!existingColumn && statusGroups[status].length > 0 && status !== 'Deleted') {
          columns.push({
            title: status,
            status: status as LeadStatus,
            items: statusGroups[status],
            pipelineType: activeTab
          });
        }
      });
      
      console.log('Final columns:', columns.map(col => `${col.title}: ${col.items.length} leads`));
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
  }, [activeTab, filters, refreshTrigger, teamMembers]);

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
