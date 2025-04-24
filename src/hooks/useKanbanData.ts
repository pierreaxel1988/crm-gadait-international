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
  // Ajout des propriétés manquantes pour corriger l'erreur de type
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
  // Ajout des propriétés également manquantes dans l'erreur
  facilities?: string[];
  key_features?: string[];
  property_description?: string;
  renovation_needed?: string;
  // Ajout des nouveaux champs pour les propriétaires
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
  const { isAdmin, isCommercial, user } = useAuth();

  useEffect(() => {
    console.log("useKanbanData useEffect triggered");
    console.log("Initial columns:", columns);
    console.log("Pipeline type:", pipelineType);
    console.log("Refresh trigger:", refreshTrigger);
    
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        
        // Charge tous les membres de l'équipe
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
        
        // Grâce à RLS, nous pouvons simplement appeler la table leads sans filtrer
        // RLS s'occupera automatiquement de limiter l'accès selon les permissions
        let query = supabase.from('leads').select('*, action_history');

        // Filtrer par type de pipeline
        if (pipelineType) {
          query = query.eq('pipeline_type', pipelineType);
        }
        
        // Trier par date de création, plus récents d'abord
        query = query.order('created_at', { ascending: false });
        
        const { data: leadsData, error: leadsError } = await query;
        
        if (leadsError) {
          console.error('Error fetching leads:', leadsError);
          toast({
            variant: "destructive",
            title: "Erreur de chargement",
            description: "Impossible de charger les leads."
          });
          return;
        }
        
        // Traitement des leads reçus
        let allLeads = leadsData || [];
        console.log(`Retrieved leads: ${allLeads.length}`);
        
        // Transformation des leads pour l'affichage
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
            phoneCountryCode: lead.phone_country_code,
            phoneCountryCodeDisplay: lead.phone_country_code_display,
            preferredLanguage: lead.preferred_language,
            furnished: lead.furnished,
            furniture_included_in_price: lead.furniture_included_in_price,
            furniture_price: lead.furniture_price,
            regions: lead.regions || []
          };
        });
        
        console.log(`Mapped leads: ${mappedLeads.length}`);
        
        // Organiser les leads par colonne selon leur statut
        const updatedColumns = columns.map(column => {
          const columnItems = mappedLeads.filter(lead => lead.status === column.status);
          
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
