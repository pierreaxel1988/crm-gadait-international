
import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminGlobalSearch, AdminSearchResult } from '@/hooks/useAdminGlobalSearch';
import { useAuth } from '@/hooks/useAuth';
import SmartSearch from '@/components/common/SmartSearch';
import { Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PipelineSearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  currentTab?: string;
}

const PipelineSearchBar: React.FC<PipelineSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  onRefresh,
  isRefreshing = false,
  currentTab = 'purchase'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { results, isLoading } = useAdminGlobalSearch(searchTerm);

  const handleSelectLead = useCallback((lead: AdminSearchResult) => {
    // Smart navigation - redirect to correct pipeline if different
    if (isAdmin && lead.pipelineType && lead.pipelineType !== currentTab) {
      const pipelineMap: Record<string, string> = {
        'purchase': 'purchase',
        'rental': 'rental', 
        'owners': 'owners'
      };
      
      const targetTab = pipelineMap[lead.pipelineType] || 'purchase';
      
      // Show notification about tab change
      toast({
        title: "Navigation intelligente",
        description: `Redirection vers l'onglet ${lead.pipelineType === 'purchase' ? 'Achat' : lead.pipelineType === 'rental' ? 'Location' : 'Propriétaires'}...`,
        duration: 2000,
      });
      
      // Navigate to correct pipeline tab first, then to lead
      navigate(`/pipeline?tab=${targetTab}`);
      setTimeout(() => {
        navigate(`/leads/${lead.id}?tab=actions`);
      }, 100);
    } else {
      navigate(`/leads/${lead.id}?tab=actions`);
    }
  }, [navigate, isAdmin, currentTab]);

  const getPipelineBadgeColor = (pipelineType: string) => {
    switch (pipelineType) {
      case 'purchase': return 'bg-blue-100 text-blue-700';
      case 'rental': return 'bg-green-100 text-green-700';
      case 'owners': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPipelineLabel = (pipelineType: string) => {
    switch (pipelineType) {
      case 'purchase': return 'Achat';
      case 'rental': return 'Location';
      case 'owners': return 'Propriétaires';
      default: return pipelineType;
    }
  };

  const renderLeadItem = useCallback((lead: AdminSearchResult) => (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <div className="font-medium">{lead.name}</div>
        {isAdmin && lead.pipelineType && (
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPipelineBadgeColor(lead.pipelineType)}`}>
            {getPipelineLabel(lead.pipelineType)}
          </span>
        )}
        {lead.deleted_at && (
          <div className="flex items-center gap-1 text-red-600">
            <Trash2 className="h-3 w-3" />
            <span className="text-xs font-medium">Supprimé</span>
          </div>
        )}
      </div>
      <div className="flex text-xs text-muted-foreground gap-2 flex-wrap">
        {lead.status && (
          <span className={`px-1 rounded text-xs ${
            lead.status === 'Deleted' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
          }`}>
            {lead.status === 'Deleted' ? 'Supprimé' : lead.status}
          </span>
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
  ), [isAdmin]);

  const handleClearSearch = useCallback(() => {
    if (onRefresh) {
      setTimeout(onRefresh, 100);
    }
  }, [onRefresh]);

  const placeholder = isAdmin 
    ? "Rechercher dans tous les pipelines..." 
    : "Rechercher un lead...";

  return (
    <SmartSearch
      placeholder={placeholder}
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
      onClear={handleClearSearch}
    />
  );
};

export default PipelineSearchBar;
