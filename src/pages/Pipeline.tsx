
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePipelineState } from '@/hooks/usePipelineState';
import PipelineHeader from '@/components/pipeline/PipelineHeader';
import MobilePipelineView from '@/components/pipeline/MobilePipelineView';
import DesktopPipelineView from '@/components/pipeline/DesktopPipelineView';

const Pipeline = () => {
  const isMobile = useIsMobile();
  
  // Use the custom hook for state management
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

  if (isMobile) {
    return (
      <div className="p-3 md:p-6 bg-white">
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
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <PipelineHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onToggleFilters={toggleFilters}
        filtersOpen={filtersOpen}
        activeFilters={activeFiltersCount}
        isFilterActive={isFilterActive}
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        teamMembers={teamMembers}
      />

      <DesktopPipelineView
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filters={filters}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default Pipeline;
