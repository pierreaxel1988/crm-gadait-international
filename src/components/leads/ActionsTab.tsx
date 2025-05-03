
import React from 'react';

interface ActionsTabProps {
  leadId: string;
}

const ActionsTab: React.FC<ActionsTabProps> = ({ leadId }) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Actions pour le lead</h2>
      <p className="text-gray-500">Aucune action disponible pour le moment.</p>
    </div>
  );
};

export default ActionsTab;
