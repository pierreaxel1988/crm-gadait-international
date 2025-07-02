
import React from 'react';
import { Check, ChevronDown, Filter } from 'lucide-react';
import { LeadStatus } from '@/components/common/StatusBadge';
import { useAuth } from '@/hooks/useAuth';

interface StatusFilterProps {
  selectedStatus: LeadStatus | 'All';
  setSelectedStatus: (status: LeadStatus | 'All') => void;
  showStatusDropdown: boolean;
  setShowStatusDropdown: (show: boolean) => void;
  setShowTagsDropdown: (show: boolean) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatus,
  setSelectedStatus,
  showStatusDropdown,
  setShowStatusDropdown,
  setShowTagsDropdown
}) => {
  const { isAdmin } = useAuth();

  // Standardized statuses matching the database values
  const baseStatuses: (LeadStatus | 'All')[] = [
    'All',
    'New',       // Nouveaux
    'Contacted', // Contactés
    'Qualified', // Qualifiés
    'Proposal',  // Propositions
    'Visit',     // Visites en cours
    'Offre',     // Offre en cours (for both purchase and rental)
    'Deposit',   // Dépôt reçu
    'Signed',    // Signature finale
    'Gagné',     // Conclus
    'Perdu'      // Perdu
  ];

  // Add "Deleted" status only for admins
  const statuses = isAdmin ? [...baseStatuses, 'Deleted'] : baseStatuses;

  return (
    <div className="relative w-full sm:w-auto">
      <button
        className="luxury-input pl-3 pr-10 flex items-center gap-2 w-full justify-between"
        onClick={() => {
          setShowStatusDropdown(!showStatusDropdown);
          setShowTagsDropdown(false);
        }}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>{selectedStatus}</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </button>
      {showStatusDropdown && (
        <div className="absolute left-0 right-0 sm:left-auto sm:w-48 mt-1 bg-card rounded-md border border-border shadow-luxury z-10">
          <div className="py-1">
            {statuses.map((status) => (
              <button
                key={status}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-foreground hover:bg-accent"
                onClick={() => {
                  setSelectedStatus(status as LeadStatus | 'All');
                  setShowStatusDropdown(false);
                }}
              >
                {status}
                {selectedStatus === status && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusFilter;
