
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
    <div className="space-y-6">
      <div className="px-4 pt-4 pb-2 animate-[fade-in_0.4s_ease-out]">
        <CurrentAction 
          taskType={lead.taskType}
          nextFollowUpDate={lead.nextFollowUpDate}
          getActionTypeIcon={getActionTypeIcon}
          onAddAction={onAddAction}
        />
      </div>
      
      <div className="bg-transparent">
        <div className="flex items-center gap-2 p-4 sticky top-0 z-10 bg-gradient-to-r from-loro-white to-transparent">
          <div className="h-7 w-7 rounded-full bg-chocolate-dark/20 flex items-center justify-center">
            <History className="h-4 w-4 text-chocolate-dark" />
          </div>
          <h3 className="text-lg font-optima text-loro-navy">Historique</h3>
          <Separator className="flex-1 bg-gradient-to-r from-loro-pearl to-loro-pearl/20" />
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
