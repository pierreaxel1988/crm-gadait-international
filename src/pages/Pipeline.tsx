
import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePipelineState } from '@/hooks/usePipelineState';
import MobilePipelineView from '@/components/pipeline/MobilePipelineView';
import DesktopPipelineView from '@/components/pipeline/DesktopPipelineView';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { useSelectedAgent } from '@/hooks/useSelectedAgent';

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
    getAllColumns
  } = usePipelineState();

  const { selectedAgent, handleAgentChange } = useSelectedAgent();

  // Initial load
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Apply the selectedAgent to filters when it changes
  useEffect(() => {
    if (filters.assignedTo !== selectedAgent) {
      setFilters({
        ...filters,
        assignedTo: selectedAgent
      });
      // Force refresh data when agent changes
      handleRefresh();
    }
  }, [selectedAgent, filters, setFilters, handleRefresh]);

  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-3 md:p-6 bg-white min-h-screen">
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
