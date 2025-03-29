import React from 'react';
import { Plus, CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TaskType } from '@/components/kanban/KanbanCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  const getActionTypeBg = (type: TaskType): string => {
    if (type === 'Call') return '#E7F7E4';
    return 'bg-loro-pearl/30';
  };

  if (!taskType) {
    return (
      <div className="space-y-2 animate-[fade-in_0.4s_ease-out]">
        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-futura text-loro-navy mb-2`}>Action actuelle</h3>
        <Card className="border border-loro-pearl/60 bg-white overflow-hidden rounded-lg">
          <div className="text-center py-5 px-4">
            <div className={`mx-auto ${isMobile ? 'h-10 w-10 mb-3' : 'h-12 w-12 mb-4'} rounded-full bg-loro-pearl/50 flex items-center justify-center`}>
              <AlertCircle className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-loro-navy/70`} />
            </div>
            <p className={`text-loro-navy font-futura ${isMobile ? 'text-base' : 'text-lg'} tracking-wide`}>Aucune action en cours</p>
            <p className="text-sm text-loro-navy/60 font-futuraLight mt-2 mb-4">Programmez une action pour ce lead</p>
            <Button 
              onClick={onAddAction} 
              className="font-futura flex mx-auto items-center gap-2 bg-chocolate-dark hover:bg-chocolate-light rounded-full"
              size={isMobile ? "sm" : "default"}
            >
              <Plus className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} /> 
              <span className="tracking-wide">Ajouter une action</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-2 animate-[fade-in_0.4s_ease-out]">
      <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-futura text-loro-navy mb-2`}>Action actuelle</h3>
      <Card className="border border-loro-pearl/60 bg-white overflow-hidden rounded-lg">
        <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="space-y-4 w-full">
            <div className={`flex items-center gap-3 ${isMobile ? 'p-2.5' : 'p-3'} rounded-lg border border-loro-pearl/50 bg-loro-pearl/10`}>
              <div className="p-2 rounded-md" style={{ 
                backgroundColor: taskType === 'Call' ? '#E7F7E4' : 'rgba(224, 224, 224, 0.3)' 
              }}>
                {getActionTypeIcon(taskType)}
              </div>
              <span className={`text-loro-navy font-futura ${isMobile ? 'text-base' : 'text-lg'} tracking-wide`}>{taskType}</span>
            </div>
            
            {nextFollowUpDate && (
              <div className={`${isMobile ? 'p-2.5' : 'p-3'} rounded-lg border border-loro-pearl/50 bg-loro-pearl/10`}>
                <p className="text-sm text-loro-navy/70 font-futuraLight mb-1">Prochain suivi prévu</p>
                <div className="flex items-center gap-2">
                  <CalendarIcon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-loro-navy`} />
                  <p className={`${isMobile ? 'text-base' : 'text-base'} text-loro-navy font-futura tracking-wide`}>
                    {format(new Date(nextFollowUpDate), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center mt-1 text-sm text-loro-navy/70 ml-6">
                  <Clock className="h-3.5 w-3.5 text-loro-navy/70 mr-2" />
                  <span className="font-futuraLight">
                    {format(new Date(nextFollowUpDate), 'HH:mm', { locale: fr })}
                  </span>
                </div>
                <p className="text-xs text-loro-navy/50 font-futuraLight mt-2 ml-6">
                  Programmé automatiquement lors de la création d'une action
                </p>
              </div>
            )}
            
            <div className="flex justify-end pt-1">
              <Button 
                variant="outline" 
                onClick={onAddAction} 
                size="sm"
                className="text-sm flex items-center gap-2 border-loro-navy/30 text-loro-navy hover:bg-loro-pearl/20 rounded-full font-futura tracking-wide"
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
