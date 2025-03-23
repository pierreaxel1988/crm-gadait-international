
import React from 'react';
import { Plus, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TaskType } from '@/components/kanban/KanbanCard';
import CustomButton from '@/components/ui/CustomButton';
import { Card } from '@/components/ui/card';

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
      <Card className="text-center py-8 border border-dashed bg-white/70">
        <p className="text-muted-foreground">Aucune action en cours</p>
        <CustomButton 
          variant="chocolate" 
          onClick={onAddAction} 
          className="mt-4 flex mx-auto items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Ajouter une action
        </CustomButton>
      </Card>
    );
  }

  return (
    <Card className="p-4 border bg-white/70 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium font-futura text-chocolate-dark mb-2">Action actuelle</h4>
          <div className="flex items-center gap-2 bg-chocolate-light/10 px-3 py-2 rounded-md">
            {getActionTypeIcon(taskType)}
          </div>
          
          {nextFollowUpDate && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4 text-chocolate-light" />
              <span>
                Prévue le: {format(new Date(nextFollowUpDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </span>
            </div>
          )}
        </div>
        <CustomButton 
          variant="outline" 
          onClick={onAddAction}
          className="text-xs flex items-center gap-1 border-chocolate-light/30 text-chocolate-dark"
        >
          <Plus className="h-3 w-3" /> Modifier
        </CustomButton>
      </div>
    </Card>
  );
};

export default CurrentAction;
