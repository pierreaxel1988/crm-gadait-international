
import React from 'react';

interface NotesTabProps {
  leadId: string;
}

const NotesTab: React.FC<NotesTabProps> = ({ leadId }) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Notes</h2>
      <p className="text-gray-500">Aucune note disponible pour le moment.</p>
    </div>
  );
};

export default NotesTab;
