
import React from 'react';
import { LeadDetailed } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';
import { ActionHistory } from '@/types/actionHistory';
import { format, isPast, isToday } from 'date-fns';
import { Calendar, Check, Clock, Plus, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeadDetailActionBarProps {
  lead: LeadDetailed;
  autoSaveEnabled: boolean;
  onAddAction: () => void;
  onMarkComplete: (actionId: string) => void;
  getActionTypeIcon: (type: TaskType) => JSX.Element | null;
  hasChanges: boolean;
  isSaving: boolean;
  onManualSave: () => void;
}

const LeadDetailActionBar = ({
  lead,
  autoSaveEnabled,
  onAddAction,
  onMarkComplete,
  getActionTypeIcon,
  hasChanges,
  isSaving,
  onManualSave
}: LeadDetailActionBarProps) => {
  // Find the next action that is not completed
  const nextAction = lead.actionHistory?.find(action => !action.completedDate && action.scheduledDate);
  
  const handleMarkComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextAction && nextAction.id) {
      onMarkComplete(nextAction.id);
    }
  };
  
  const isActionOverdue = (action: ActionHistory) => {
    if (!action.scheduledDate) return false;
    
    const scheduledDate = new Date(action.scheduledDate);
    return isPast(scheduledDate) && !isToday(scheduledDate);
  };
  
  const isActionToday = (action: ActionHistory) => {
    if (!action.scheduledDate) return false;
    
    const scheduledDate = new Date(action.scheduledDate);
    return isToday(scheduledDate);
  };
  
  const getActionStatusStyle = () => {
    if (!nextAction || !nextAction.scheduledDate) {
      return '';
    }
    
    if (isActionOverdue(nextAction)) {
      return 'border-red-500 bg-red-50';
    } else if (isActionToday(nextAction)) {
      return 'border-amber-500 bg-amber-50';
    } else {
      return 'border-emerald-500 bg-emerald-50';
    }
  };
  
  const actionStatusStyle = nextAction ? getActionStatusStyle() : '';
  
  const formattedDate = nextAction?.scheduledDate 
    ? format(new Date(nextAction.scheduledDate), 'dd/MM/yyyy HH:mm')
    : '';
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-3 flex justify-between items-center">
      {nextAction ? (
        <div 
          className={`flex-1 p-2 rounded-lg ${actionStatusStyle} flex justify-between items-center`}
          onClick={handleMarkComplete}
        >
          <div className="flex items-center gap-2">
            <div>
              {getActionTypeIcon(nextAction.actionType as TaskType)}
              <div className="flex items-center text-xs text-gray-600 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {formattedDate}
              </div>
            </div>
          </div>
          
          <button 
            className="bg-green-100 p-1.5 rounded-md flex items-center justify-center"
            onClick={handleMarkComplete}
            aria-label="Marquer comme terminé"
          >
            <Check className="h-4 w-4 text-green-800" />
          </button>
        </div>
      ) : (
        <div className="flex-1">
          <button 
            className="w-full p-2 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center gap-2"
            onClick={onAddAction}
          >
            <Calendar className="h-4 w-4" />
            <span>Ajouter une action</span>
          </button>
        </div>
      )}
      
      <div className="ml-2 flex items-center">
        {hasChanges && (
          <button
            className={`p-2 rounded-lg ${isSaving ? 'bg-gray-200' : 'bg-chocolate-dark text-white'} flex items-center justify-center`}
            onClick={onManualSave}
            disabled={isSaving}
          >
            <Save className="h-5 w-5" />
          </button>
        )}
        
        <button
          className="ml-2 p-2 rounded-lg bg-loro-hazel text-white flex items-center justify-center"
          onClick={onAddAction}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default LeadDetailActionBar;
