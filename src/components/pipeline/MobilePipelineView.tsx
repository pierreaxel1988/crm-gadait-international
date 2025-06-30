
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MobilePipelineHeader from './mobile/MobilePipelineHeader';
import MobileColumnList from './mobile/MobileColumnList';
import PipelineFilters, { FilterOptions } from './PipelineFilters';
import { PipelineType } from '@/types/lead';
import { SlidersHorizontal, ArrowDownAZ, Clock, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  columns: any[];
  handleRefresh: () => void;
  isRefreshing: boolean;
  isFilterActive: (filterName: string) => boolean;
  teamMembers: { id: string; name: string }[];
}

const pipelines = [
  { label: "Achat", value: "purchase" },
  { label: "Location", value: "rental" },
  { label: "Propriétaires", value: "owners" },
];

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
  columns,
  handleRefresh,
  isRefreshing,
  isFilterActive,
  teamMembers
}) => {
  console.log(`MobilePipelineView - activeTab: ${activeTab}`);
  
  const handleApplyFilters = () => {
    handleRefresh();
    toggleFilters();
  };
  
  const handleSortChange = (value: string) => {
    console.log("Sorting changed to:", value);
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] pt-safe">
      <div className="sticky top-0 z-40 bg-white shadow-sm safe-area-top">
        <div className="space-y-3 px-3 pb-4">
          <MobilePipelineHeader 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeFiltersCount={activeFiltersCount}
            toggleFilters={toggleFilters}
            handleRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            isFilterActive={isFilterActive}
            teamMembers={teamMembers}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
            <TabsList className="w-full bg-gray-100 p-0.5 rounded-xl h-11">
              {pipelines.map(pipeline => (
                <TabsTrigger
                  key={pipeline.value}
                  value={pipeline.value}
                  className="flex-1 rounded-lg text-sm font-medium text-zinc-700 data-[state=active]:text-zinc-900 data-[state=active]:bg-white"
                >
                  {pipeline.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-3">
          <MobileColumnList
            columns={columns}
            activeTab={activeTab as PipelineType}
            searchTerm={searchTerm}
            filters={filters}
          />
        </div>
      </div>

      {filtersOpen && (
        <Sheet open={filtersOpen} onOpenChange={toggleFilters}>
          <SheetContent side="bottom" className="h-screen w-full p-0 rounded-t-none bg-white">
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg font-medium text-gray-900">Filtres</SheetTitle>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Fermer</span>
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>
              <ScrollArea className="flex-1 px-6 bg-white">
                <div className="py-4">
                  <PipelineFilters 
                    filters={filters}
                    onFilterChange={onFilterChange}
                    onClearFilters={onClearFilters}
                    assignedToOptions={teamMembers}
                    isFilterActive={isFilterActive}
                    isMobile={true}
                    onApplyFilters={handleApplyFilters}
                  />
                </div>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default MobilePipelineView;
