
import React from 'react';
import { SlidersHorizontal, RefreshCcw, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterOptions } from '../PipelineFilters';
import { useNavigate } from 'react-router-dom';
import ActiveFiltersList from '../filters/ActiveFiltersList';
import SmartSearch from '@/components/common/SmartSearch';
import { useLeadSearch, SearchResult } from '@/hooks/useLeadSearch';

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
  
  const handleSelectLead = (lead: SearchResult) => {
    navigate(`/leads/${lead.id}?tab=overview`);
  };

  const renderLeadItem = (lead: SearchResult) => (
    <div className="flex flex-col">
      <div className="font-medium">{lead.name}</div>
      <div className="flex text-xs text-muted-foreground gap-2 flex-wrap">
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
          <span className="text-xs truncate">{lead.phone}</span>
        )}
      </div>
    </div>
  );
  
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
      
      {/* Search input with smart search integration */}
      <div className="relative">
        <SmartSearch
          placeholder="Rechercher un lead..." 
          value={searchTerm}
          onChange={setSearchTerm}
          onSelect={handleSelectLead}
          results={results}
          isLoading={isLoading}
          renderItem={renderLeadItem}
          inputClassName="pl-9 pr-16 bg-gray-100 border-0"
          emptyMessage="Aucun résultat trouvé"
          loadingMessage="Recherche en cours..."
          minChars={1}
          searchIcon={true}
          clearButton={true}
        />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
        >
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
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
