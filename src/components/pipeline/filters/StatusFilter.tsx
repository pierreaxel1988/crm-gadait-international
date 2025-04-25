
import React from 'react';
import { LeadStatus } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';

interface StatusFilterProps {
  status: LeadStatus | null;
  onStatusChange: (status: LeadStatus | null) => void;
}

const StatusFilter = ({ status, onStatusChange }: StatusFilterProps) => {
  const statuses: (LeadStatus | null)[] = [
    null,
    'New',
    'Contacted',
    'Qualified',
    'Proposal',
    'Visit',
    'Offre',
    'Deposit',
    'Signed',
    'Gagné',
    'Perdu'
  ];

  const getStatusLabel = (status: LeadStatus | null): string => {
    if (!status) return 'Tous';
    const statusMap: Record<LeadStatus, string> = {
      'New': 'Nouveaux',
      'Contacted': 'Contactés',
      'Qualified': 'Qualifiés',
      'Proposal': 'Propositions',
      'Visit': 'Visites',
      'Offre': 'Offre',
      'Deposit': 'Dépôt',
      'Signed': 'Signé',
      'Gagné': 'Gagné',
      'Perdu': 'Perdu'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {statuses.map((s) => (
        <Button
          key={s || 'all'}
          variant={status === s ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusChange(s)}
          className="text-xs whitespace-nowrap"
        >
          {getStatusLabel(s)}
        </Button>
      ))}
    </div>
  );
};

export default StatusFilter;
