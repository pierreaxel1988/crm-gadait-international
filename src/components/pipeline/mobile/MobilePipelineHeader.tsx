
import React from 'react';
import { Search, SlidersHorizontal, RefreshCcw, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterOptions } from '../PipelineFilters';
import { useNavigate } from 'react-router-dom';

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
  teamMembers: {
    id: string;
    name: string;
  }[];
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
  const navigate = useNavigate();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="tracking-tight text-base font-medium">Pipeline</h1>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9" 
              onClick={onClearFilters}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigate('/import-lead')}>
            <PlusCircle className="h-4 w-4" />
          </Button>
          <Button 
            variant={activeFiltersCount > 0 ? "default" : "outline"} 
            size="sm" 
            onClick={toggleFilters} 
            className="h-9 relative font-normal text-sm"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Rechercher un lead..." 
          className="pl-9 pr-16 bg-gray-100 border-0" 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
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
        </div>
      </div>
    </div>
  );
};

export default MobilePipelineHeader;
