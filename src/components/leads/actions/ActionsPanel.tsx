
import React from 'react';
import { Plus, History, Calendar, Clock } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import CurrentAction from './CurrentAction';
import ActionHistoryList from './ActionHistoryList';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <div className={`${isMobile ? 'pt-2 pb-1' : 'pt-3 pb-2'} animate-[fade-in_0.4s_ease-out]`}>
        <CurrentAction 
          taskType={lead.taskType}
          nextFollowUpDate={lead.nextFollowUpDate}
          getActionTypeIcon={getActionTypeIcon}
          onAddAction={onAddAction}
        />
      </div>
      
      <div className="bg-transparent rounded-lg overflow-hidden">
        <div className={`flex items-center gap-2 ${isMobile ? 'p-2 mb-1' : 'p-3 mb-2'} sticky top-0 z-10 bg-white`}>
          <div className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} rounded-full bg-loro-pearl/30 flex items-center justify-center`}>
            <History className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-loro-navy/80`} />
          </div>
          <div>
            <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-futura text-loro-navy tracking-wide`}>Historique</h3>
          </div>
          <Separator className="flex-1 bg-loro-pearl/30" />
        </div>
        
        <div className={`${isMobile ? 'px-2 pt-0 pb-4' : 'px-3 pt-0 pb-5'}`}>
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
