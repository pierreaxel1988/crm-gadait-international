
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import PublicLinkGenerator from './PublicLinkGenerator';

interface PublicCriteriaTabProps {
  lead: LeadDetailed;
}

const PublicCriteriaTab: React.FC<PublicCriteriaTabProps> = ({ lead }) => {
  return (
    <div className="space-y-6 p-4">
      <div className="mb-6">
        <h2 className="text-xl font-futura text-loro-terracotta mb-2">
          Partage des critères
        </h2>
        <p className="text-gray-600">
          Envoyez ce lien au lead pour qu'il puisse remplir ses critères de recherche directement.
        </p>
      </div>
      
      <PublicLinkGenerator 
        leadId={lead.id}
        leadName={lead.name}
      />
    </div>
  );
};

export default PublicCriteriaTab;
