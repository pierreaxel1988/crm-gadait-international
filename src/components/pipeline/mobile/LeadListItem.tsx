
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import { LeadStatus } from '@/components/common/StatusBadge';
import { formatBudget } from './utils/leadFormatUtils';
import { cn } from '@/lib/utils';

interface LeadListItemProps {
  id: string;
  name: string;
  columnStatus: LeadStatus;
  budget?: number;
  currency?: string;
  desiredLocation?: string;
  taskType?: string;
  createdAt?: string;
  nextFollowUpDate?: string;
  phone?: string;
  email?: string;
  onClick?: (id: string) => void;
}

const LeadListItem: React.FC<LeadListItemProps> = ({
  id,
  name,
  columnStatus,
  budget,
  currency = '€',
  desiredLocation,
  taskType,
  createdAt,
  nextFollowUpDate,
  phone,
  email,
  onClick
}) => {
  // Get first letter of the name for avatar
  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
  
  // Format date
  const formattedDate = createdAt 
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: false, locale: fr })
    : '';

  // Format follow-up date as DD/MM/YYYY
  const followUpDate = nextFollowUpDate 
    ? new Date(nextFollowUpDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : '';
  
  const handleClick = () => {
    if (onClick) onClick(id);
  };

  // Status color mapping
  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return 'border-blue-500 text-blue-600 bg-blue-50';
      case 'Qualified':
        return 'border-green-500 text-green-600 bg-green-50';
      case 'Contacted':
        return 'border-orange-500 text-orange-600 bg-orange-50';
      case 'Proposal':
        return 'border-purple-500 text-purple-600 bg-purple-50';
      case 'Visit':
        return 'border-teal-500 text-teal-600 bg-teal-50';
      case 'Offer':
      case 'Offre':
        return 'border-indigo-500 text-indigo-600 bg-indigo-50';
      case 'Deposit':
        return 'border-green-500 text-green-600 bg-green-50';
      case 'Signed':
        return 'border-emerald-500 text-emerald-600 bg-emerald-50';
      case 'Gagné':
        return 'border-emerald-500 text-emerald-600 bg-emerald-50';
      case 'Perdu':
        return 'border-red-500 text-red-600 bg-red-50';
      default:
        return 'border-gray-300';
    }
  };

  const getStatusLabel = (status: LeadStatus): string => {
    switch (status) {
      case 'New': return 'New';
      case 'Qualified': return 'Qualifié';
      case 'Contacted': return 'Contacté';
      case 'Proposal': return 'Proposition';
      case 'Visit': return 'Visite';
      case 'Offer':
      case 'Offre': return 'Call';
      case 'Deposit': return 'Deposit';
      case 'Signed': return 'Signé';
      case 'Gagné': return 'Gagné';
      case 'Perdu': return 'Perdu';
      default: return status;
    }
  };

  return (
    <div 
      className="p-3 border-b border-gray-100 bg-white"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Avatar circle */}
        <div className="h-14 w-14 rounded-full bg-rose-50 flex items-center justify-center text-lg font-semibold text-gray-700">
          {firstLetter}
        </div>
        
        {/* Lead details */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-base">{name}</h3>
              <p className="text-sm text-gray-500">{followUpDate}</p>
            </div>
            
            <div className="flex gap-2">
              <button className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Phone className="h-4 w-4" />
              </button>
              <button className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <MessageSquare className="h-4 w-4" />
              </button>
              <button className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Mail className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            {/* Status badge */}
            <span className={cn(
              "px-3 py-1 text-sm border rounded-full",
              getStatusColor(columnStatus)
            )}>
              {getStatusLabel(columnStatus)}
            </span>
            
            {/* Location badge */}
            {desiredLocation && (
              <span className="px-3 py-1 text-sm border border-gray-300 rounded-full">
                {desiredLocation}
              </span>
            )}
            
            {/* Budget badge */}
            {budget && (
              <span className="px-3 py-1 text-sm border border-gray-300 rounded-full">
                {formatBudget(budget, currency)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadListItem;
