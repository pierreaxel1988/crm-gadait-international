
import React from 'react';
import { Filter } from 'lucide-react';
import { LeadStatus } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { PipelineType } from '@/types/lead';
import { getStatusesForPipeline } from '@/utils/pipelineUtils';
import { useAuth } from '@/hooks/useAuth';

interface StatusFilterProps {
  status: LeadStatus | null;
  onStatusChange: (status: LeadStatus | null) => void;
  statuses?: LeadStatus[];
  onStatusesChange?: (statuses: LeadStatus[]) => void;
  allowMultiple?: boolean;
  pipelineType?: PipelineType;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  status,
  onStatusChange,
  statuses = [],
  onStatusesChange,
  allowMultiple = true,
  pipelineType = 'purchase'
}) => {
  const { isAdmin } = useAuth();

  // Get statuses based on the current pipeline type
  const baseStatuses = [null, ...getStatusesForPipeline(pipelineType)];
  
  // Add "Deleted" status only for admins
  const availableStatuses = isAdmin ? [...baseStatuses, 'Deleted' as LeadStatus] : baseStatuses;

  const toggleStatus = (statusValue: LeadStatus | null) => {
    if (allowMultiple && onStatusesChange && statusValue !== null) {
      if (statuses.includes(statusValue)) {
        onStatusesChange(statuses.filter(s => s !== statusValue));
      } else {
        onStatusesChange([...statuses, statusValue]);
      }
    } else {
      onStatusChange(status === statusValue ? null : statusValue);
    }
  };

  const clearAllStatuses = () => {
    if (allowMultiple && onStatusesChange) {
      onStatusesChange([]);
    } else {
      onStatusChange(null);
    }
  };

  const isSelected = (statusValue: LeadStatus | null) => {
    if (allowMultiple && statusValue !== null) {
      return statuses.includes(statusValue);
    }
    return status === statusValue;
  };

  const hasSelection = allowMultiple ? statuses.length > 0 : status !== null;

  // Map status values to display labels
  const getStatusLabel = (status: LeadStatus | null): string => {
    if (status === null) return 'Tous les statuts';
    
    const statusLabels: Record<LeadStatus, string> = {
      'New': pipelineType === 'owners' ? 'Premier contact' : 'Nouveaux',
      'Contacted': pipelineType === 'owners' ? 'Rendez-vous programmé' : 'Contactés',
      'Qualified': pipelineType === 'owners' ? 'Visite effectuée' : 'Qualifiés',
      'Proposal': pipelineType === 'owners' ? 'Mandat en négociation' : 'Propositions',
      'Visit': pipelineType === 'owners' ? 'Bien en commercialisation' : 'Visites en cours',
      'Offre': pipelineType === 'owners' ? 'Offre reçue' : 'Offre en cours',
      'Deposit': pipelineType === 'owners' ? 'Compromis signé' : 'Dépôt reçu',
      'Signed': pipelineType === 'owners' ? 'Mandat signé' : 'Signature finale',
      'Gagné': pipelineType === 'owners' ? 'Vente finalisée' : 'Conclus',
      'Perdu': pipelineType === 'owners' ? 'Perdu/Annulé' : 'Perdu',
      'Deleted': 'Supprimé'
    };
    
    return statusLabels[status] || status;
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Filter className="h-4 w-4" /> Statut
        {allowMultiple && statuses.length > 0 && (
          <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
            {statuses.length}
          </span>
        )}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        <Button
          variant={!hasSelection ? "default" : "outline"}
          size="sm"
          className="text-xs h-7 px-2 whitespace-nowrap"
          onClick={clearAllStatuses}
        >
          {allowMultiple ? "Aucun" : "Tous"}
        </Button>
        {availableStatuses.filter(s => s !== null).map((statusValue) => (
          <Button
            key={statusValue}
            variant={isSelected(statusValue as LeadStatus) ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-2 whitespace-nowrap"
            onClick={() => toggleStatus(statusValue as LeadStatus)}
          >
            {getStatusLabel(statusValue as LeadStatus)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
