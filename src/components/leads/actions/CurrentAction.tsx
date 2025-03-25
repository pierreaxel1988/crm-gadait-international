
import React from 'react';
import { Plus, CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TaskType } from '@/components/kanban/KanbanCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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
      <div className="space-y-2 animate-[fade-in_0.3s_ease-out]">
        <Label className="text-sm font-medium text-loro-navy/90">Action actuelle</Label>
        <Card className="border border-loro-pearl/40 bg-white overflow-hidden shadow-sm hover:shadow transition-all duration-300">
          <div className="text-center py-5 px-4">
            <div className="mx-auto h-10 w-10 rounded-full bg-chocolate-dark/10 flex items-center justify-center mb-3">
              <AlertCircle className="h-5 w-5 text-chocolate-dark/70" />
            </div>
            <p className="text-loro-navy font-optima text-base">Aucune action en cours</p>
            <p className="text-xs text-loro-navy/60 font-futuraLight mt-1 mb-4">Programmez une action pour ce lead</p>
            <Button 
              onClick={onAddAction} 
              className="flex mx-auto items-center gap-2 bg-chocolate-dark hover:bg-chocolate-light shadow-sm transition-all duration-200 text-sm"
              size="sm"
            >
              <Plus className="h-3.5 w-3.5" /> Ajouter une action
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-2 animate-[fade-in_0.3s_ease-out]">
      <Label className="text-sm font-medium text-loro-navy/90">Action actuelle</Label>
      <Card className="border border-loro-pearl/40 bg-white overflow-hidden shadow-sm hover:shadow transition-all duration-300">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-3 w-full">
              <div className="flex items-center gap-2 p-2.5 rounded-md border border-loro-pearl/50 bg-gray-50/70">
                <div className="bg-chocolate-dark/10 p-2 rounded-md">
                  {getActionTypeIcon(taskType)}
                </div>
                <span className="text-loro-navy/90 font-optima text-base">{taskType}</span>
              </div>
              
              {nextFollowUpDate && (
                <div className="bg-gray-50/70 p-3 rounded-md border border-loro-pearl/50 flex items-start">
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
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={onAddAction} 
                  size="sm"
                  className="text-xs flex items-center gap-1.5 border-chocolate-dark/30 text-chocolate-dark hover:bg-chocolate-dark/10"
                >
                  <Plus className="h-3 w-3" /> Modifier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CurrentAction;
