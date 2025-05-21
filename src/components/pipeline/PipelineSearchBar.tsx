
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeadSearch, SearchResult } from '@/hooks/useLeadSearch';
import SmartSearch from '@/components/common/SmartSearch';

interface PipelineSearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const PipelineSearchBar: React.FC<PipelineSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  onRefresh,
  isRefreshing = false
}) => {
  const navigate = useNavigate();
  const { results, isLoading } = useLeadSearch(searchTerm);

  const handleSelectLead = useCallback((lead: SearchResult) => {
    navigate(`/leads/${lead.id}?tab=actions`);
  }, [navigate]);

  const renderLeadItem = useCallback((lead: SearchResult) => (
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
  ), []);

  const handleClearSearch = useCallback(() => {
    if (onRefresh) {
      setTimeout(onRefresh, 100);
    }
  }, [onRefresh]);

  return (
    <SmartSearch
      placeholder="Rechercher un lead..."
      value={searchTerm}
      onChange={setSearchTerm}
      onSelect={handleSelectLead}
      results={results}
      isLoading={isLoading}
      renderItem={renderLeadItem}
      className="w-full"
      inputClassName="pl-9 pr-12 bg-gray-100 border-0"
      emptyMessage="Aucun résultat trouvé"
      loadingMessage="Recherche en cours..."
      minChars={1} // Reduced to 1 character for immediate search
      searchIcon={true}
      clearButton={true}
      onClear={handleClearSearch}
    />
  );
};

export default PipelineSearchBar;
