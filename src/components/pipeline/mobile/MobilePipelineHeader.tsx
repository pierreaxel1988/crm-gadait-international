import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, SlidersHorizontal, X, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActiveFiltersList from '../filters/ActiveFiltersList';
import { FilterOptions } from '../PipelineFilters';

interface MobilePipelineHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  toggleFilters: () => void;
  activeFiltersCount: number;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  isFilterActive: (filterName: string) => boolean;
  teamMembers: { id: string; name: string }[];
  handleRefresh?: () => void;
  isRefreshing?: boolean;
}

const MobilePipelineHeader: React.FC<MobilePipelineHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  toggleFilters,
  activeFiltersCount,
  filters,
  onFilterChange,
  onClearFilters,
  isFilterActive,
  teamMembers,
  handleRefresh,
  isRefreshing = false
}) => {
  const navigate = useNavigate();

  // Get team member name by ID
  const getTeamMemberName = (id: string): string => {
    const member = teamMembers.find(member => member.id === id);
    return member ? member.name : 'Unknown';
  };

  // Function to apply filters
  const handleApplyFilters = () => {
    if (handleRefresh) {
      handleRefresh();
    }
    toggleFilters();
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10" 
              onClick={onClearFilters}
              title="Effacer tous les filtres"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10" 
            onClick={() => navigate('/import-lead')}
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
          {handleRefresh && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
          <Button 
            variant={activeFiltersCount > 0 ? "default" : "outline"} 
            size="sm" 
            onClick={toggleFilters} 
            className="h-10 px-4 relative font-medium"
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
      
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un lead..."
          className="pl-9 pr-12 bg-gray-100 border-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {handleRefresh && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      {/* Display active filters */}
      {activeFiltersCount > 0 && (
        <ActiveFiltersList
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          getTeamMemberName={getTeamMemberName}
          isFilterActive={isFilterActive}
        />
      )}

      {/* Filters panel - only shown when filtersOpen is true */}
      
    </div>
  );
};

export default MobilePipelineHeader;
