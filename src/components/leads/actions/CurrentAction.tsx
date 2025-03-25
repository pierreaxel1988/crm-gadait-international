
import React from 'react';
import { Plus, CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TaskType } from '@/components/kanban/KanbanCard';
import CustomButton from '@/components/ui/CustomButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      <Card className="border-dashed border-loro-sand/30 bg-gradient-to-br from-white to-gray-50 overflow-hidden shadow-sm animate-[fade-in_0.3s_ease-out]">
        <div className="text-center py-6 px-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-chocolate-dark/10 flex items-center justify-center mb-3">
            <AlertCircle className="h-6 w-6 text-chocolate-dark/70" />
          </div>
          <p className="text-loro-navy font-optima text-lg">Aucune action en cours</p>
          <p className="text-sm text-loro-navy/60 font-futuraLight mt-1 mb-5">Programmez une action pour ce lead</p>
          <Button 
            onClick={onAddAction} 
            className="flex mx-auto items-center gap-2 bg-chocolate-dark hover:bg-chocolate-light shadow-sm transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Ajouter une action
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-[fade-in_0.3s_ease-out]">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-optima text-chocolate-dark mb-4 text-xl">Action actuelle</h4>
            <div className="flex items-center gap-2 p-2.5 rounded-md border border-loro-pearl/40 bg-white shadow-sm">
              <div className="bg-chocolate-dark/10 p-2 rounded-md">
                {getActionTypeIcon(taskType)}
              </div>
              <span className="text-loro-navy/90 font-optima text-base">{taskType}</span>
            </div>
            
            {nextFollowUpDate && (
              <div className="mt-4 bg-white p-3 rounded-md border border-loro-pearl/30 flex items-start shadow-sm">
                <CalendarIcon className="h-4 w-4 text-chocolate-dark mt-0.5 mr-2" />
                <div>
                  <p className="text-xs text-loro-navy/50 font-futuraLight mb-1">Date prévue</p>
                  <p className="text-base text-loro-navy font-optima">
                    {format(new Date(nextFollowUpDate), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-loro-navy/70">
                    <Clock className="h-3.5 w-3.5 text-chocolate-dark/70 mr-1.5" />
                    <span className="font-futuraLight">
                      {format(new Date(nextFollowUpDate), 'HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={onAddAction} 
            className="text-xs flex items-center gap-1.5 border-chocolate-dark/30 text-chocolate-dark hover:bg-chocolate-dark/10"
          >
            <Plus className="h-3 w-3" /> Modifier
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CurrentAction;
