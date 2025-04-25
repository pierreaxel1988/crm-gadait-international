
import React from 'react';
import { Loader2 } from 'lucide-react';
import LeadCard from '@/components/leads/LeadCard'; 
import { LeadsListProps } from '../types/pipelineTypes';

const LeadsList: React.FC<LeadsListProps> = ({ leads, isLoading, onLeadClick, onAddLead }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-3">Aucun lead trouvé</p>
        {onAddLead && (
          <button 
            className="text-sm text-primary underline"
            onClick={onAddLead}
          >
            Ajouter un lead
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={{
            id: lead.id,
            name: lead.name || 'Sans nom',
            email: lead.email || '',
            phone: lead.phone,
            location: lead.desiredLocation,
            status: lead.status,
            tags: lead.tags || [],
            assignedTo: lead.assignedTo,
            createdAt: lead.createdAt || '',
            lastContactedAt: lead.lastContactedAt
          }}
          onView={() => onLeadClick(lead.id)}
        />
      ))}
    </div>
  );
};

export default LeadsList;
