
import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PipelineFilters from './PipelineFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import { FilterOptions } from './PipelineFilters';

interface PipelineHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onToggleFilters: () => void;
  filtersOpen: boolean;
  activeFilters: number;
}

const PipelineHeader: React.FC<PipelineHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  onToggleFilters,
  filtersOpen,
  activeFilters
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Initialize filter state for PipelineFilters
  const [filters, setFilters] = useState<FilterOptions>({
    status: null,
    tags: [],
    assignedTo: null,
    minBudget: '',
    maxBudget: '',
    location: '',
    purchaseTimeframe: null,
    propertyType: null
  });

  const handleNewLead = () => {
    navigate('/leads/new');
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: null,
      tags: [],
      assignedTo: null,
      minBudget: '',
      maxBudget: '',
      location: '',
      purchaseTimeframe: null,
      propertyType: null
    });
  };

  // Function to check if a specific filter is active
  const isFilterActive = (filterName: string): boolean => {
    switch (filterName) {
      case 'status':
        return filters.status !== null;
      case 'tags':
        return filters.tags.length > 0;
      case 'assignedTo':
        return filters.assignedTo !== null;
      case 'budget':
        return filters.minBudget !== '' || filters.maxBudget !== '';
      case 'location':
        return filters.location !== '';
      case 'purchaseTimeframe':
        return filters.purchaseTimeframe !== null;
      case 'propertyType':
        return filters.propertyType !== null;
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input type="search" placeholder="Rechercher..." className="pl-8 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        
        <div className="flex space-x-2">
          <Button variant="default" size="sm" onClick={handleNewLead} className="flex items-center gap-1.5 text-slate-50 bg-zinc-900 hover:bg-zinc-800">
            <Plus className="h-4 w-4" />
            {isMobile ? 'Nouveau' : 'Nouveau Lead'}
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onToggleFilters} className={`flex items-center gap-1.5 ${filtersOpen || activeFilters > 0 ? 'border-blue-500 text-blue-500' : ''}`}>
          <Filter className="h-4 w-4" />
          Filtres
          {activeFilters > 0 && (
            <span className="ml-1 rounded-full bg-blue-500 text-white text-xs px-1.5 py-0.5">
              {activeFilters}
            </span>
          )}
        </Button>
      </div>
      
      {filtersOpen && (
        <PipelineFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onClearFilters={handleClearFilters} 
          assignedToOptions={[]} 
          isFilterActive={isFilterActive} 
        />
      )}
    </div>
  );
};

export default PipelineHeader;
