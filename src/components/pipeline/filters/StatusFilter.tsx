
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { LeadStatus } from '@/components/common/StatusBadge';

interface StatusFilterProps {
  status: LeadStatus | null;
  onStatusChange: (status: LeadStatus | null) => void;
}

const StatusFilter = ({ status, onStatusChange }: StatusFilterProps) => {
  // Include all valid statuses, both in English and French, including "Signed"
  const statuses: (LeadStatus | null)[] = [
    null, 'New', 'Contacted', 'Qualified', 'Visit', 'Proposal', 'Offer', 'Deposit', 'Signed',
    'Offre', 'Gagné', 'Perdu'
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
            variant={status === statusOption ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => onStatusChange(statusOption)}
          >
            {statusOption || 'Tous'}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
