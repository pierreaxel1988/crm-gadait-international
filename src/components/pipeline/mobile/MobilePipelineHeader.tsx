
import React from 'react';
import { Search, SlidersHorizontal, RefreshCcw, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterOptions } from '../PipelineFilters';
import { useNavigate } from 'react-router-dom';
import ActiveFiltersList from '../filters/ActiveFiltersList';

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
  
  // Helper function to get team member name by ID
  const getTeamMemberName = (id: string): string => {
    const member = teamMembers.find(member => member.id === id);
    return member ? member.name : 'Non assigné';
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Pipeline</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 w-10 rounded-md p-0 flex items-center justify-center border border-gray-300" 
            onClick={() => navigate('/import-lead')}
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
          <Button 
            variant={activeFiltersCount > 0 ? "default" : "outline"} 
            size="sm" 
            onClick={toggleFilters} 
            className="h-10 px-4 flex items-center rounded-md border border-gray-300 bg-white text-black"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>
      </div>
      
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Rechercher un lead..." 
          className="pl-9 pr-10 py-2 bg-gray-100 border-0 rounded-md" 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
        
        {isRefreshing ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <RefreshCcw className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={handleRefresh}
            >
              <RefreshCcw className="h-4 w-4" />
              <span className="sr-only">Actualiser</span>
            </Button>
          </div>
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
    </div>
  );
};

export default MobilePipelineHeader;
