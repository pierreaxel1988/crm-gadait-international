
import React, { useEffect, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePipelineState } from '@/hooks/usePipelineState';
import MobilePipelineView from '@/components/pipeline/MobilePipelineView';
import DesktopPipelineView from '@/components/pipeline/DesktopPipelineView';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import SelectedAgentDisplay from '@/components/pipeline/SelectedAgentDisplay';

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

  const { selectedAgent, handleAgentChange } = useSelectedAgent();

  // Get selected agent name
  const selectedAgentName = useMemo(() => {
    if (!selectedAgent) return null;
    const agent = teamMembers.find(member => member.id === selectedAgent);
    return agent ? agent.name : null;
  }, [selectedAgent, teamMembers]);

  // Sync pipeline filters with selected agent
  useEffect(() => {
    if (selectedAgent !== filters.assignedTo) {
      updateAgentFilter(selectedAgent);
    }
  }, [selectedAgent, filters.assignedTo, updateAgentFilter]);

  // Sync selected agent with pipeline filters
  useEffect(() => {
    if (filters.assignedTo !== selectedAgent) {
      handleAgentChange(filters.assignedTo);
    }
  }, [filters.assignedTo, selectedAgent, handleAgentChange]);

  useEffect(() => {
    handleRefresh();
  }, []);

  // Écouter les changements d'agent depuis d'autres composants
  useEffect(() => {
    const handleAgentSelectionChange = (e: CustomEvent) => {
      const newAgent = e.detail.selectedAgent;
      if (newAgent !== selectedAgent) {
        handleAgentChange(newAgent);
        updateAgentFilter(newAgent);
      }
    };

    window.addEventListener('agent-selection-changed', handleAgentSelectionChange as EventListener);
    return () => {
      window.removeEventListener('agent-selection-changed', handleAgentSelectionChange as EventListener);
    };
  }, [selectedAgent, handleAgentChange, updateAgentFilter]);

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-3 md:p-6 bg-white min-h-screen">
        <SelectedAgentDisplay agentName={selectedAgentName} />
        
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
            onClearFilters={handleClearFilters}
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
            onClearFilters={handleClearFilters}
            columns={getAllColumns()}
            handleRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            isFilterActive={isFilterActive}
            teamMembers={teamMembers}
          />
        )}
      </div>
    </>
  );
};

export default Pipeline;
