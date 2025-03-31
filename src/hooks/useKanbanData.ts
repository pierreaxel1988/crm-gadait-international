
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/components/common/StatusBadge';
import { getLeads } from '@/services/leadCore';
import { KanbanItem } from '@/components/kanban/KanbanCard';
import { PropertyType, PurchaseTimeframe, PipelineType, Currency } from '@/types/lead';
import type { Json } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

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
  actionHistory?: Json; // Include actionHistory
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
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    console.log("useKanbanData useEffect triggered");
    console.log("Initial columns:", columns);
    console.log("Pipeline type:", pipelineType);
    console.log("Refresh trigger:", refreshTrigger);
    console.log("Is admin user:", isAdmin);
    
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
        
        // Direct query to get leads with action_history
        // For non-admins, only fetch leads assigned to them
        let query = supabase
          .from('leads')
          .select('*, action_history')
          .order('created_at', { ascending: false });
        
        // Filter by assigned_to for non-admin users
        if (!isAdmin && user) {
          // Find the team member record for the current user
          const currentTeamMember = teamMembers?.find(member => member.email === user.email);
          
          if (currentTeamMember) {
            console.log("Filtering leads for team member:", currentTeamMember.id);
            query = query.eq('assigned_to', currentTeamMember.id);
          } else {
            console.log("Current user is not a team member, showing no leads");
            setLoadedColumns(columns.map(col => ({ ...col, items: [] })));
            setIsLoading(false);
            return;
          }
        }
        
        const { data: supabaseLeads, error: leadsError } = await query;
          
        if (leadsError) {
          console.error('Error fetching leads:', leadsError);
          toast({
            variant: "destructive",
            title: "Erreur de chargement",
            description: "Impossible de charger les leads."
          });
          return;
        }
        
        // Log the fetched leads to help diagnose issues
        console.log("Fetched leads from Supabase:", supabaseLeads?.length);
        console.log("First few leads:", supabaseLeads?.slice(0, 3));
        
        // If no leads found in Supabase, try to get data locally
        let allLeads = supabaseLeads || [];
        if (!allLeads || allLeads.length === 0) {
          console.log("No leads in Supabase, trying local data");
          const localLeads = await getLeads();
          if (localLeads && localLeads.length > 0) {
            console.log("Found local leads:", localLeads.length);
            
            // Make sure the returned data from getLeads() is compatible with our expected structure
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
          console.log("No leads found in database or locally");
          setLoadedColumns(columns.map(col => ({ ...col, items: [] })));
          setIsLoading(false);
          return;
        }
        
        console.log(`Retrieved leads: ${allLeads.length}`);
        
        // Map leads data to KanbanItem format
        const mappedLeads = allLeads.map(lead => {
          const assignedTeamMember = teamMembers?.find(tm => tm.id === lead.assigned_to);
          
          // Ensure pipeline_type has a default value
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
            currency: lead.currency as Currency, // Make sure to include the currency
            actionHistory: lead.action_history // Include the action_history
          };
        });
        
        console.log(`Mapped leads: ${mappedLeads.length}`);
        
        // Filter leads by pipeline type first
        const filteredByPipelineType = mappedLeads.filter(lead => {
          // Check both pipelineType and pipeline_type properties
          const leadType = lead.pipelineType || lead.pipeline_type;
          console.log(`Lead ${lead.id} (${lead.name}) has pipeline type: ${leadType}`);
          return leadType === pipelineType;
        });
        
        console.log(`Leads filtered by pipeline type (${pipelineType}): ${filteredByPipelineType.length}`);
        
        // Distribute leads to their respective columns based on status
        const updatedColumns = columns.map(column => {
          const columnItems = filteredByPipelineType.filter(lead => lead.status === column.status);
          
          console.log(`Column ${column.title} (${column.status}): ${columnItems.length} leads`);
          
          return {
            ...column,
            items: columnItems as ExtendedKanbanItem[],
            pipelineType
          };
        });
        
        setLoadedColumns(updatedColumns);
      } catch (error) {
        console.error('Error in useKanbanData:', error);
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
  }, [refreshTrigger, columns, pipelineType, isAdmin, user]);

  return { loadedColumns, setLoadedColumns, isLoading };
};

