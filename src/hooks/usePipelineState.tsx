
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { supabase } from '@/integrations/supabase/client';
import { LeadStatus } from '@/components/common/StatusBadge';
import { toast } from '@/hooks/use-toast';
import { PipelineType } from '@/types/lead';

export function usePipelineState() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab');
  
  // State management
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl === 'rental' ? 'rental' : 'purchase');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{id: string, name: string}[]>([]);
  
  // Initialize filter state
  const [filters, setFilters] = useState<FilterOptions>({
    status: null,
    tags: [],
    assignedTo: null,
    minBudget: '',
    maxBudget: '',
    location: '',
    purchaseTimeframe: null,
    propertyType: null
  });

  // Mettre à jour uniquement le filtre d'agent sans affecter les autres filtres
  const updateAgentFilter = useCallback((agentId: string | null) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      assignedTo: agentId
    }));
  }, []);

  // Auto-refresh when component mounts
  useEffect(() => {
    handleRefresh();
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    navigate(`/pipeline?tab=${activeTab}`, { replace: true });
    // Force a refresh when switching tabs
    handleRefresh();
  }, [activeTab, navigate]);

  // Update tab from URL when it changes
  useEffect(() => {
    if (tabFromUrl === 'rental' || tabFromUrl === 'purchase') {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Apply filters when they change
  useEffect(() => {
    // When filters change, trigger a refresh to update the data
    if (refreshTrigger > 0) { // Skip the initial render
      handleRefresh();
    }
  }, [filters]);

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name');
          
        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }
        
        if (data) {
          setTeamMembers(data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchTeamMembers();
  }, []);

  // Check if any filters are active
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== null) count++;
    if (filters.tags.length > 0) count++;
    if (filters.assignedTo !== null) count++;
    if (filters.minBudget !== '') count++;
    if (filters.maxBudget !== '') count++;
    if (filters.location !== '') count++;
    if (filters.purchaseTimeframe !== null) count++;
    if (filters.propertyType !== null) count++;
    return count;
  }, [filters]);

  // Check if a specific filter is active
  const isFilterActive = (filterName: string): boolean => {
    switch (filterName) {
      case 'status':
        return filters.status !== null;
      case 'tags':
        return filters.tags.length > 0;
      case 'assignedTo':
        return filters.assignedTo !== null;
      case 'budget':
        return filters.minBudget !== '' || filters.maxBudget !== '';
      case 'location':
        return filters.location !== '';
      case 'purchaseTimeframe':
        return filters.purchaseTimeframe !== null;
      case 'propertyType':
        return filters.propertyType !== null;
      default:
        return false;
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
    
    // Provide visual confirmation that filters are being applied
    if (activeFiltersCount > 0) {
      toast({
        title: "Filtres appliqués",
        description: `${activeFiltersCount} filtres actifs`,
        duration: 2000,
      });
    }
    
    // Vérifier s'il y a des leads dans la base de données
    const checkLeads = async () => {
      try {
        const { count, error } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error('Error checking leads:', error);
          return;
        }
        
        console.log(`Nombre de leads dans la base de données: ${count}`);
        
        if (count === 0) {
          toast({
            title: "Aucun lead trouvé",
            description: "La base de données ne contient pas de leads. Ajoutez-en un pour commencer.",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setTimeout(() => setIsRefreshing(false), 500); // Reduced time for a more efficient feel
      }
    };
    
    checkLeads();
  };

  // Clear all filters - MODIFICATION: ne plus conserver l'agent sélectionné
  const handleClearFilters = () => {
    // Modification: Réinitialiser complètement tous les filtres, y compris assignedTo
    setFilters({
      status: null,
      tags: [],
      assignedTo: null,  // Effacer aussi l'agent sélectionné
      minBudget: '',
      maxBudget: '',
      location: '',
      purchaseTimeframe: null,
      propertyType: null
    });
    
    // Notification that filters were cleared
    toast({
      title: "Filtres effacés",
      description: "Tous les filtres ont été supprimés",
      duration: 2000,
    });
    
    // Trigger a refresh to update data
    handleRefresh();
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setFiltersOpen(prev => !prev);
  };

  // Get all column data for mobile view
  const getAllColumns = () => {
    // Define the kanban columns with proper LeadStatus typing
    return [
      { title: 'Nouveaux', status: 'New' as LeadStatus },
      { title: 'Contactés', status: 'Contacted' as LeadStatus },
      { title: 'Qualifiés', status: 'Qualified' as LeadStatus },
      { title: 'Propositions', status: 'Proposal' as LeadStatus },
      { title: 'Visites en cours', status: 'Visit' as LeadStatus },
      { title: 'Offre en cours', status: 'Offer' as LeadStatus },
      { title: 'Dépôt reçu', status: 'Deposit' as LeadStatus },
      { title: 'Signature finale', status: 'Signed' as LeadStatus },
      { title: 'Conclus', status: 'Gagné' as LeadStatus },
      { title: 'Perdu', status: 'Perdu' as LeadStatus }
    ].map(col => ({
      ...col,
      items: [],
      pipelineType: activeTab as PipelineType
    }));
  };

  return {
    activeTab,
    setActiveTab,
    refreshTrigger,
    isRefreshing,
    searchTerm,
    setSearchTerm,
    filtersOpen,
    toggleFilters,
    filters,
    setFilters,
    teamMembers,
    activeFiltersCount,
    isFilterActive,
    handleRefresh,
    handleClearFilters,
    getAllColumns,
    updateAgentFilter
  };
}
