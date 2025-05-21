
import React, { useEffect, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePipelineState } from '@/hooks/usePipelineState';
import MobilePipelineView from '@/components/pipeline/MobilePipelineView';
import DesktopPipelineView from '@/components/pipeline/DesktopPipelineView';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';
import LoadingScreen from '@/components/layout/LoadingScreen';
import ComponentLoader from '@/components/common/ComponentLoader';
import { reassignJadeLeads, reassignJeanMarcLeads, reassignSharonLeads } from '@/services/leadService';
import NewLeadsAlert from '@/components/notifications/NewLeadsAlert';

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

  const selectedAgentName = useMemo(() => {
    if (!selectedAgent) return null;
    const agent = teamMembers.find(member => member.id === selectedAgent);
    return agent ? agent.name : null;
  }, [selectedAgent, teamMembers]);

  useEffect(() => {
    if (selectedAgent !== filters.assignedTo) {
      updateAgentFilter(selectedAgent);
    }
  }, [selectedAgent, filters.assignedTo, updateAgentFilter]);

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    const fixLeadsAssignment = async () => {
      try {
        console.log("Running lead reassignment for Jade, Jean Marc, and Sharon...");
        await reassignJadeLeads();
        await reassignJeanMarcLeads();
        await reassignSharonLeads();
        console.log("Lead reassignments completed successfully");
      } catch (error) {
        console.error('Error fixing lead assignments:', error);
      }
    };

    fixLeadsAssignment();
  }, []);

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

  const handleClearAllFilters = () => {
    window.dispatchEvent(new Event('filters-cleared'));
    handleClearFilters();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
        <SubNavigation />
        <NewLeadsAlert />
      </div>
      
      <div className="pt-[144px] bg-white min-h-screen">
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
    </div>
  );
};

export default Pipeline;
