
import React from 'react';
import { LeadDetailed } from '@/types/lead';

interface LeadInfoTabProps {
  lead: LeadDetailed;
}

const LeadInfoTab: React.FC<LeadInfoTabProps> = ({ lead }) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-xl font-normal mb-4">Informations du lead</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Nom</p>
          <p className="font-medium">{lead.name || 'Non spécifié'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{lead.email || 'Non spécifié'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Téléphone</p>
          <p className="font-medium">{lead.phone || 'Non spécifié'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Origine</p>
          <p className="font-medium">{lead.source || 'Non spécifiée'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Date de création</p>
          <p className="font-medium">
            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('fr-FR') : 'Non disponible'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeadInfoTab;
