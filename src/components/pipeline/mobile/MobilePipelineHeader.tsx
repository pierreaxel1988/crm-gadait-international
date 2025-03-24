
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchInput from '@/components/reports/table/SearchInput';
import { cn } from '@/lib/utils';
import PipelineFilters from '@/components/pipeline/PipelineFilters';

interface MobilePipelineHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filtersOpen: boolean;
  toggleFilters: () => void;
  activeFiltersCount: number;
  filters?: any;
  onFilterChange?: (filters: any) => void;
  onClearFilters?: () => void;
}

const MobilePipelineHeader = ({
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
}: MobilePipelineHeaderProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={() => setSearchTerm('')}
        />
        
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={cn(
                "ml-2", 
                (filtersOpen || activeFiltersCount > 0) && "text-primary border-primary"
              )}
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <div className="py-6">
              <h3 className="text-lg font-futura mb-4">Filtres</h3>
              {filters && onFilterChange && onClearFilters && (
                <PipelineFilters
                  filters={filters}
                  onFilterChange={onFilterChange}
                  onClearFilters={onClearFilters}
                  isMobile={true}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Tab navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchase" className="font-futura">Achat</TabsTrigger>
          <TabsTrigger value="rental" className="font-futura">Location</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default MobilePipelineHeader;
