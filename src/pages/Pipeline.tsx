
import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePipelineState } from '@/hooks/usePipelineState';
import MobilePipelineView from '@/components/pipeline/MobilePipelineView';
import DesktopPipelineView from '@/components/pipeline/DesktopPipelineView';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import LoadingScreen from '@/components/layout/LoadingScreen';
import ComponentLoader from '@/components/common/ComponentLoader';
import { toast } from '@/hooks/use-toast';
import { usePipelineData } from '@/hooks/usePipelineData';
import { PipelineType } from '@/types/lead';
import { checkSupabaseConnection } from '@/integrations/supabase/client';

const Pipeline = () => {
  const isMobile = useIsMobile();
  
  const { 
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filtersOpen,
    toggleFilters,
    filters,
    setFilters,
    activeFiltersCount,
    isFilterActive,
    handleClearFilters,
  } = usePipelineState();

  const { selectedAgent, handleAgentChange } = useSelectedAgent();

  // Check Supabase connection on initial load
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter à la base de données. Veuillez vérifier votre connexion internet et recharger la page.",
          variant: "destructive"
        });
      }
    };
    
    checkConnection();
  }, []);

  // Update agent filter when selected agent changes
  useEffect(() => {
    if (selectedAgent !== filters.assignedTo) {
      setFilters(prev => ({
        ...prev,
        assignedTo: selectedAgent
      }));
    }
  }, [selectedAgent, filters.assignedTo, setFilters]);

  // Listen for agent selection changes from other components
  useEffect(() => {
    const handleAgentSelectionChange = (e: CustomEvent) => {
      const newAgent = e.detail.selectedAgent;
      if (newAgent !== selectedAgent) {
        handleAgentChange(newAgent);
      }
    };

    window.addEventListener('agent-selection-changed', handleAgentSelectionChange as EventListener);
    return () => {
      window.removeEventListener('agent-selection-changed', handleAgentSelectionChange as EventListener);
    };
  }, [selectedAgent, handleAgentChange]);

  // Use the new optimized hook for fetching pipeline data
  const {
    columns,
    teamMembers,
    isLoading,
    isError,
    isConnectionError,
    refetch
  } = usePipelineData(activeTab as PipelineType, filters, searchTerm);

  const handleClearAllFilters = () => {
    window.dispatchEvent(new Event('filters-cleared'));
    handleClearFilters();
  };

  const handleRefresh = () => {
    refetch();
  };
  
  // Unified error handling
  if (isConnectionError) {
    return (
      <>
        <Navbar />
        <SubNavigation />
        <div className="p-3 md:p-6 bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Erreur de connexion</h2>
            <p className="text-gray-600 mb-4">Impossible de se connecter à la base de données.</p>
            <button 
              className="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800"
              onClick={() => window.location.reload()}
            >
              Recharger la page
            </button>
          </div>
        </div>
      </>
    );
  }
  
  if (isError) {
    toast({
      title: "Erreur de chargement",
      description: "Une erreur s'est produite lors du chargement des leads.",
      variant: "destructive"
    });
    return <LoadingScreen />;
  }
  
  try {
    return (
      <>
        <Navbar />
        <SubNavigation />
        <div className="p-3 md:p-6 bg-white min-h-screen">
          <ComponentLoader isLoading={isLoading}>
            {isMobile ? (
              <MobilePipelineView
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filtersOpen={filtersOpen}
                toggleFilters={toggleFilters}
                activeFiltersCount={activeFiltersCount}
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={handleClearAllFilters}
                columns={columns}
                handleRefresh={handleRefresh}
                isRefreshing={isLoading}
                isFilterActive={isFilterActive}
                teamMembers={teamMembers}
              />
            ) : (
              <DesktopPipelineView
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filtersOpen={filtersOpen}
                toggleFilters={toggleFilters}
                activeFiltersCount={activeFiltersCount}
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={handleClearAllFilters}
                columns={columns}
                handleRefresh={handleRefresh}
                isRefreshing={isLoading}
                isFilterActive={isFilterActive}
                teamMembers={teamMembers}
              />
            )}
          </ComponentLoader>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error rendering Pipeline:', error);
    toast({
      title: "Erreur de chargement",
      description: "Une erreur s'est produite lors du chargement de la page Pipeline.",
      variant: "destructive"
    });
    return <LoadingScreen />;
  }
};

export default Pipeline;
