
import React from 'react';
import { LeadStatus } from '@/components/common/StatusBadge';
import { PipelineType } from '@/types/lead';

interface StatusBadgeProps {
  status: LeadStatus;
  pipelineType?: PipelineType;
}

const StatusBadge = ({ status, pipelineType = 'purchase' }: StatusBadgeProps) => {
  const statusConfig = {
    'New': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    'Contacted': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    'Qualified': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    'Proposal': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    'Visit': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    'Offer': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    'Offre': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    'Deposit': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    'Signed': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    'Negotiation': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    'Won': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    'Gagné': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    'Lost': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    'Perdu': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    'Archived': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
  };
  
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  
  // Get the display label based on status and pipeline type
  const getStatusLabel = (status: LeadStatus, pipelineType: PipelineType): string => {
    if (pipelineType === 'owners') {
      const ownerStatusLabels: Record<LeadStatus, string> = {
        'New': 'Premier contact',
        'Contacted': 'RDV programmé',
        'Qualified': 'Visite effectuée',
        'Proposal': 'Mandat en négo',
        'Signed': 'Mandat signé',
        'Visit': 'En commercialisation',
        'Offer': 'Offre reçue',
        'Offre': 'Offre reçue',
        'Deposit': 'Compromis signé',
        'Gagné': 'Vente finalisée',
        'Perdu': 'Perdu/Annulé'
      };
      return ownerStatusLabels[status] || status;
    }
    
    return status;
  };
  
  return (
    <div className={`px-2.5 py-0.5 rounded-full text-xs font-futura tracking-wide uppercase ${config.bg} ${config.text}`}>
      {getStatusLabel(status, pipelineType)}
    </div>
  );
};

export default StatusBadge;
