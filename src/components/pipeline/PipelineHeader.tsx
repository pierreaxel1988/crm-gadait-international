
import React from 'react';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, SlidersHorizontal } from 'lucide-react';
import PipelineFilters, { FilterOptions } from './PipelineFilters';
import { useNavigate } from 'react-router-dom';

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
  handleRefresh?: () => void;
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
  teamMembers,
  handleRefresh
}) => {
  const navigate = useNavigate();

  // Fonction pour appliquer les filtres
  const handleApplyFilters = () => {
    if (handleRefresh) {
      handleRefresh();
    }
    onToggleFilters();
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="tracking-tight text-xl font-medium text-zinc-900">Pipeline</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => navigate('/import-lead')}>
            <PlusCircle className="h-5 w-5" />
          </Button>
          <Button 
            variant={activeFilters > 0 ? "default" : "outline"} 
            size="sm" 
            onClick={onToggleFilters} 
            className="h-10 px-4 relative font-medium"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtres
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {activeFilters}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un lead..."
          className="pl-9 pr-12 bg-gray-100 border-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters panel - only shown when filtersOpen is true */}
      {filtersOpen && (
        <div className="mt-4">
          <PipelineFilters 
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            assignedToOptions={teamMembers}
            isFilterActive={isFilterActive}
            onApplyFilters={handleApplyFilters}
          />
        </div>
      )}
    </div>
  );
};

export default PipelineHeader;
