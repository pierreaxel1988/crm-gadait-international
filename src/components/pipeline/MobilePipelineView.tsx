
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import PipelineFilters from '@/components/pipeline/PipelineFilters';
import MobileColumnList from './mobile/MobileColumnList';
import { LeadStatus } from '@/components/common/StatusBadge';

interface MobilePipelineViewProps {
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
  handleRefresh: () => void;
  isRefreshing: boolean;
  isFilterActive: (filterName: string) => boolean;
  teamMembers: { id: string; name: string }[];
  columns: Array<{
    title: string;
    status: LeadStatus;
    items: any[];
    pipelineType?: 'purchase' | 'rental';
  }>;
}

const MobilePipelineView: React.FC<MobilePipelineViewProps> = ({
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
  handleRefresh,
  isRefreshing,
  isFilterActive,
  teamMembers,
  columns
}) => {
  const [expandedColumn, setExpandedColumn] = useState<LeadStatus | null>(null);

  const toggleColumnExpand = (status: LeadStatus) => {
    setExpandedColumn(prev => prev === status ? null : status);
  };

  // Function to handle applying filters and closing the filter panel
  const handleApplyFilters = () => {
    handleRefresh();
    toggleFilters();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="tracking-tight text-xl font-medium">Pipeline</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant={activeFiltersCount > 0 ? "default" : "outline"} 
            size="sm" 
            onClick={toggleFilters} 
            className="h-9 px-4 relative"
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
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un lead..."
          className="pl-9 bg-gray-100 border-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters panel (in a Sheet) */}
      <Sheet open={filtersOpen} onOpenChange={toggleFilters}>
        <SheetContent side="right" className="w-[300px] sm:w-[425px]">
          <SheetHeader className="mb-4">
            <SheetTitle>Filtres</SheetTitle>
          </SheetHeader>
          <PipelineFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            onApplyFilters={handleApplyFilters}
            assignedToOptions={teamMembers}
            isFilterActive={isFilterActive}
          />
        </SheetContent>
      </Sheet>

      {/* Tabs for Purchase/Rental */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="purchase" className="flex-1">Achat</TabsTrigger>
          <TabsTrigger value="rental" className="flex-1">Location</TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchase" className="mt-4">
          <MobileColumnList 
            columns={columns}
            expandedColumn={expandedColumn}
            toggleColumnExpand={toggleColumnExpand}
            activeTab="purchase"
            searchTerm={searchTerm}
            filters={filters}
          />
        </TabsContent>
        
        <TabsContent value="rental" className="mt-4">
          <MobileColumnList 
            columns={columns}
            expandedColumn={expandedColumn}
            toggleColumnExpand={toggleColumnExpand}
            activeTab="rental"
            searchTerm={searchTerm}
            filters={filters}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobilePipelineView;
