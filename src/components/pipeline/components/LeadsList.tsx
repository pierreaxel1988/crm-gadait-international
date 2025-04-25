
import React from 'react';
import LeadListItem from '../mobile/LeadListItem';
import { ComponentLoader } from '@/components/ui/component-loader';
import { ExtendedKanbanItem } from '@/hooks/useKanbanData';

interface LeadsListProps {
  leads: ExtendedKanbanItem[];
  isLoading?: boolean;
  onLeadClick: (id: string) => void;
  onAddLead?: () => void;
}

const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  isLoading = false,
  onLeadClick,
  onAddLead
}) => {
  if (isLoading) {
    return <ComponentLoader />;
  }

  return (
    <div className="space-y-2">
      {leads.map((lead) => (
        <LeadListItem
          key={lead.id}
          id={lead.id}
          title={lead.name}
          status={lead.status}
          taskType={lead.taskType}
          nextFollowUpDate={lead.nextFollowUpDate}
          desiredLocation={lead.desiredLocation}
          budget={lead.budget}
          currency={lead.currency}
          onClick={() => onLeadClick(lead.id)}
        />
      ))}
    </div>
  );
};

export default LeadsList;
