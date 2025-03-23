
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';
import MobilePipelineHeader from './mobile/MobilePipelineHeader';
import MobileColumnList from './mobile/MobileColumnList';
import MobileActionsDrawer from './mobile/MobileActionsDrawer';
import { FilterOptions } from '@/components/pipeline/PipelineFilters';
import { LeadStatus } from '@/components/common/StatusBadge';
import { KanbanItem } from '@/components/kanban/KanbanCard';

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
  columns: Array<{
    title: string;
    status: LeadStatus;
    items: KanbanItem[];
    pipelineType?: 'purchase' | 'rental';
  }>;
  handleRefresh: () => void;
  isRefreshing: boolean;
}

const MobilePipelineView = ({
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
}: MobilePipelineViewProps) => {
  const [expandedColumn, setExpandedColumn] = useState<LeadStatus | null>(null);

  const toggleColumnExpand = (status: LeadStatus) => {
    if (expandedColumn === status) {
      setExpandedColumn(null);
    } else {
      setExpandedColumn(status);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with search and tabs */}
      <MobilePipelineHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filtersOpen={filtersOpen}
        toggleFilters={toggleFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Columns list */}
      <MobileColumnList
        columns={columns}
        expandedColumn={expandedColumn}
        toggleColumnExpand={toggleColumnExpand}
        activeTab={activeTab}
      />

      {/* Floating action button and drawer */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-loro-terracotta hover:bg-loro-500 p-0 flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-6">
          <MobileActionsDrawer 
            activeTab={activeTab}
            handleRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobilePipelineView;
