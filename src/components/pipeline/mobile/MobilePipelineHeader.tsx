
import React from 'react';
import { Search, SlidersHorizontal, RefreshCcw, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterOptions } from '../PipelineFilters';
import { useNavigate } from 'react-router-dom';
import ActiveFiltersList from '../filters/ActiveFiltersList';
import { useLeadSearch, SearchResult } from '@/hooks/useLeadSearch';
import { countryToFlag } from '@/utils/countryUtils';

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
  const { results, isLoading } = useLeadSearch(searchTerm);
  
  // Helper function to get team member name by ID
  const getTeamMemberName = (id: string): string => {
    const member = teamMembers.find(member => member.id === id);
    return member ? member.name : 'Unknown';
  };
  
  const handleSelectLead = (leadId: string) => {
    navigate(`/leads/${leadId}?tab=overview`);
  };
  
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
      
      {/* Search input with results dropdown */}
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
                    <div className="flex text-xs text-muted-foreground gap-2 flex-wrap mt-1">
                      {lead.status && (
                        <span className="bg-gray-100 px-1 rounded text-xs">{lead.status}</span>
                      )}
                      {lead.desiredLocation && (
                        <span className="text-xs truncate">{lead.desiredLocation}</span>
                      )}
                      {lead.email && (
                        <span className="text-xs truncate">{lead.email}</span>
                      )}
                      {lead.phone && (
                        <span className="text-xs truncate">
                          {lead.phoneCountryCodeDisplay && <span className="mr-1">{lead.phoneCountryCodeDisplay}</span>}
                          {lead.phone}
                        </span>
                      )}
                      {lead.nationality && (
                        <span className="text-xs truncate">
                          {countryToFlag(lead.nationality)} {lead.nationality}
                        </span>
                      )}
                      {lead.source && (
                        <span className="text-xs truncate">{lead.source}</span>
                      )}
                      {lead.propertyReference && (
                        <span className="text-xs truncate">Réf: {lead.propertyReference}</span>
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
