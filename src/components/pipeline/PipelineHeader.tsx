
import React from 'react';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, SlidersHorizontal, X, RefreshCcw } from 'lucide-react';
import PipelineFilters, { FilterOptions } from './PipelineFilters';
import { useNavigate } from 'react-router-dom';
import ActiveFiltersList from './filters/ActiveFiltersList';
import { useLeadSearch, SearchResult } from '@/hooks/useLeadSearch';

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
  isRefreshing?: boolean;
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
  handleRefresh,
  isRefreshing = false
}) => {
  const navigate = useNavigate();
  const { results, isLoading } = useLeadSearch(searchTerm);

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
    onToggleFilters();
  };
  
  // Function to navigate to lead detail
  const handleSelectLead = (leadId: string) => {
    navigate(`/leads/${leadId}?tab=overview`);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="tracking-tight text-xl font-medium text-zinc-900">Pipeline</h1>
        <div className="flex items-center gap-2">
          {activeFilters > 0 && (
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
        
        {/* Search results dropdown */}
        {searchTerm.length > 1 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                Recherche en cours...
              </div>
            ) : results.length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                Aucun résultat trouvé
              </div>
            ) : (
              <ul className="py-1">
                {results.map((lead: SearchResult) => (
                  <li 
                    key={lead.id} 
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectLead(lead.id)}
                  >
                    <div className="font-medium">{lead.name}</div>
                    <div className="flex text-xs text-muted-foreground gap-2 flex-wrap">
                      {lead.status && (
                        <span className="bg-gray-100 px-1 rounded text-xs">{lead.status}</span>
                      )}
                      {lead.desiredLocation && (
                        <span className="text-xs truncate">{lead.desiredLocation}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Display active filters */}
      {activeFilters > 0 && (
        <ActiveFiltersList
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          getTeamMemberName={getTeamMemberName}
          isFilterActive={isFilterActive}
        />
      )}

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
