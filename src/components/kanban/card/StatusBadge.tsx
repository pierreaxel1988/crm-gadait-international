
import React from 'react';
import { LeadStatus } from '@/components/common/StatusBadge';

interface StatusBadgeProps {
  status: LeadStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    'Vip': { bg: 'bg-purple-100 border-purple-400', text: 'text-purple-800' },
    'Hot': { bg: 'bg-red-100 border-red-400', text: 'text-red-800' },
    'Serious': { bg: 'bg-amber-100 border-amber-400', text: 'text-amber-800' },
    'Cold': { bg: 'bg-blue-100 border-blue-400', text: 'text-blue-800' },
    'No response': { bg: 'bg-gray-100 border-gray-400', text: 'text-gray-800' },
    'No phone': { bg: 'bg-rose-100 border-rose-400', text: 'text-rose-800' },
    'Fake': { bg: 'bg-slate-100 border-slate-400', text: 'text-slate-800' },
    // Default statuses from the pipeline
    'New': { bg: 'bg-green-100 border-green-400', text: 'text-green-800' },
    'Contacted': { bg: 'bg-blue-100 border-blue-400', text: 'text-blue-800' },
    'Qualified': { bg: 'bg-indigo-100 border-indigo-400', text: 'text-indigo-800' },
    'Proposal': { bg: 'bg-purple-100 border-purple-400', text: 'text-purple-800' },
    'Visit': { bg: 'bg-pink-100 border-pink-400', text: 'text-pink-800' },
    'Offer': { bg: 'bg-yellow-100 border-yellow-400', text: 'text-yellow-800' },
    'Deposit': { bg: 'bg-amber-100 border-amber-400', text: 'text-amber-800' },
    'Signed': { bg: 'bg-emerald-100 border-emerald-400', text: 'text-emerald-800' },
  };
  
  const config = statusConfig[status] || { bg: 'bg-gray-100 border-gray-400', text: 'text-gray-800' };
  
  return (
    <div className={`px-2 py-1 rounded-full border text-xs font-medium inline-flex items-center ${config.bg} ${config.text}`}>
      {status}
    </div>
  );
};

export default StatusBadge;
