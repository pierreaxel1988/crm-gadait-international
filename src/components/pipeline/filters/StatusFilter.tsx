
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { LeadStatus } from '@/components/common/StatusBadge';

interface StatusFilterProps {
  status?: LeadStatus | null;
  onStatusChange?: (status: LeadStatus | null) => void;
  selectedStatus?: LeadStatus | null;
  onSelectedStatusChange?: (status: LeadStatus | null) => void;
}

const StatusFilter = ({ 
  status, 
  onStatusChange,
  selectedStatus,
  onSelectedStatusChange
}: StatusFilterProps) => {
  // Use the appropriate props based on what's provided
  const currentStatus = status !== undefined ? status : selectedStatus;
  const handleStatusChange = (newStatus: LeadStatus | null) => {
    if (onStatusChange) onStatusChange(newStatus);
    if (onSelectedStatusChange) onSelectedStatusChange(newStatus);
  };

  // Standardized statuses matching the database values
  const statuses: (LeadStatus | null)[] = [
    null, 
    'New',       // Nouveaux
    'Contacted', // Contactés
    'Qualified', // Qualifiés
    'Proposal',  // Propositions
    'Visit',     // Visites en cours
    'Offer',     // Offre en cours (English)
    'Offre',     // Offre en cours (French)
    'Deposit',   // Dépôt reçu
    'Signed',    // Signature finale
    'Gagné',     // Conclus
    'Perdu'      // Perdu
  ];

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Filter className="h-4 w-4" /> Statut
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {statuses.map((statusOption) => (
          <Button
            key={statusOption || 'all'}
            variant={currentStatus === statusOption ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => handleStatusChange(statusOption)}
          >
            {statusOption || 'Tous'}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
