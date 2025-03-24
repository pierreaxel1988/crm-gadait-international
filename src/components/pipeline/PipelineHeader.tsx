
import React from 'react';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';
import PipelineFilters, { FilterOptions } from './PipelineFilters';

interface PipelineHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onToggleFilters: () => void;
  filtersOpen: boolean;
  activeFilters: number;
  isFilterActive: (filterName: string) => boolean;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  teamMembers: { id: string; name: string }[];
}

const PipelineHeader: React.FC<PipelineHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  onToggleFilters,
  filtersOpen,
  activeFilters,
  isFilterActive,
  filters,
  onFilterChange,
  onClearFilters,
  teamMembers
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un lead..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant={filtersOpen ? "default" : "outline"}
          size="sm"
          onClick={onToggleFilters}
          className="flex items-center"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtres
          {activeFilters > 0 && (
            <span className="ml-2 bg-white text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {activeFilters}
            </span>
          )}
        </Button>
      </div>

      {/* Filters panel - only shown when filtersOpen is true */}
      {filtersOpen && (
        <div className="col-span-full mt-3">
          <PipelineFilters 
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            assignedToOptions={teamMembers}
            isFilterActive={isFilterActive}
          />
        </div>
      )}
    </div>
  );
};

export default PipelineHeader;
