
import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { LeadStatus } from '@/components/common/StatusBadge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

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

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Statut</label>
      <Select 
        value={status === null ? 'null' : status} 
        onValueChange={(value) => onStatusChange(value === 'null' ? null : value as LeadStatus)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((statusValue) => (
            <SelectItem 
              key={statusValue || 'null'} 
              value={statusValue === null ? 'null' : statusValue}
            >
              {statusLabels[statusValue === null ? 'null' : statusValue]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusFilter;
