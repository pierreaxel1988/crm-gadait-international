
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
  assignedToId?: string; // Store the original ID
  country?: string;
  bedrooms?: number;
  url?: string;
  createdAt?: string;
  importedAt?: string;
}

interface KanbanColumn {
  title: string;
  status: LeadStatus;
  items: ExtendedKanbanItem[];
  pipelineType?: 'purchase' | 'rental';
}

export const useKanbanData = (
  columns: KanbanColumn[],
  refreshTrigger: number = 0,
  pipelineType: 'purchase' | 'rental' = 'purchase' // Par défaut, c'est le pipeline d'achat
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
          
          // Déterminer le type de pipeline en fonction de lead.pipelineType ou d'une autre propriété
          // Par défaut, si ce n'est pas spécifié, nous utilisons 'purchase'
          const leadPipelineType = lead.pipelineType || 'purchase';
          
          return {
            id: lead.id,
            name: lead.name,
            email: lead.email || '',
            phone: lead.phone,
            status: lead.status as LeadStatus,
            tags: lead.tags || [],
            assignedTo: lead.assigned_to,
            assignedToId: lead.assigned_to, // Store the original ID
            dueDate: lead.next_follow_up_date,
            pipelineType: leadPipelineType,
            taskType: lead.task_type,
            budget: lead.budget,
            desiredLocation: lead.desired_location,
            purchaseTimeframe: lead.purchase_timeframe as PurchaseTimeframe,
            propertyType: lead.property_type as PropertyType,
            country: lead.country,
            bedrooms: lead.bedrooms,
            url: lead.url,
            createdAt: lead.created_at ? new Date(lead.created_at).toLocaleDateString('fr-FR') : undefined,
            importedAt: lead.imported_at ? new Date(lead.imported_at).toLocaleDateString('fr-FR') : undefined
          };
        });
        
        console.log('Mapped leads:', mappedLeads);
        
        // Filtre les leads par type de pipeline
        const filteredLeads = mappedLeads.filter(lead => 
          lead.pipelineType === pipelineType
        );
        
        // Group leads by status
        const updatedColumns = columns.map(column => ({
          ...column,
          items: filteredLeads.filter(lead => lead.status === column.status) as ExtendedKanbanItem[],
          pipelineType // Ajouter le type de pipeline à la colonne
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
  }, [refreshTrigger, columns, pipelineType]);

  return { loadedColumns, isLoading };
};
