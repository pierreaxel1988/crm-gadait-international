
import React from 'react';

interface DocumentsTabProps {
  leadId: string;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ leadId }) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-xl font-normal mb-4">Documents</h2>
      <p className="text-gray-500">Aucun document disponible pour le moment.</p>
    </div>
  );
};

export default DocumentsTab;
