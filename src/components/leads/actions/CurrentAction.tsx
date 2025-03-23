
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
      <Card className="text-center py-8 border border-dashed border-loro-sand/30 bg-loro-white/90">
        <p className="text-loro-navy/60 font-futuraLight">Aucune action en cours</p>
        <CustomButton 
          variant="loropiana" 
          onClick={onAddAction} 
          className="mt-4 flex mx-auto items-center gap-2"
          fontStyle="optima"
        >
          <Plus className="h-4 w-4" /> Ajouter une action
        </CustomButton>
      </Card>
    );
  }

  return (
    <Card className="p-4 border border-loro-sand/30 bg-loro-white/90 shadow-luxury">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-futura text-loro-navy mb-2">Action actuelle</h4>
          <div className="flex items-center gap-2 bg-loro-pearl/40 px-3 py-2 rounded-md">
            {getActionTypeIcon(taskType)}
          </div>
          
          {nextFollowUpDate && (
            <div className="flex items-center gap-2 mt-3 text-sm text-loro-navy/70 font-futuraLight">
              <CalendarIcon className="h-4 w-4 text-loro-hazel" />
              <span>
                Prévue le: {format(new Date(nextFollowUpDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </span>
            </div>
          )}
        </div>
        <CustomButton 
          variant="outline" 
          onClick={onAddAction}
          className="text-xs flex items-center gap-1 border-loro-sand/30 text-loro-navy"
          fontStyle="optima"
        >
          <Plus className="h-3 w-3" /> Modifier
        </CustomButton>
      </div>
    </Card>
  );
};

export default CurrentAction;
