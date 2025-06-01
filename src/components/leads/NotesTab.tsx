
import React from 'react';
import { LeadDetailed } from '@/types/lead';

interface NotesTabProps {
  lead: LeadDetailed;
  onLeadUpdate: (updatedLead: LeadDetailed) => void;
}

const NotesTab: React.FC<NotesTabProps> = ({ lead }) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Notes</h2>
      {lead.notes ? (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="whitespace-pre-wrap">{lead.notes}</p>
        </div>
      ) : (
        <p className="text-gray-500">Aucune note disponible pour le moment.</p>
      )}
    </div>
  );
};

export default NotesTab;
