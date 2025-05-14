import { useState, useEffect, useMemo } from 'react';
import { supabase, isOfflineMode, setOfflineMode } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { LeadStatus } from '@/components/common/StatusBadge';
import { PipelineType } from '@/types/lead';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { useQuery } from '@tanstack/react-query';

// Données de démonstration pour le mode hors ligne
const offlineLeadData = {
  columns: [
    { title: 'Nouveaux', status: 'New' as LeadStatus, items: [
      { id: 'offline-1', name: 'Client Hors Ligne 1', status: 'New', tags: ['hors-ligne'], assignedTo: null, email: 'exemple@mail.com', createdAt: new Date().toISOString() }
    ] },
    { title: 'Contactés', status: 'Contacted' as LeadStatus, items: [
      { id: 'offline-2', name: 'Client Hors Ligne 2', status: 'Contacted', tags: ['urgent', 'hors-ligne'], assignedTo: null, email: 'exemple2@mail.com', createdAt: new Date().toISOString() }
    ] },
    { title: 'Qualifiés', status: 'Qualified' as LeadStatus, items: [] },
    { title: 'Propositions', status: 'Proposal' as LeadStatus, items: [] },
    { title: 'Visites en cours', status: 'Visit' as LeadStatus, items: [] },
    { title: 'Offre en cours', status: 'Offer' as LeadStatus, items: [] },
    { title: 'Dépôt reçu', status: 'Deposit' as LeadStatus, items: [] },
    { title: 'Signature finale', status: 'Signed' as LeadStatus, items: [] },
    { title: 'Conclus', status: 'Gagné' as LeadStatus, items: [] },
    { title: 'Perdu', status: 'Perdu' as LeadStatus, items: [] }
  ],
  teamMembers: [
    { id: 'offline-team-1', name: 'Agent Hors Ligne' }
  ]
};

