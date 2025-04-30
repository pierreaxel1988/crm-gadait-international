
import React from 'react';
import { LeadDetailed } from '@/types/lead';

interface PropertiesTabProps {
  leadId: string;
  lead: LeadDetailed;
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({ leadId, lead }) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Propriétés</h2>
      <p className="text-gray-500">Aucune propriété disponible pour le moment.</p>
    </div>
  );
};

export default PropertiesTab;
