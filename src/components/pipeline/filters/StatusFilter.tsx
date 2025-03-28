
import React from 'react';
import { Filter } from 'lucide-react';
import { LeadStatus } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';

interface StatusFilterProps {
  status: LeadStatus | null;
  onStatusChange: (status: LeadStatus | null) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  status,
  onStatusChange
}) => {
  // Standardized statuses matching the database values
  const statuses: (LeadStatus | null)[] = [
    null, // All / None
    'New',       // Nouveaux
    'Contacted', // Contactés
    'Qualified', // Qualifiés
    'Proposal',  // Propositions
    'Visit',     // Visites en cours
    'Offer',     // Offre en cours (English/Purchase)
    'Offre',     // Offre en cours (French/Rental)
    'Deposit',   // Dépôt reçu
    'Signed',    // Signature finale
    'Gagné',     // Conclus
    'Perdu'      // Perdu
  ];

  // Map status values to display labels
  const statusLabels: Record<string, string> = {
    'null': 'Tous les statuts', // Use 'null' as a string key for null value
    'New': 'Nouveaux',
    'Contacted': 'Contactés',
    'Qualified': 'Qualifiés',
    'Proposal': 'Propositions',
    'Visit': 'Visites en cours',
    'Offer': 'Offre en cours',
    'Offre': 'Offre en cours',
    'Deposit': 'Dépôt reçu',
    'Signed': 'Signature finale',
    'Gagné': 'Conclus',
    'Perdu': 'Perdu'
  };

  // Add logging to debug selected status
  console.log("Current selected status:", status);

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
            {statusLabels[statusValue || 'null']}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
