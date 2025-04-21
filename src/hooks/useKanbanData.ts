import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/components/common/StatusBadge';
import { getLeads } from '@/services/leadCore';
import { KanbanItem } from '@/components/kanban/KanbanCard';
import { PropertyType, PurchaseTimeframe, PipelineType, Currency, MauritiusRegion } from '@/types/lead';
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
  pipelineType?: PipelineType; // PipelineType now includes 'owners'
  pipeline_type?: PipelineType; // Add database field name for compatibility
  currency?: Currency; // Ensure currency is included in the type
  nextFollowUpDate?: string; // Add nextFollowUpDate for action status
  actionHistory?: Json; // Include actionHistory
  phoneCountryCode?: string | null; // Add phone country code
  phoneCountryCodeDisplay?: string | null; // Add phone country code display
  preferredLanguage?: string | null; // Add preferred language
  regions?: MauritiusRegion[];
}

interface KanbanColumn {
  title: string;
  status: LeadStatus;
  items: ExtendedKanbanItem[];
  pipelineType?: PipelineType;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export const useKanbanData = (
  columns: KanbanColumn[],
  refreshTrigger: number = 0,
  pipelineType: PipelineType = 'purchase'
) => {
  const [loadedColumns, setLoadedColumns] = useState<KanbanColumn[]>(columns);
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const { isCommercial, user } = useAuth(); // Récupérer les infos d'authentification

  useEffect(() => {
    console.log("useKanbanData useEffect triggered");
    console.log("Initial columns:", columns);
    console.log("Pipeline type:", pipelineType);
    console.log("Refresh trigger:", refreshTrigger);
    console.log("User is commercial:", isCommercial);
    
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        
        // Fetch team members for assignment information
        const { data: teamMembersData, error: teamError } = await supabase
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
        
        if (teamMembersData) {
          setTeamMembers(teamMembersData);
        }
        
        // Direct query to get leads with filters based on user role
        let query = supabase.from('leads').select('*, action_history');
        
        // Si c'est un commercial, filtrer pour n'afficher que ses leads
        if (isCommercial && user) {
          // Trouver l'ID du team member correspondant à l'email de l'utilisateur
          const currentTeamMember = teamMembersData?.find(tm => tm.email === user.email);
          
          if (currentTeamMember) {
            console.log("Filtering leads for team member:", currentTeamMember.id, currentTeamMember.name);
            query = query.eq('assigned_to', currentTeamMember.id);
          } else {
            console.warn("Commercial user not found in team_members table:", user.email);
          }
        }
        
        // Finaliser la requête
        query = query.order('created_at', { ascending: false });
        
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
          let localLeads = await getLeads();
          
          // Si c'est un commercial, filtrer les leads locaux aussi
          if (isCommercial && user && localLeads) {
            const currentTeamMember = teamMembersData?.find(tm => tm.email === user.email);
            if (currentTeamMember) {
              localLeads = localLeads.filter(lead => lead.assignedTo === currentTeamMember.id);
            }
          }
          
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
              views: lead.views || [],
              // Add missing fields to fix the type error
              phone_country_code: lead.phoneCountryCode || null,
              phone_country_code_display: lead.phoneCountryCodeDisplay || null,
              preferred_language: lead.preferredLanguage || null,
              regions: lead.regions || []
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
          const assignedTeamMember = teamMembersData?.find(tm => tm.id === lead.assigned_to);
          
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
            actionHistory: lead.action_history, // Include the action_history
            phoneCountryCode: lead.phone_country_code, // Use snake_case property from the database
            phoneCountryCodeDisplay: lead.phone_country_code_display, // Use snake_case property from the database
            preferredLanguage: lead.preferred_language // Add preferred_language to mapped leads
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
  }, [refreshTrigger, columns, pipelineType, isCommercial, user]);

  return { loadedColumns, setLoadedColumns, isLoading, teamMembers };
};
