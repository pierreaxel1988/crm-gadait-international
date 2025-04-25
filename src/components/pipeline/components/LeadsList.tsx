
import React from 'react';
import { PlusCircle } from 'lucide-react';
import LeadListItem from '../mobile/LeadListItem';
import LoadingScreen from '../../layout/LoadingScreen';
import { LeadsListProps } from '../types/pipelineTypes';

const LeadsList: React.FC<LeadsListProps> = ({ 
  leads, 
  isLoading, 
  onLeadClick,
  onAddLead 
}) => {
  if (isLoading) {
    return <LoadingScreen fullscreen={false} />;
  }

  return (
    <div className="relative bg-gray-50 rounded-lg border border-gray-200">
      <div className="p-4">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-40 border border-dashed border-border rounded-md bg-white">
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
        ) : (
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
                onClick={onLeadClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsList;
