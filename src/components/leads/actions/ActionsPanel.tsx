
import React from 'react';
import { Plus, History, Calendar } from 'lucide-react';
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
    <div className="space-y-8">
      <div className="px-4 pt-4 pb-2 animate-[fade-in_0.4s_ease-out]">
        <CurrentAction 
          taskType={lead.taskType}
          nextFollowUpDate={lead.nextFollowUpDate}
          getActionTypeIcon={getActionTypeIcon}
          onAddAction={onAddAction}
        />
      </div>
      
      <div className="bg-transparent">
        <div className="flex items-center gap-3 p-4 sticky top-0 z-10 bg-gradient-to-r from-loro-white to-transparent">
          <div className="h-10 w-10 rounded-full bg-chocolate-dark/15 flex items-center justify-center shadow-inner">
            <Calendar className="h-5 w-5 text-chocolate-dark" />
          </div>
          <div>
            <h3 className="text-xl font-futura text-loro-navy tracking-wide">Historique des actions</h3>
            <p className="text-sm text-loro-navy/60 font-futuraLight">Suivi chronologique des interactions</p>
          </div>
          <Separator className="flex-1 bg-gradient-to-r from-loro-pearl to-loro-pearl/5" />
        </div>
        
        <div className="px-4 pt-2 pb-6">
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
