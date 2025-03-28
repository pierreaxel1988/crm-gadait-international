
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet } from '@/components/ui/sheet';
import { Search, RefreshCcw, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PipelineFilters, { FilterOptions } from './PipelineFilters';
import { LeadStatus } from '@/components/common/StatusBadge';
import { useKanbanData } from '@/hooks/useKanbanData';
import { PipelineType } from '@/types/lead';
import { applyFiltersToColumns } from '@/utils/kanbanFilterUtils';
import KanbanBoard from '@/components/kanban/KanbanBoard';

interface DesktopPipelineViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filtersOpen: boolean;
  toggleFilters: () => void;
  activeFiltersCount: number;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  columns: any[];
  handleRefresh: () => void;
  isRefreshing: boolean;
  isFilterActive: (filterName: string) => boolean;
  teamMembers: { id: string; name: string }[];
}

const DesktopPipelineView: React.FC<DesktopPipelineViewProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  filtersOpen,
  toggleFilters,
  activeFiltersCount,
  filters,
  onFilterChange,
  onClearFilters,
  columns,
  handleRefresh,
  isRefreshing,
  isFilterActive,
  teamMembers
}) => {
  // Load column data with the hook
  const {
    loadedColumns,
    isLoading
  } = useKanbanData(columns, 0, activeTab as PipelineType);
  
  // Apply search term and filters
  const filteredColumns = React.useMemo(() => {
    let filtered = loadedColumns;
    
    // Apply search term filtering
    if (searchTerm) {
      filtered = filtered.map(column => ({
        ...column,
        items: column.items.filter(item => 
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.desiredLocation?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }));
    }
    
    // Apply other filters
    return applyFiltersToColumns(filtered, filters);
  }, [loadedColumns, searchTerm, filters]);
  
  // Handle filters apply
  const handleApplyFilters = () => {
    handleRefresh();
    toggleFilters();
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-170px)]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
        <TabsList className="bg-gray-100 p-1 rounded-xl w-80">
          <TabsTrigger 
            value="purchase" 
            className="flex-1 rounded-lg text-sm font-medium text-zinc-700 data-[state=active]:text-zinc-900 data-[state=active]:bg-white"
          >
            Achat
          </TabsTrigger>
          <TabsTrigger 
            value="rental" 
            className="flex-1 rounded-lg text-sm font-medium text-zinc-700 data-[state=active]:text-zinc-900 data-[state=active]:bg-white"
          >
            Location
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-[1fr_auto] gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Rechercher un lead..." 
            className="pl-9 pr-16 bg-gray-50 border border-gray-200" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
        
        <Button 
          variant={activeFiltersCount > 0 ? "default" : "outline"} 
          size="sm" 
          onClick={toggleFilters} 
          className="h-10 relative font-normal text-sm"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>
      
      <div className="relative flex-1 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Chargement des leads...</p>
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <KanbanBoard
              columns={filteredColumns}
              className="h-full"
              pipelineType={activeTab as PipelineType}
            />
          </div>
        )}
      </div>
      
      {/* Filters drawer */}
      {filtersOpen && (
        <Sheet open={filtersOpen} onOpenChange={toggleFilters}>
          <PipelineFilters 
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            assignedToOptions={teamMembers}
            isFilterActive={isFilterActive}
            isMobile={false}
            onApplyFilters={handleApplyFilters}
          />
        </Sheet>
      )}
    </div>
  );
};

export default DesktopPipelineView;
