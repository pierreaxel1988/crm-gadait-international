
import React from 'react';
import { Plus, History } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
    <div className="space-y-4">
      <div className="px-4 pt-2 pb-2">
        <CurrentAction 
          taskType={lead.taskType}
          nextFollowUpDate={lead.nextFollowUpDate}
          getActionTypeIcon={getActionTypeIcon}
          onAddAction={onAddAction}
        />
      </div>
      
      <div className="bg-white">
        <div className="flex items-center gap-2 p-4 sticky top-0 z-10 bg-white border-b border-loro-pearl/30">
          <div className="h-6 w-6 rounded-full bg-chocolate-dark/10 flex items-center justify-center">
            <History className="h-3.5 w-3.5 text-chocolate-dark" />
          </div>
          <h3 className="text-lg font-optima text-loro-navy">Historique</h3>
          <Separator className="flex-1 bg-loro-pearl/50" />
        </div>
        
        <div className="px-4 pt-1 pb-4">
          <ActionHistoryList 
            actionHistory={lead.actionHistory}
            getActionTypeIcon={getActionTypeIcon}
            onMarkComplete={onMarkComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default ActionsPanel;
