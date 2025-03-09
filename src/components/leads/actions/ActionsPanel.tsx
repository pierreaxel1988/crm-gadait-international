
import React from 'react';
import { Plus } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';
import CustomButton from '@/components/ui/CustomButton';
import CurrentAction from './CurrentAction';
import ActionHistoryList from './ActionHistoryList';

interface ActionsPanelProps {
  lead: LeadDetailed;
  getActionTypeIcon: (type: TaskType) => React.ReactNode;
  onMarkComplete: (actionId: string) => void;
  onAddAction: () => void;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({
  lead,
  getActionTypeIcon,
  onMarkComplete,
  onAddAction,
}) => {
  return (
    <div className="luxury-card p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Actions et tâches</h3>
        <CustomButton 
          variant="chocolate" 
          onClick={onAddAction} 
          className="flex items-center gap-2 shadow-luxury hover:translate-y-[-2px] transition-all duration-300"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </CustomButton>
      </div>
      
      <CurrentAction 
        taskType={lead.taskType}
        nextFollowUpDate={lead.nextFollowUpDate}
        getActionTypeIcon={getActionTypeIcon}
        onAddAction={onAddAction}
      />
      
      <div className="mt-6">
        <h4 className="font-medium mb-3">Historique des actions</h4>
        <ActionHistoryList 
          actionHistory={lead.actionHistory}
          getActionTypeIcon={getActionTypeIcon}
          onMarkComplete={onMarkComplete}
        />
      </div>
    </div>
  );
};

export default ActionsPanel;
