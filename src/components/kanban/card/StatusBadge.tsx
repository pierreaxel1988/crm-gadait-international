
import React from 'react';
import { LeadStatus } from '@/components/common/StatusBadge';

interface StatusBadgeProps {
  status: LeadStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    'New': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    'Contacted': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    'Qualified': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    'Proposal': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    'Visit': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    'Offer': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    'Deposit': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    'Signed': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' }
  };
  
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  
  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${config.bg} ${config.text}`}>
      {status}
    </div>
  );
};

export default StatusBadge;
