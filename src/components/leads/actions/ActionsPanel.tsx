
import React from 'react';
import { Plus } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';
import CustomButton from '@/components/ui/CustomButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="border-loro-sand/30 bg-loro-white shadow-luxury">
      <CardHeader className="border-b border-loro-pearl/50 pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-futura text-loro-navy">Actions et tâches</CardTitle>
          <CustomButton 
            variant="loropiana" 
            onClick={onAddAction} 
            className="flex items-center gap-2 shadow-sm"
            fontStyle="optima"
          >
            <Plus className="h-4 w-4" /> Ajouter
          </CustomButton>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <CurrentAction 
          taskType={lead.taskType}
          nextFollowUpDate={lead.nextFollowUpDate}
          getActionTypeIcon={getActionTypeIcon}
          onAddAction={onAddAction}
        />
        
        <div className="mt-6">
          <h4 className="font-futura mb-3 text-loro-navy">Historique des actions</h4>
          <ActionHistoryList 
            actionHistory={lead.actionHistory}
            getActionTypeIcon={getActionTypeIcon}
            onMarkComplete={onMarkComplete}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionsPanel;
