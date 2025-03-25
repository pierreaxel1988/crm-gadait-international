
import React from 'react';
import { Plus, History } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';
import CustomButton from '@/components/ui/CustomButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="mb-2">
        <CurrentAction 
          taskType={lead.taskType}
          nextFollowUpDate={lead.nextFollowUpDate}
          getActionTypeIcon={getActionTypeIcon}
          onAddAction={onAddAction}
        />
      </div>
      
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-full bg-loro-pearl/30 flex items-center justify-center">
            <History className="h-4 w-4 text-loro-hazel" />
          </div>
          <h3 className="text-lg font-optima text-loro-navy">Historique</h3>
          <Separator className="flex-1 bg-loro-pearl/50" />
        </div>
        
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
