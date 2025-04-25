
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, SlidersHorizontal, X, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PipelineSearchBar from './PipelineSearchBar';
import ActiveFilterTags from '../filters/ActiveFilterTags';
import { FilterOptions } from '../filters/PipelineFilters';

interface PipelineHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onToggleFilters: () => void;
  filtersOpen: boolean;
  activeFiltersCount: number;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  teamMembers: { id: string; name: string }[];
  handleRefresh?: () => void;
  isRefreshing?: boolean;
}

const PipelineHeader: React.FC<PipelineHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  onToggleFilters,
  filtersOpen,
  activeFiltersCount,
  filters,
  onFilterChange,
  onClearFilters,
  teamMembers,
  handleRefresh,
  isRefreshing = false
}) => {
  const navigate = useNavigate();

  // Get team member name by ID
  const getTeamMemberName = (id: string): string => {
    const member = teamMembers.find(member => member.id === id);
    return member ? member.name : 'Inconnu';
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="tracking-tight text-xl font-medium text-zinc-900">Pipeline</h1>
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
            onClick={onToggleFilters} 
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
      
      <div className="relative">
        <PipelineSearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Display active filters */}
      {activeFiltersCount > 0 && (
        <ActiveFilterTags
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          getTeamMemberName={getTeamMemberName}
          className="mt-4"
        />
      )}
    </div>
  );
};

export default PipelineHeader;
