
import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePipelineState } from '@/hooks/usePipelineState';
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

  useEffect(() => {
    // Force a refresh when the component mounts to ensure data is loaded
    handleRefresh();
  }, []);

  console.log("Pipeline page - isMobile:", isMobile);
  console.log("Pipeline page - activeTab:", activeTab);
  console.log("Pipeline page - filters:", filters);

  return (
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
  );
};

export default Pipeline;
