
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
  
  const [activeTab, setActiveTab] = useState<string>(
    tabFromUrl === 'rental'
      ? 'rental'
      : tabFromUrl === "owners"
        ? "owners"
        : 'purchase'
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{id: string, name: string}[]>([]);
  
  const [filters, setFilters] = useState<FilterOptions>({
    status: null,
    statuses: [],
    tags: [],
    assignedTo: null,
    minBudget: '',
    maxBudget: '',
    location: '',
    country: '',
    purchaseTimeframe: null,
    propertyType: null,
    propertyTypes: []
  });

  const updateAgentFilter = useCallback((agentId: string | null) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      assignedTo: agentId
    }));
  }, []);

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    navigate(`/pipeline?tab=${activeTab}`, { replace: true });
    handleRefresh();
  }, [activeTab, navigate]);

  useEffect(() => {
    if (tabFromUrl === 'rental' || tabFromUrl === 'purchase' || tabFromUrl === "owners") {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      handleRefresh();
    }
  }, [filters]);

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

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== null) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.assignedTo !== null) count++;
    if (filters.minBudget !== '') count++;
    if (filters.maxBudget !== '') count++;
    if (filters.location !== '') count++;
    if (filters.country !== '') count++;
    if (filters.purchaseTimeframe !== null) count++;
    if (filters.propertyType !== null) count++;
    if (filters.propertyTypes.length > 0) count++;
    return count;
  }, [filters]);

  const isFilterActive = (filterName: string): boolean => {
    switch (filterName) {
      case 'status':
        return filters.status !== null;
      case 'statuses':
        return filters.statuses.length > 0;
      case 'tags':
        return filters.tags.length > 0;
      case 'assignedTo':
        return filters.assignedTo !== null;
      case 'budget':
        return filters.minBudget !== '' || filters.maxBudget !== '';
      case 'location':
        return filters.location !== '';
      case 'country':
        return filters.country !== '';
      case 'purchaseTimeframe':
        return filters.purchaseTimeframe !== null;
      case 'propertyType':
        return filters.propertyType !== null;
      case 'propertyTypes':
        return filters.propertyTypes.length > 0;
      default:
        return false;
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
    
    if (activeFiltersCount > 0) {
      toast({
        title: "Filtres appliqués",
        description: `${activeFiltersCount} filtres actifs`,
        duration: 2000,
      });
    }
    
    const checkLeads = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('id, name')
          .is('deleted_at', null)
          .limit(1);
          
        if (error) {
          console.error('Error checking leads:', error);
          return;
        }
        
        console.log(`Leads accessibles: ${data?.length || 0}`);
        
        if (!data || data.length === 0) {
          console.log("Aucun lead accessible pour cet utilisateur");
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    };
    
    checkLeads();
  };

  const handleClearFilters = () => {
    setFilters({
      status: null,
      statuses: [],
      tags: [],
      assignedTo: null,
      minBudget: '',
      maxBudget: '',
      location: '',
      country: '',
      purchaseTimeframe: null,
      propertyType: null,
      propertyTypes: []
    });
    
    toast({
      title: "Filtres effacés",
      description: "Tous les filtres ont été supprimés",
      duration: 2000,
    });
    
    handleRefresh();
  };

  const toggleFilters = () => {
    setFiltersOpen(prev => !prev);
  };

  const getAllColumns = () => {
    if (activeTab === "owners") {
      return [
        { title: 'Premier contact', status: 'New' as LeadStatus },
        { title: 'Rendez-vous programmé', status: 'Contacted' as LeadStatus },
        { title: 'Visite effectuée', status: 'Qualified' as LeadStatus },
        { title: 'Mandat en négociation', status: 'Proposal' as LeadStatus },
        { title: 'Mandat signé', status: 'Signed' as LeadStatus },
        { title: 'Bien en commercialisation', status: 'Visit' as LeadStatus },
        { title: 'Offre reçue', status: 'Offre' as LeadStatus },
        { title: 'Compromis signé', status: 'Deposit' as LeadStatus },
        { title: 'Vente finalisée', status: 'Gagné' as LeadStatus },
        { title: 'Perdu/Annulé', status: 'Perdu' as LeadStatus }
      ].map(col => ({
        ...col,
        items: [],
        pipelineType: "owners" as PipelineType
      }));
    }
    return [
      { title: 'Nouveaux', status: 'New' as LeadStatus },
      { title: 'Contactés', status: 'Contacted' as LeadStatus },
      { title: 'Qualifiés', status: 'Qualified' as LeadStatus },
      { title: 'Propositions', status: 'Proposal' as LeadStatus },
      { title: 'Visites en cours', status: 'Visit' as LeadStatus },
      { title: 'Offre en cours', status: 'Offre' as LeadStatus },
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