export const usePipelineData = (
  pipelineType: PipelineType = 'purchase',
  filters: FilterOptions = {} as FilterOptions,
  searchTerm: string = ''
) => {
  const { isCommercial, user } = useAuth();
  const [isConnectionError, setIsConnectionError] = useState(false);

  // Build query params for database
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      pipeline_type: pipelineType
    };
    
    // Add filters to query params
    if (filters.status) params.status = filters.status;
    if (filters.assignedTo) params.assigned_to = filters.assignedTo;
    if (filters.propertyType) params.property_type = filters.propertyType;
    if (filters.purchaseTimeframe) params.purchase_timeframe = filters.purchaseTimeframe;
    if (filters.location) params.location_contains = filters.location;
    if (filters.tags && filters.tags.length > 0) params.tags_contains = filters.tags;
    
    // Handle budget range if provided
    if (filters.minBudget || filters.maxBudget) {
      if (filters.minBudget) params.budget_gte = filters.minBudget;
      if (filters.maxBudget) params.budget_lte = filters.maxBudget;
    }
    
    // If commercial user, filter by their assignments
    if (isCommercial && user?.email) {
      params.assigned_to_email = user.email;
    }
    
    // Add search term if provided
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    return params;
  }, [pipelineType, filters, searchTerm, isCommercial, user]);

  // Fonction pour générer les colonnes vides
  const generateColumns = (pipelineType: PipelineType) => {
    if (pipelineType === "owners") {
      return [
        { title: 'Premier contact', status: 'New' as LeadStatus, items: [] },
        { title: 'Rendez-vous programmé', status: 'Contacted' as LeadStatus, items: [] },
        { title: 'Visite effectuée', status: 'Qualified' as LeadStatus, items: [] },
        { title: 'Mandat en négociation', status: 'Proposal' as LeadStatus, items: [] },
        { title: 'Mandat signé', status: 'Signed' as LeadStatus, items: [] },
        { title: 'Bien en commercialisation', status: 'Visit' as LeadStatus, items: [] },
        { title: 'Offre reçue', status: 'Offer' as LeadStatus, items: [] },
        { title: 'Compromis signé', status: 'Deposit' as LeadStatus, items: [] },
        { title: 'Vente finalisée', status: 'Gagné' as LeadStatus, items: [] },
        { title: 'Perdu/Annulé', status: 'Perdu' as LeadStatus, items: [] }
      ].map(col => ({
        ...col,
        items: [],
        pipelineType: "owners" as PipelineType
      }));
    }
    
    return [
      { title: 'Nouveaux', status: 'New' as LeadStatus, items: [] },
      { title: 'Contactés', status: 'Contacted' as LeadStatus, items: [] },
      { title: 'Qualifiés', status: 'Qualified' as LeadStatus, items: [] },
      { title: 'Propositions', status: 'Proposal' as LeadStatus, items: [] },
      { title: 'Visites en cours', status: 'Visit' as LeadStatus, items: [] },
      { title: 'Offre en cours', status: 'Offer' as LeadStatus, items: [] },
      { title: 'Dépôt reçu', status: 'Deposit' as LeadStatus, items: [] },
      { title: 'Signature finale', status: 'Signed' as LeadStatus, items: [] },
      { title: 'Conclus', status: 'Gagné' as LeadStatus, items: [] },
      { title: 'Perdu', status: 'Perdu' as LeadStatus, items: [] }
    ].map(col => ({
      ...col,
      items: [],
      pipelineType: pipelineType as PipelineType
    }));
  };

  // Utiliser React Query pour la gestion des données avec mode hors ligne
  const {
    data: pipelineData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['pipelineData', queryParams, isOfflineMode],
    queryFn: async () => {
      // Si mode hors ligne, retourner les données de démonstration
      if (isOfflineMode) {
        console.log('Chargement des données en mode hors ligne');
        return {
          columns: offlineLeadData.columns.map(col => ({
            ...col,
            pipelineType
          })),
          teamMembers: offlineLeadData.teamMembers
        };
      }
      
      try {
        setIsConnectionError(false);
        
        // First get team members for assignments
        const { data: teamMembers, error: teamError } = await supabase
          .from('team_members')
          .select('id, email, name');
          
        if (teamError) {
          console.error('Error fetching team members:', teamError);
          throw teamError;
        }
        
        // Fetch leads with filters
        let query = supabase.from('leads').select('*, action_history');
        
        // Apply pipeline type filter
        query = query.eq('pipeline_type', pipelineType);
        
        // Apply status filter if provided
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        // Apply assigned to filter if provided
        if (filters.assignedTo) {
          query = query.eq('assigned_to', filters.assignedTo);
        } else if (isCommercial && user?.email) {
          // If commercial user, only show their leads
          const currentTeamMember = teamMembers?.find(tm => tm.email === user.email);
          if (currentTeamMember) {
            query = query.eq('assigned_to', currentTeamMember.id);
          }
        }
        
        // Apply property type filter if provided
        if (filters.propertyType) {
          query = query.eq('property_type', filters.propertyType);
        }
        
        // Apply purchase timeframe filter if provided
        if (filters.purchaseTimeframe) {
          query = query.eq('purchase_timeframe', filters.purchaseTimeframe);
        }
        
        // Apply location filter if provided
        if (filters.location) {
          query = query.ilike('desired_location', `%${filters.location}%`);
        }
        
        // Apply tags filter if provided
        if (filters.tags && filters.tags.length > 0) {
          // Handle array contains for tags
          const tagConditions = filters.tags.map(tag => 
            `'${tag}' = ANY(tags)`
          );
          query = query.or(tagConditions.join(','));
        }
        
        // Apply budget range filter if provided
        if (filters.minBudget) {
          // This is simplified, would need proper numeric comparison logic
          query = query.gte('budget', filters.minBudget);
        }
        
        if (filters.maxBudget) {
          // This is simplified, would need proper numeric comparison logic
          query = query.lte('budget', filters.maxBudget);
        }
        
        // Apply search term filter if provided
        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,desired_location.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }
        
        // Order by recent first
        query = query.order('created_at', { ascending: false });
        
        // Get leads with filters applied
        const { data: leads, error: leadsError } = await query;
        
        if (leadsError) {
          console.error('Error fetching leads:', leadsError);
          throw leadsError;
        }
        
        // Transform data into column structure
        const columns = generateColumns(pipelineType);
        
        // Map leads to their respective columns
        leads?.forEach(lead => {
          const column = columns.find(col => col.status === lead.status);
          if (column) {
            const assignedTeamMember = teamMembers?.find(tm => tm.id === lead.assigned_to);
            
            column.items.push({
              id: lead.id,
              name: lead.name,
              email: lead.email || '',
              phone: lead.phone,
              status: lead.status as LeadStatus,
              tags: lead.tags || [],
              assignedTo: lead.assigned_to,
              assignedToName: assignedTeamMember?.name,
              dueDate: lead.next_follow_up_date,
              nextFollowUpDate: lead.next_follow_up_date,
              pipelineType: lead.pipeline_type as PipelineType,
              taskType: lead.task_type,
              budget: lead.budget,
              desiredLocation: lead.desired_location,
              purchaseTimeframe: lead.purchase_timeframe,
              propertyType: lead.property_type,
              country: lead.country,
              bedrooms: lead.bedrooms,
              url: lead.url,
              createdAt: lead.created_at,
              importedAt: lead.imported_at,
              currency: lead.currency,
              actionHistory: lead.action_history,
              phoneCountryCode: lead.phone_country_code,
              phoneCountryCodeDisplay: lead.phone_country_code_display,
              preferredLanguage: lead.preferred_language,
            });
          }
        });
        
        return { 
          columns, 
          teamMembers
        };
      } catch (error) {
        console.error('Error fetching pipeline data:', error);
        if (error instanceof Error && error.message.includes('Load failed')) {
          setIsConnectionError(true);
          setOfflineMode(true);
        }
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 60000, // 1 minute
    // En cas d'erreur, passer automatiquement en mode hors ligne
    onError: () => {
      setOfflineMode(true);
    }
  });

  return {
    columns: pipelineData?.columns || generateColumns(pipelineType),
    teamMembers: pipelineData?.teamMembers || offlineLeadData.teamMembers,
    isLoading,
    isError,
    isConnectionError,
    isOfflineMode,
    error,
    refetch,
    toggleOfflineMode: () => setOfflineMode(!isOfflineMode)
  };
};
