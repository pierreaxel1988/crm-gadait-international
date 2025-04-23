import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/components/common/StatusBadge';
import { getLeads } from '@/services/leadCore';
import { KanbanItem } from '@/components/kanban/KanbanCard';
import { PropertyType, PurchaseTimeframe, PipelineType, Currency, MauritiusRegion } from '@/types/lead';
import type { Json } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

export interface ExtendedKanbanItem extends KanbanItem {
  budget?: string;
  desiredLocation?: string;
  purchaseTimeframe?: PurchaseTimeframe;
  propertyType?: PropertyType;
  assignedToId?: string;
  country?: string;
  bedrooms?: number;
  url?: string;
  createdAt?: string;
  importedAt?: string;
  pipelineType?: PipelineType;
  pipeline_type?: PipelineType;
  currency?: Currency;
  nextFollowUpDate?: string;
  actionHistory?: Json;
  phoneCountryCode?: string | null;
  phoneCountryCodeDisplay?: string | null;
  preferredLanguage?: string | null;
  regions?: MauritiusRegion[];
  assets?: string[];
  condo_fees?: string;
  energy_class?: string;
  equipment?: string[];
  floors?: number;
  landArea?: string;
  orientation?: string[];
  parkingSpaces?: number;
  constructionYear?: string;
  yearlyTaxes?: string;
  facilities?: string[];
  key_features?: string[];
  property_description?: string;
  renovation_needed?: string;
  desired_price?: string;
  fees?: string;
  furnished?: boolean;
  furniture_included_in_price?: boolean;
  furniture_price?: string;
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
  const { isCommercial, user } = useAuth();

  useEffect(() => {
    console.log("useKanbanData useEffect triggered");
    console.log("Initial columns:", columns);
    console.log("Pipeline type:", pipelineType);
    console.log("Refresh trigger:", refreshTrigger);
    console.log("User is commercial:", isCommercial);
    
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        
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
        
        let query = supabase.from('leads').select('*, action_history');
        
        if (isCommercial && user) {
          const currentTeamMember = teamMembersData?.find(tm => tm.email === user.email);
          
          if (currentTeamMember) {
            console.log("Filtering leads for team member:", currentTeamMember.id, currentTeamMember.name);
            query = query.eq('assigned_to', currentTeamMember.id);
          } else {
            console.warn("Commercial user not found in team_members table:", user.email);
          }
        }
        
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
        
        let allLeads = supabaseLeads || [];
        if (!allLeads || allLeads.length === 0) {
          console.log("No leads in Supabase, trying local data");
          let localLeads = await getLeads();
          
          if (isCommercial && user && localLeads) {
            const currentTeamMember = teamMembersData?.find(tm => tm.email === user.email);
            if (currentTeamMember) {
              localLeads = localLeads.filter(lead => lead.assignedTo === currentTeamMember.id);
            }
          }
          
          if (localLeads && localLeads.length > 0) {
            console.log("Found local leads:", localLeads.length);
            
            allLeads = localLeads.map(lead => ({
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
              phone_country_code: lead.phoneCountryCode || null,
              phone_country_code_display: lead.phoneCountryCodeDisplay || null,
              preferred_language: lead.preferredLanguage || null,
              regions: lead.regions || [],
              assets: lead.assets || [],
              condo_fees: lead.condoFees || '',
              energy_class: lead.energyClass || '',
              equipment: lead.equipment || [],
              floors: lead.floors || null,
              land_area: lead.landArea || '',
              orientation: lead.orientation || [],
              parking_spaces: lead.parkingSpaces || null,
              construction_year: lead.constructionYear || '',
              yearly_taxes: lead.yearlyTaxes || '',
              facilities: lead.facilities || [],
              key_features: lead.keyFeatures || [],
              property_description: lead.propertyDescription || '',
              renovation_needed: lead.renovationNeeded || '',
              desired_price: lead.desired_price || '',
              fees: lead.fees || '',
              furnished: lead.furnished || false,
              furniture_included_in_price: lead.furniture_included_in_price || true,
              furniture_price: lead.furniture_price || ''
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
        
        const mappedLeads = allLeads.map(lead => {
          const assignedTeamMember = teamMembersData?.find(tm => tm.id === lead.assigned_to);
          
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
            nextFollowUpDate: lead.next_follow_up_date,
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
            currency: lead.currency as Currency,
            actionHistory: lead.action_history,
            phoneCountryCode: lead.phoneCountryCode,
            phoneCountryCodeDisplay: lead.phoneCountryCodeDisplay,
            preferredLanguage: lead.preferredLanguage,
            regions: lead.regions,
            assets: lead.assets,
            condo_fees: lead.condoFees,
            energy_class: lead.energyClass,
            equipment: lead.equipment,
            floors: lead.floors,
            land_area: lead.landArea,
            orientation: lead.orientation,
            parking_spaces: lead.parkingSpaces,
            construction_year: lead.constructionYear,
            yearly_taxes: lead.yearlyTaxes,
            facilities: lead.facilities,
            key_features: lead.keyFeatures,
            property_description: lead.propertyDescription,
            renovation_needed: lead.renovationNeeded,
            desired_price: lead.desired_price,
            fees: lead.fees,
            furnished: lead.furnished,
            furniture_included_in_price: lead.furniture_included_in_price,
            furniture_price: lead.furniture_price
          };
        });
        
        console.log(`Mapped leads: ${mappedLeads.length}`);
        
        const filteredByPipelineType = mappedLeads.filter(lead => {
          const leadType = lead.pipelineType || lead.pipeline_type;
          console.log(`Lead ${lead.id} (${lead.name}) has pipeline type: ${leadType}`);
          return leadType === pipelineType;
        });
        
        console.log(`Leads filtered by pipeline type (${pipelineType}): ${filteredByPipelineType.length}`);
        
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
