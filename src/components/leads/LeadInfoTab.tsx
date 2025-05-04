
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import { ExternalLink } from 'lucide-react';

interface LeadInfoTabProps {
  lead: LeadDetailed;
}

const LeadInfoTab: React.FC<LeadInfoTabProps> = ({ lead }) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Informations du lead</h2>
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
        {lead.url && (
          <div>
            <p className="text-sm text-gray-500">Lien de l'annonce</p>
            <p className="font-medium">
              <a 
                href={lead.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-blue-600 hover:underline"
              >
                {lead.url.substring(0, 50)}{lead.url.length > 50 ? '...' : ''} <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </a>
            </p>
          </div>
        )}
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
