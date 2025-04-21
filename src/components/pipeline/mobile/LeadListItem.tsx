
import React from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, Tag } from 'lucide-react';
import LeadContactActions from './components/LeadContactActions';
import LeadAvatar from './components/LeadAvatar';
import { PipelineType } from '@/types/lead';

interface LeadListItemProps {
  id: string;
  name: string;
  columnStatus: string;
  budget?: string;
  currency?: string;
  desiredLocation?: string;
  taskType?: string;
  createdAt?: string;
  nextFollowUpDate?: string;
  phone?: string;
  email?: string;
  onClick: (id: string) => void;
  pipelineType?: PipelineType;
  mandate_type?: string;
  propertyReference?: string;
}

const LeadListItem: React.FC<LeadListItemProps> = ({
  id,
  name,
  columnStatus,
  budget,
  currency,
  desiredLocation,
  taskType,
  createdAt,
  nextFollowUpDate,
  phone,
  email,
  onClick,
  pipelineType = 'purchase',
  mandate_type,
  propertyReference
}) => {
  const isOwner = pipelineType === 'owner';
  
  const formatCreatedAt = (date?: string) => {
    if (!date) return '';
    
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    } catch (e) {
      return '';
    }
  };
  
  const handleClick = () => {
    onClick(id);
  };
  
  return (
    <div 
      className="flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-50"
      onClick={handleClick}
    >
      <LeadAvatar name={name} />
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">
              {name}
            </h3>
            
            {isOwner ? (
              <div className="mt-1 space-y-1 text-xs">
                {mandate_type && (
                  <div className="flex items-center text-muted-foreground">
                    <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>Mandat: {mandate_type}</span>
                  </div>
                )}
                {propertyReference && (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>Réf: {propertyReference}</span>
                  </div>
                )}
                {createdAt && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>Ajouté {formatCreatedAt(createdAt)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-1 space-y-1 text-xs">
                {budget && (
                  <div className="text-muted-foreground">
                    Budget: {budget} {currency || '€'}
                  </div>
                )}
                {desiredLocation && (
                  <div className="text-muted-foreground truncate">
                    Lieu: {desiredLocation}
                  </div>
                )}
                {createdAt && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>Ajouté {formatCreatedAt(createdAt)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <LeadContactActions
            phone={phone}
            email={email}
          />
        </div>
      </div>
    </div>
  );
};

export default LeadListItem;
