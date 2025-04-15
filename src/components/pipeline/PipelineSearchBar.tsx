
import React from 'react';
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
      minChars={1}
      searchIcon={true}
      clearButton={true}
    />
  );
};

export default PipelineSearchBar;
