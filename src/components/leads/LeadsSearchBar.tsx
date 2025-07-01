
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeadSearch } from '@/hooks/useLeadSearch';
import SmartSearch from '@/components/common/SmartSearch';
import { Trash2 } from 'lucide-react';

interface LeadsSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults?: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    status?: string;
    desiredLocation?: string;
    deleted_at?: string;
  }>;
  isLoading?: boolean;
}

const LeadsSearchBar: React.FC<LeadsSearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm,
  searchResults: propResults = [], 
  isLoading: propIsLoading = false 
}) => {
  const navigate = useNavigate();
  const { results, isLoading } = useLeadSearch(searchTerm);
  
  // Utiliser les résultats fournis par les props ou ceux de useLeadSearch
  const displayResults = propResults.length > 0 ? propResults : results;
  const displayIsLoading = propIsLoading || isLoading;

  const handleSelectLead = (lead: any) => {
    navigate(`/leads/${lead.id}?tab=actions`);
  };

  const renderLeadItem = (lead: any) => (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span className="font-medium">{lead.name}</span>
        {lead.deleted_at && (
          <div className="flex items-center gap-1 text-red-600">
            <Trash2 className="h-3 w-3" />
            <span className="text-xs font-medium">Supprimé</span>
          </div>
        )}
      </div>
      <div className="flex text-xs text-muted-foreground space-x-2">
        {lead.status && (
          <span className={`px-1 rounded text-xs ${
            lead.status === 'Deleted' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
          }`}>
            {lead.status === 'Deleted' ? 'Supprimé' : lead.status}
          </span>
        )}
        {lead.desiredLocation && <span>{lead.desiredLocation}</span>}
        {lead.email && <span className="truncate">{lead.email}</span>}
        {lead.phone && <span className="truncate">{lead.phone}</span>}
      </div>
    </div>
  );

  return (
    <SmartSearch
      placeholder="Rechercher des leads..."
      value={searchTerm}
      onChange={setSearchTerm}
      onSelect={handleSelectLead}
      results={displayResults}
      isLoading={displayIsLoading}
      renderItem={renderLeadItem}
      className="w-full"
      inputClassName="luxury-input w-full"
      emptyMessage="Aucun lead trouvé"
      loadingMessage="Recherche en cours..."
      minChars={1}
      searchIcon={true}
      clearButton={true}
    />
  );
};

export default LeadsSearchBar;
