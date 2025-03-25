
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
      <div className="space-y-3 animate-[fade-in_0.4s_ease-out]">
        <Label className="text-xl font-futura text-loro-navy tracking-wide">Action actuelle</Label>
        <Card className="border border-loro-pearl/60 bg-white overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
          <div className="text-center py-10 px-6 bg-gradient-to-b from-white to-loro-pearl/10">
            <div className="mx-auto h-16 w-16 rounded-full bg-chocolate-dark/10 flex items-center justify-center mb-5 shadow-inner">
              <AlertCircle className="h-8 w-8 text-chocolate-dark/70" />
            </div>
            <p className="text-loro-navy font-futura text-xl tracking-wide">Aucune action en cours</p>
            <p className="text-sm text-loro-navy/60 font-futuraLight mt-3 mb-6">Programmez une action pour ce lead</p>
            <Button 
              onClick={onAddAction} 
              className="flex mx-auto items-center gap-2 bg-chocolate-dark hover:bg-chocolate-light shadow hover:shadow-lg transition-all duration-200 rounded-full px-6 py-5"
              size="sm"
            >
              <Plus className="h-4 w-4" /> <span className="font-futura tracking-wide">Ajouter une action</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 animate-[fade-in_0.4s_ease-out]">
      <Label className="text-xl font-futura text-loro-navy tracking-wide">Action actuelle</Label>
      <Card className="border border-loro-pearl/60 bg-gradient-to-b from-white to-loro-pearl/10 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
        <div className="p-6">
          <div className="space-y-5 w-full">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-loro-pearl/70 bg-white shadow-sm">
              <div className="bg-chocolate-dark/15 p-3 rounded-lg shadow-inner">
                {getActionTypeIcon(taskType)}
              </div>
              <span className="text-loro-navy font-futura text-xl tracking-wide">{taskType}</span>
            </div>
            
            {nextFollowUpDate && (
              <div className="bg-white p-5 rounded-xl border border-loro-pearl/70 flex items-start shadow-sm">
                <CalendarIcon className="h-5 w-5 text-chocolate-dark mt-0.5 mr-4" />
                <div>
                  <p className="text-sm text-loro-navy/50 font-futuraLight mb-1">Date prévue</p>
                  <p className="text-lg text-loro-navy font-futura tracking-wide">
                    {format(new Date(nextFollowUpDate), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                  <div className="flex items-center mt-2 text-base text-loro-navy/70">
                    <Clock className="h-4 w-4 text-chocolate-dark/70 mr-2" />
                    <span className="font-futuraLight">
                      {format(new Date(nextFollowUpDate), 'HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <Button 
                variant="outline" 
                onClick={onAddAction} 
                size="sm"
                className="text-sm flex items-center gap-2 border-chocolate-dark/30 text-chocolate-dark hover:bg-chocolate-dark/10 rounded-full px-5 py-4 font-futura tracking-wide"
              >
                <Plus className="h-3.5 w-3.5" /> Modifier
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CurrentAction;
