
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

  // Sync selected agent with pipeline filters - mais seulement s'il y a un changement réel
  useEffect(() => {
    // Éviter les mises à jour si on est en train de charger ou de rafraîchir
    if (isRefreshing) return;
    
    if (selectedAgent && selectedAgent !== filters.assignedTo) {
      updateAgentFilter(selectedAgent);
    } else if (!selectedAgent && filters.assignedTo) {
      // Si l'agent est effacé mais pas dans les filtres
      updateAgentFilter(null);
    }
  }, [selectedAgent, filters.assignedTo, updateAgentFilter, isRefreshing]);

  // Sync pipeline filters with selected agent - mais seulement s'il y a un changement réel
  useEffect(() => {
    // Éviter les mises à jour si on est en train de charger ou de rafraîchir
    if (isRefreshing) return;
    
    if (filters.assignedTo !== selectedAgent) {
      handleAgentChange(filters.assignedTo);
    }
  }, [filters.assignedTo, selectedAgent, handleAgentChange, isRefreshing]);

  // Fonction personnalisée pour effacer tous les filtres et l'agent sélectionné
  const handleClearAllFilters = useCallback(() => {
    // Désactiver temporairement la synchronisation pendant le nettoyage
    const originalAgent = selectedAgent;
    
    // Effacer les filtres d'abord
    handleClearFilters();
    
    // Puis effacer l'agent sélectionné
    if (originalAgent) {
      clearSelectedAgent();
    }
    
    // Déclencher un rafraîchissement explicite après un court délai
    setTimeout(() => handleRefresh(), 50);
  }, [selectedAgent, handleClearFilters, clearSelectedAgent, handleRefresh]);

  // Chargement initial
  useEffect(() => {
    handleRefresh();
  }, []);

  // Gestion des événements de sélection d'agent
  useEffect(() => {
    const handleAgentSelectionChange = (e: CustomEvent) => {
      // Ignorer les événements générés par notre propre hook
      if (e.detail.source === 'hook') return;
      
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
