
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
  pipelineType?: PipelineType;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  status,
  onStatusChange,
  pipelineType = 'purchase'
}) => {
  const { isAdmin } = useAuth();

  // Get statuses based on the current pipeline type
  const baseStatuses = [null, ...getStatusesForPipeline(pipelineType)];
  
  // Add "Deleted" status only for admins
  const statuses = isAdmin ? [...baseStatuses, 'Deleted'] : baseStatuses;

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
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={status === null ? "default" : "outline"}
          size="sm"
          className="text-xs"
          onClick={() => onStatusChange(null)}
        >
          Tous
        </Button>
        {statuses.filter(s => s !== null).map((statusValue) => (
          <Button
            key={statusValue}
            variant={status === statusValue ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => onStatusChange(statusValue)}
          >
            {getStatusLabel(statusValue)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
