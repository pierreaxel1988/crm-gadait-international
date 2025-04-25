
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { LeadsListProps } from '../types/pipelineTypes';
import LeadListItem from '../mobile/LeadListItem';

const LeadsList: React.FC<LeadsListProps> = ({ 
  leads, 
  isLoading, 
  onLeadClick, 
  onAddLead,
  teamMembers 
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 border border-dashed border-border rounded-md mt-4 bg-white">
        <div className="text-center">
          <p className="text-sm text-zinc-900 font-medium">Aucun lead trouvé</p>
          <button 
            onClick={onAddLead} 
            className="mt-2 text-zinc-900 hover:text-zinc-700 text-sm flex items-center justify-center mx-auto"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Ajouter un lead
          </button>
        </div>
      </div>
    );
  }

  // Add console log to debug team members and lead assignments
  console.log("TeamMembers in LeadsList:", teamMembers);
  console.log("First few leads with assignedTo:", leads.slice(0, 3).map(l => ({ 
    name: l.name, 
    assignedTo: l.assignedTo,
    assignedToName: teamMembers?.find(m => m.id === l.assignedTo)?.name 
  })));

  return (
    <div className="mt-2 space-y-px">
      <div className="bg-white rounded-lg border border-slate-200 divide-y shadow-sm">
        {leads.map(lead => (
          <LeadListItem 
            key={lead.id}
            id={lead.id}
            name={lead.name}
            columnStatus={lead.columnStatus}
            budget={lead.budget}
            currency={lead.currency}
            desiredLocation={lead.desiredLocation}
            taskType={lead.taskType}
            createdAt={lead.createdAt}
            nextFollowUpDate={lead.nextFollowUpDate}
            phone={lead.phone}
            email={lead.email}
            assignedTo={lead.assignedTo && teamMembers ? 
              teamMembers.find(member => member.id === lead.assignedTo)?.name : 
              undefined}
            onClick={onLeadClick}
          />
        ))}
      </div>
    </div>
  );
};

export default LeadsList;
