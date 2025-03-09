
import React from 'react';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { TaskType } from '@/components/kanban/KanbanCard';
import CustomButton from '@/components/ui/CustomButton';

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
  onAddAction,
}) => {
  if (!taskType) {
    return (
      <div className="text-center py-8 border rounded-md border-dashed mt-4 bg-white">
        <p className="text-muted-foreground">Aucune action en cours</p>
        <CustomButton 
          variant="chocolate" 
          onClick={onAddAction} 
          className="mt-4 flex mx-auto items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Ajouter une action
        </CustomButton>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 border rounded-md bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">Action actuelle</h4>
          <div className="flex items-center gap-2 mt-1">
            {getActionTypeIcon(taskType)}
          </div>
          
          {nextFollowUpDate && (
            <p className="text-sm text-muted-foreground mt-2">
              Prévue le: {format(new Date(nextFollowUpDate), 'dd/MM/yyyy à HH:mm')}
            </p>
          )}
        </div>
        <CustomButton 
          variant="outline" 
          onClick={onAddAction}
          className="text-xs flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Modifier
        </CustomButton>
      </div>
    </div>
  );
};

export default CurrentAction;
