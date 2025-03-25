
import React from 'react';
import { Plus, CalendarIcon, Clock, AlertCircle } from 'lucide-react';
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
  onAddAction
}) => {
  if (!taskType) {
    return (
      <Card className="border border-dashed border-loro-sand/30 bg-loro-white/90 overflow-hidden animate-[fade-in_0.3s_ease-out]">
        <div className="text-center py-8 px-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-loro-pearl/30 flex items-center justify-center mb-3">
            <AlertCircle className="h-6 w-6 text-loro-hazel/60" />
          </div>
          <p className="text-loro-navy/60 font-optima">Aucune action en cours</p>
          <p className="text-xs text-loro-navy/40 font-futuraLight mt-1 mb-4">Programmez une action pour ce lead</p>
          <CustomButton 
            variant="loropiana" 
            onClick={onAddAction} 
            className="flex mx-auto items-center gap-2 shadow-sm" 
            fontStyle="optima"
          >
            <Plus className="h-4 w-4" /> Ajouter une action
          </CustomButton>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="border border-loro-sand/30 bg-loro-white/90 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-[fade-in_0.3s_ease-out]">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-optima text-loro-navy mb-3 text-lg">Action actuelle</h4>
            <div className="flex items-center gap-2 p-2 rounded-md bg-loro-pearl/20 border border-loro-pearl/30">
              {getActionTypeIcon(taskType)}
              <span className="text-loro-navy/80 font-futura text-sm">{taskType}</span>
            </div>
            
            {nextFollowUpDate && (
              <div className="mt-4 bg-loro-white p-3 rounded-md border border-loro-pearl/30 flex items-start">
                <CalendarIcon className="h-4 w-4 text-loro-hazel mt-0.5 mr-2" />
                <div>
                  <p className="text-xs text-loro-navy/50 font-futuraLight mb-1">Date prévue</p>
                  <p className="text-sm text-loro-navy/80 font-futura">
                    {format(new Date(nextFollowUpDate), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-loro-navy/70">
                    <Clock className="h-3.5 w-3.5 text-loro-hazel/70 mr-1.5" />
                    <span className="font-futuraLight">
                      {format(new Date(nextFollowUpDate), 'HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <CustomButton 
            variant="outline" 
            onClick={onAddAction} 
            className="text-xs flex items-center gap-1 border-loro-sand/30 text-loro-navy hover:bg-loro-pearl/20" 
            fontStyle="optima"
          >
            <Plus className="h-3 w-3" /> Modifier
          </CustomButton>
        </div>
      </div>
    </Card>
  );
};

export default CurrentAction;
