
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/components/common/StatusBadge';
import { getLeads } from '@/services/leadCore';
import { KanbanItem } from '@/components/kanban/KanbanCard';
import { PropertyType, PurchaseTimeframe } from '@/types/lead';

// Extend KanbanItem with the additional properties needed for filtering
export interface ExtendedKanbanItem extends KanbanItem {
  budget?: string;
  desiredLocation?: string;
  purchaseTimeframe?: PurchaseTimeframe;
  propertyType?: PropertyType;
  assignedToId?: string; // Add this to store the original ID
}

interface KanbanColumn {
  title: string;
  status: LeadStatus;
  items: ExtendedKanbanItem[];
}

export const useKanbanData = (
  columns: KanbanColumn[],
  refreshTrigger: number = 0
) => {
  const [loadedColumns, setLoadedColumns] = useState<KanbanColumn[]>(columns);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        
        // Fetch team members for assignment information
        const { data: teamMembers, error: teamError } = await supabase
          .from('team_members')
          .select('id, email, name');
          
        if (teamError) {
          console.error('Error fetching team members:', teamError);
          toast({
            variant: "destructive",
            title: "Erreur de chargement",
            description: "Impossible de charger les membres de l'équipe."
          });
          return;
        }
        
        // First try to get leads from Supabase
        const { data: supabaseLeads, error: leadsError } = await supabase
          .from('leads')
          .select('*');
          
        // If there's an error or no data from Supabase, fall back to local leads
        let leads = [];
        if (leadsError || !supabaseLeads || supabaseLeads.length === 0) {
          console.log('Falling back to local leads data');
          leads = getLeads();
        } else {
          leads = supabaseLeads;
        }
        
        // Map leads data to KanbanItem format
        const mappedLeads = leads.map(lead => {
          const assignedTeamMember = teamMembers.find(tm => tm.id === lead.assigned_to);
          
          return {
            id: lead.id,
            name: lead.name,
            email: lead.email || '',
            phone: lead.phone,
            status: lead.status as LeadStatus,
            tags: lead.tags || [],
            assignedTo: assignedTeamMember ? assignedTeamMember.name : undefined,
            assignedToId: lead.assigned_to, // Store the original ID
            dueDate: lead.next_follow_up_date,
            pipelineType: 'purchase',
            taskType: lead.task_type,
            budget: lead.budget,
            desiredLocation: lead.desired_location,
            purchaseTimeframe: lead.purchase_timeframe as PurchaseTimeframe,
            propertyType: lead.property_type as PropertyType
          };
        });
        
        console.log('Mapped leads:', mappedLeads);
        
        // Group leads by status
        const updatedColumns = columns.map(column => ({
          ...column,
          items: mappedLeads.filter(lead => lead.status === column.status) as ExtendedKanbanItem[]
        }));
        
        setLoadedColumns(updatedColumns);
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement des données."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [refreshTrigger, columns]);

  return { loadedColumns, isLoading };
};
