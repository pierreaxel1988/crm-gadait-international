
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/components/common/StatusBadge';
import { getLeads } from '@/services/leadCore';
import { KanbanItem } from '@/components/kanban/KanbanCard';
import { PropertyType, PurchaseTimeframe, PipelineType } from '@/types/lead';

// Extend KanbanItem with the additional properties needed for filtering
export interface ExtendedKanbanItem extends KanbanItem {
  budget?: string;
  desiredLocation?: string;
  purchaseTimeframe?: PurchaseTimeframe;
  propertyType?: PropertyType;
  assignedToId?: string; // Store the original ID
  country?: string;
  bedrooms?: number;
  url?: string;
  createdAt?: string;
  importedAt?: string;
  pipelineType?: PipelineType;
  pipeline_type?: PipelineType; // Add database field name for compatibility
}

interface KanbanColumn {
  title: string;
  status: LeadStatus;
  items: ExtendedKanbanItem[];
  pipelineType?: PipelineType;
}

export const useKanbanData = (
  columns: KanbanColumn[],
  refreshTrigger: number = 0,
  pipelineType: PipelineType = 'purchase'
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
        
        // Récupération des données brutes de leads depuis Supabase
        const { data: supabaseLeads, error: leadsError } = await supabase
          .from('leads')
          .select('*');
          
        // If there's an error or no data from Supabase, fall back to local leads
        let leads = [];
        if (leadsError || !supabaseLeads || supabaseLeads.length === 0) {
          leads = await getLeads();
        } else {
          leads = supabaseLeads;
        }
        
        // Map leads data to KanbanItem format
        const mappedLeads = leads.map(lead => {
          const assignedTeamMember = teamMembers.find(tm => tm.id === lead.assigned_to);
          
          // Détermine le pipeline_type avec une valeur par défaut
          const leadPipelineType = lead.pipeline_type || lead.pipelineType || 'purchase';
          
          return {
            id: lead.id,
            name: lead.name,
            email: lead.email || '',
            phone: lead.phone,
            status: lead.status as LeadStatus,
            tags: lead.tags || [],
            assignedTo: lead.assigned_to, // Make sure this is correctly passed
            assignedToId: lead.assigned_to, // Store the original ID
            dueDate: lead.next_follow_up_date,
            pipelineType: leadPipelineType as PipelineType, // Ensure correct typing
            pipeline_type: leadPipelineType as PipelineType, // Add database field name for compatibility
            taskType: lead.task_type,
            budget: lead.budget,
            desiredLocation: lead.desired_location,
            purchaseTimeframe: lead.purchase_timeframe as PurchaseTimeframe,
            propertyType: lead.property_type as PropertyType,
            country: lead.country,
            bedrooms: lead.bedrooms,
            url: lead.url,
            createdAt: lead.created_at,
            importedAt: lead.imported_at,
            external_id: lead.external_id
          };
        });
        
        const updatedColumns = columns.map(column => {
          // Sur mobile et desktop, on ne filtre plus par le pipelineType ici
          // Cela permettra d'afficher tous les leads dans MobileColumnList et
          // le filtrage se fera au niveau de ce composant
          const columnItems = mappedLeads.filter(lead => lead.status === column.status);
          
          return {
            ...column,
            items: columnItems as ExtendedKanbanItem[],
            pipelineType
          };
        });
        
        setLoadedColumns(updatedColumns);
      } catch (error) {
        console.error('Erreur dans useKanbanData:', error);
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
  }, [refreshTrigger, columns, pipelineType]);

  return { loadedColumns, setLoadedColumns, isLoading };
};
