
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
        console.log(`===== DÉBUT DU CHARGEMENT DES LEADS =====`);
        console.log(`Fetching leads for pipeline: ${pipelineType}`);
        
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
        
        // Vérifier si la table leads existe et contient des données
        const { count, error: countError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });
          
        console.log('Nombre total de leads dans la base de données:', count);
        
        if (countError) {
          console.error('Erreur lors de la vérification des leads:', countError);
        }
        
        // Récupération des données brutes de leads depuis Supabase
        console.log('Récupération des leads depuis Supabase...');
        const { data: supabaseLeads, error: leadsError } = await supabase
          .from('leads')
          .select('*');
          
        // If there's an error or no data from Supabase, fall back to local leads
        let leads = [];
        if (leadsError || !supabaseLeads || supabaseLeads.length === 0) {
          console.log('Falling back to local leads data - Aucun lead trouvé dans Supabase');
          leads = await getLeads();
        } else {
          leads = supabaseLeads;
          console.log('Retrieved leads from Supabase:', leads.length);
        }
        
        console.log('===== TOUS LES LEADS AVANT TRAITEMENT =====');
        if (leads.length === 0) {
          console.warn('ATTENTION: Aucun lead trouvé dans la base de données!');
        } else {
          console.log(`${leads.length} leads trouvés, voici un exemple:`, leads[0]);
        }
        
        // Afficher les détails de chaque lead pour comprendre où est le problème
        console.log('===== DÉTAILS DE CHAQUE LEAD POUR DÉBOGAGE =====');
        leads.forEach((lead, index) => {
          console.log(`Lead #${index + 1} (${lead.name}):`);
          console.log(`  - ID: ${lead.id}`);
          console.log(`  - Status: ${lead.status}`);
          console.log(`  - Pipeline type DB: ${lead.pipeline_type}`); 
          console.log(`  - Pipeline type App: ${lead.pipelineType}`);
          console.log(`  - Date de création: ${lead.created_at || lead.createdAt}`);
          console.log(`  - Tags:`, lead.tags);
        });
        
        // Map leads data to KanbanItem format
        console.log('===== CONVERSION DES LEADS AU FORMAT KANBAN =====');
        const mappedLeads = leads.map(lead => {
          const assignedTeamMember = teamMembers.find(tm => tm.id === lead.assigned_to);
          
          // Détermine le pipeline_type avec une valeur par défaut
          const leadPipelineType = lead.pipeline_type || lead.pipelineType || 'purchase';
          
          // Log détaillé pour la détection du pipeline type
          console.log(`Traitement du lead ${lead.id} (${lead.name}):`);
          console.log(`  - pipeline_type de la DB: "${lead.pipeline_type}"`);
          console.log(`  - pipelineType de l'app: "${lead.pipelineType}"`);
          console.log(`  - Pipeline type final: "${leadPipelineType}"`);
          
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
            createdAt: lead.created_at ? new Date(lead.created_at).toLocaleDateString('fr-FR') : undefined,
            importedAt: lead.imported_at ? new Date(lead.imported_at).toLocaleDateString('fr-FR') : undefined,
            external_id: lead.external_id
          };
        });
        
        console.log('===== LEADS APRÈS CONVERSION =====');
        console.log(`${mappedLeads.length} leads convertis au format Kanban`);
        console.log(`Pipeline actuel recherché: ${pipelineType}`);
        
        // FILTRAGE DÉSACTIVÉ POUR DÉBOGAGE - Afficher tous les leads dans toutes les colonnes
        console.log('===== DÉSACTIVATION DU FILTRAGE POUR DÉBOGAGE =====');
        console.log('Affichage de tous les leads sans filtrage par pipeline');
        const filteredLeads = mappedLeads;
        
        console.log(`Total de leads à afficher: ${filteredLeads.length}`);
        
        // Group leads by status
        console.log('===== RÉPARTITION DES LEADS PAR STATUT =====');
        const updatedColumns = columns.map(column => {
          const columnItems = filteredLeads.filter(lead => lead.status === column.status);
          console.log(`Colonne "${column.status}": ${columnItems.length} leads`);
          
          if (columnItems.length > 0) {
            console.log(`  Premier lead dans la colonne "${column.status}":`, columnItems[0].name);
          }
          
          return {
            ...column,
            items: columnItems as ExtendedKanbanItem[],
            pipelineType
          };
        });
        
        console.log('===== FIN DU CHARGEMENT DES LEADS =====');
        setLoadedColumns(updatedColumns);
      } catch (error) {
        console.error('ERREUR CRITIQUE dans useKanbanData:', error);
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
