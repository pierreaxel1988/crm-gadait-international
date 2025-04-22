
import React from 'react';
import { format, isPast, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { fr } from 'date-fns/locale';
import { Plus, AlertTriangle, Calendar, Home, Check } from 'lucide-react';
import { TaskType } from '@/types/actionHistory';

interface CurrentActionProps {
  taskType?: TaskType;
  nextFollowUpDate?: string;
  getActionTypeIcon: (type: TaskType) => React.ReactNode;
  onAddAction: () => void;
}

const CurrentAction: React.FC<CurrentActionProps> = ({ 
  taskType,
  nextFollowUpDate,
  getActionTypeIcon,
  onAddAction
}) => {
  const isOverdue = nextFollowUpDate ? isPast(new Date(nextFollowUpDate)) && !isToday(new Date(nextFollowUpDate)) : false;
  
  const getBackgroundClass = () => {
    if (isOverdue) return 'bg-[#FFF5F6]/70 border-rose-200';
    if (nextFollowUpDate && isToday(new Date(nextFollowUpDate))) return 'bg-amber-50/70 border-amber-200';
    return 'bg-gray-50 border-gray-200';
  };
  
  const getTaskTitle = () => {
    switch (taskType) {
      case 'Call': return 'Appel';
      case 'Visit': return 'Visite';
      case 'Contract': return 'Compromis';
      case 'Sales Act': return 'Acte de vente';
      case 'Rental Contract': return 'Contrat de Location';
      case 'Offer': return 'Proposition';
      case 'Follow Up': return 'Follow-up';
      case 'Estimation': return 'Estimation';
      case 'Prospecting': return 'Prospection';
      case 'Admin': return 'Administratif';
      default: return 'Action';
    }
  };
  
  return (
    <div className={`border rounded-lg p-4 ${getBackgroundClass()}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-sm mb-1 flex items-center gap-2">
            {taskType ? (
              <>
                <span className="text-gray-600">Prochaine action:</span> 
                {getActionTypeIcon(taskType)}
              </>
            ) : (
              'Aucune action programmée'
            )}
          </h3>
          
          {nextFollowUpDate && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {isOverdue ? (
                <span className="flex items-center gap-1 text-rose-700">
                  <AlertTriangle className="h-3 w-3" />
                  En retard - {format(new Date(nextFollowUpDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </span>
              ) : isToday(new Date(nextFollowUpDate)) ? (
                <span className="text-amber-700">Aujourd'hui - {format(new Date(nextFollowUpDate), 'HH:mm', { locale: fr })}</span>
              ) : (
                <span>{format(new Date(nextFollowUpDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}</span>
              )}
            </p>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2" 
          onClick={onAddAction}
        >
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>
    </div>
  );
};

export default CurrentAction;
