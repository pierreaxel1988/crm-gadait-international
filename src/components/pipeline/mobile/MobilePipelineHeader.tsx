
import React from 'react';
import { Search, SlidersHorizontal, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import PipelineFilters, { FilterOptions } from '../PipelineFilters';

interface MobilePipelineHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activeFiltersCount: number;
  toggleFilters: () => void;
  handleRefresh: () => void;
  isRefreshing: boolean;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  isFilterActive: (filterName: string) => boolean;
  teamMembers: { id: string; name: string }[];
}

const MobilePipelineHeader: React.FC<MobilePipelineHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  activeFiltersCount,
  toggleFilters,
  handleRefresh,
  isRefreshing,
  filters,
  onFilterChange,
  onClearFilters,
  isFilterActive,
  teamMembers
}) => {
  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un lead..."
          className="pl-9 pr-16"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          
          <SheetTrigger asChild>
            <Button
              variant={activeFiltersCount > 0 ? "default" : "outline"}
              size="sm"
              className="h-7 relative"
              onClick={toggleFilters}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-primary rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
        </div>
      </div>
    </div>
  );
};

export default MobilePipelineHeader;
