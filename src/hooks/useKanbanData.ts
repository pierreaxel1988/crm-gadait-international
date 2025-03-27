import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/components/common/StatusBadge';
import { getLeads } from '@/services/leadCore';
import { KanbanItem } from '@/components/kanban/KanbanCard';
import { PropertyType, PurchaseTimeframe, PipelineType, Currency } from '@/types/lead';
import type { Json } from '@/integrations/supabase/types';

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
  currency?: Currency; // Ensure currency is included in the type
  nextFollowUpDate?: string; // Add nextFollowUpDate for action status
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
        
        // Récupération des leads depuis Supabase
        const { data: supabaseLeads, error: leadsError } = await supabase
          .from('leads')
          .select('*');
          
        if (leadsError) {
          console.error('Error fetching leads:', leadsError);
          toast({
            variant: "destructive",
            title: "Erreur de chargement",
            description: "Impossible de charger les leads."
          });
          return;
        }
        
        // Utiliser les leads de Supabase ou récupérer des données locales
        let allLeads = supabaseLeads || [];
        
        // Si aucun lead n'est trouvé dans Supabase, essayer de récupérer des données locales
        if (!allLeads || allLeads.length === 0) {
          const localLeads = await getLeads();
          if (localLeads && localLeads.length > 0) {
            // Make sure the returned data from getLeads() is compatible with our expected structure
            // We're only assigning to allLeads if we actually got data back
            allLeads = localLeads.map(lead => ({
              // Required fields with defaults to satisfy TypeScript
              id: lead.id,
              name: lead.name,
              email: lead.email || '',
              phone: lead.phone || '',
              status: lead.status || 'New',
              tags: lead.tags || [],
              action_history: (lead.actionHistory as Json) || ([] as Json),
              amenities: lead.amenities || [],
              assigned_to: lead.assignedTo,
              bedrooms: typeof lead.bedrooms === 'number' ? lead.bedrooms : null,
              budget: lead.budget || '',
              budget_min: lead.budgetMin || '',
              country: lead.country || '',
              created_at: lead.createdAt,
              currency: lead.currency || 'EUR',
              desired_location: lead.desiredLocation || '',
              external_id: lead.external_id || null,
              financing_method: lead.financingMethod || null,
              imported_at: lead.imported_at || null,
              integration_source: lead.integration_source || null,
              last_contacted_at: lead.lastContactedAt || null,
              living_area: lead.livingArea || null,
              location: lead.location || '',
              nationality: lead.nationality || null,
              next_follow_up_date: lead.nextFollowUpDate || null,
              notes: lead.notes || null,
              pipeline_type: lead.pipelineType || lead.pipeline_type || 'purchase',
              property_reference: lead.propertyReference || null,
              property_type: lead.propertyType || null,
              property_types: lead.propertyTypes || [],
              property_use: lead.propertyUse || null,
              purchase_timeframe: lead.purchaseTimeframe || null,
              raw_data: null,
              salutation: lead.salutation || null,
              source: lead.source || null,
              tax_residence: lead.taxResidence || null,
              task_type: lead.taskType || null,
              url: lead.url || null,
              views: lead.views || []
            }));
          }
        }
        
        if (!allLeads || allLeads.length === 0) {
          console.log("Aucun lead trouvé dans la base de données ou localement");
          setLoadedColumns(columns.map(col => ({ ...col, items: [] })));
          setIsLoading(false);
          return;
        }
        
        console.log(`Leads récupérés: ${allLeads.length}`);
        
        // Map leads data to KanbanItem format
        const mappedLeads = allLeads.map(lead => {
          const assignedTeamMember = teamMembers?.find(tm => tm.id === lead.assigned_to);
          
          // Utilise pipeline_type du lead ou une valeur par défaut
          const leadPipelineType = lead.pipeline_type || 'purchase';
          
          return {
            id: lead.id,
            name: lead.name,
            email: lead.email || '',
            phone: lead.phone,
            status: lead.status as LeadStatus,
            tags: lead.tags || [],
            assignedTo: lead.assigned_to,
            assignedToId: lead.assigned_to,
            dueDate: lead.next_follow_up_date,
            nextFollowUpDate: lead.next_follow_up_date, // Include nextFollowUpDate for action status
            pipelineType: leadPipelineType as PipelineType,
            pipeline_type: leadPipelineType as PipelineType,
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
            external_id: lead.external_id,
            currency: lead.currency as Currency // Make sure to include the currency
          };
        });
        
        console.log(`Leads mappés: ${mappedLeads.length}`);
        console.log(`Pipeline type demandé: ${pipelineType}`);
        
        // Filter leads by pipeline type first
        const filteredByPipelineType = mappedLeads.filter(lead => {
          // Check both pipelineType and pipeline_type properties
          return (lead.pipelineType === pipelineType || lead.pipeline_type === pipelineType);
        });
        
        console.log(`Leads filtrés par pipeline type (${pipelineType}): ${filteredByPipelineType.length}`);
        
        // Distribute leads to their respective columns based on status
        const updatedColumns = columns.map(column => {
          const columnItems = filteredByPipelineType.filter(lead => lead.status === column.status);
          
          console.log(`Colonne ${column.title} (${column.status}): ${columnItems.length} leads`);
          
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
