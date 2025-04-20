
import React, { useEffect, useMemo, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePipelineState } from '@/hooks/usePipelineState';
import MobilePipelineView from '@/components/pipeline/MobilePipelineView';
import DesktopPipelineView from '@/components/pipeline/DesktopPipelineView';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import SelectedAgentDisplay from '@/components/pipeline/SelectedAgentDisplay';
import LoadingScreen from '@/components/layout/LoadingScreen';
import ComponentLoader from '@/components/common/ComponentLoader';

const Pipeline = () => {
  const isMobile = useIsMobile();
  
  const { 
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
  } = usePipelineState();

  const { selectedAgent, handleAgentChange, clearSelectedAgent } = useSelectedAgent();

  // Get selected agent name
  const selectedAgentName = useMemo(() => {
    if (!selectedAgent) return null;
    const agent = teamMembers.find(member => member.id === selectedAgent);
    return agent ? agent.name : null;
  }, [selectedAgent, teamMembers]);

  // Fonction pour éviter les boucles de synchronisation
  const syncFilterWithAgent = useCallback((agentId: string | null) => {
    console.log('Synchronisant le filtre avec agent:', agentId);
    updateAgentFilter(agentId);
    // Ne pas déclencher de rafraîchissement automatique ici
  }, [updateAgentFilter]);

  // Synchroniser avec le système global d'agent sélectionné, mais éviter les boucles
  useEffect(() => {
    // Éviter les mises à jour si on est en train de charger ou de rafraîchir
    if (isRefreshing) return;
    
    // Si l'agent sélectionné change et que le filtre ne correspond pas
    if (selectedAgent !== filters.assignedTo) {
      console.log('Agent selected changed, updating filter:', selectedAgent);
      syncFilterWithAgent(selectedAgent);
    }
  }, [selectedAgent, filters.assignedTo, syncFilterWithAgent, isRefreshing]);

  // Fonction personnalisée pour effacer tous les filtres et l'agent sélectionné
  const handleClearAllFilters = useCallback(() => {
    console.log('Clearing all filters and selected agent');
    
    // Désactiver temporairement la synchronisation pendant le nettoyage
    handleClearFilters();
    
    // Effacer l'agent sélectionné
    clearSelectedAgent();
    
    // Déclencher un rafraîchissement après un délai
    setTimeout(() => handleRefresh(), 100);
  }, [handleClearFilters, clearSelectedAgent, handleRefresh]);

  // Chargement initial
  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-3 md:p-6 bg-white min-h-screen">
        <SelectedAgentDisplay agentName={selectedAgentName} />
        
        <ComponentLoader isLoading={isRefreshing}>
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
              columns={getAllColumns()}
              handleRefresh={handleRefresh}
              isRefreshing={isRefreshing}
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
              columns={getAllColumns()}
              handleRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              isFilterActive={isFilterActive}
              teamMembers={teamMembers}
            />
          )}
        </ComponentLoader>
      </div>
    </>
  );
};

export default Pipeline;
