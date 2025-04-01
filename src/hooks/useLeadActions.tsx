
import { useState } from 'react';
import { LeadDetailed } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { addActionToLead } from '@/services/leadActions';
import { updateLead } from '@/services/leadUpdater';

export const useLeadActions = (lead: LeadDetailed | undefined, setLead: (lead: LeadDetailed) => void) => {
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<TaskType | null>(null);
  const [actionDate, setActionDate] = useState<Date | undefined>(undefined);
  const [actionTime, setActionTime] = useState<string>('12:00');
  const [actionNotes, setActionNotes] = useState<string>('');

  const handleAddAction = () => {
    setSelectedAction(null);
    setActionDate(undefined);
    setActionTime('12:00');
    setActionNotes('');
    setIsActionDialogOpen(true);
  };

  const handleActionSelect = (actionType: TaskType) => {
    setSelectedAction(actionType);
  };

  const handleActionConfirm = async () => {
    if (lead && lead.id && selectedAction) {
      try {
        let scheduledDateTime = undefined;
        if (actionDate) {
          const [hours, minutes] = actionTime.split(':').map(part => parseInt(part, 10));
          const dateTime = new Date(actionDate);
          dateTime.setHours(hours, minutes);
          scheduledDateTime = dateTime.toISOString();
        }
        
        const updatedLead = await addActionToLead(lead.id, {
          actionType: selectedAction,
          scheduledDate: scheduledDateTime,
          notes: actionNotes
        });
        
        if (updatedLead) {
          setLead(updatedLead);
          toast({
            title: "Action ajoutée",
            description: `${selectedAction} a été ajouté à ${lead.name}${
              scheduledDateTime ? ` pour le ${format(new Date(scheduledDateTime), 'dd/MM/yyyy à HH:mm')}` : ''
            }`
          });
        }
        setIsActionDialogOpen(false);
      } catch (error) {
        console.error("Error in handleActionConfirm:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter l'action."
        });
      }
    }
  };

  const markActionComplete = async (actionId: string) => {
    if (lead && lead.id) {
      try {
        const actionHistory = [...(lead.actionHistory || [])];
        const actionIndex = actionHistory.findIndex(action => action.id === actionId);
        
        if (actionIndex !== -1) {
          const now = new Date();
          const currentDate = now.toISOString();
          
          actionHistory[actionIndex] = {
            ...actionHistory[actionIndex],
            completedAt: currentDate
          };
          
          const updatedLead = await updateLead({
            ...lead,
            lastContactedAt: currentDate,
            actionHistory
          });
          
          if (updatedLead) {
            setLead(updatedLead);
            
            toast({
              title: "Action complétée",
              description: `${actionHistory[actionIndex].actionType} a été marquée comme complétée`
            });
          }
        }
      } catch (error) {
        console.error("Error in markActionComplete:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre à jour l'action."
        });
      }
    }
  };

  const getActionTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'Call': return <span className="text-[#D05A76] px-1 py-0.5 rounded text-xs font-medium">Appel</span>;
      case 'Visites': return <span className="text-purple-800 px-1 py-0.5 rounded text-xs font-medium">Visite</span>;
      case 'Compromis': return <span className="text-amber-800 px-1 py-0.5 rounded text-xs font-medium">Compromis</span>;
      case 'Acte de vente': return <span className="text-red-800 px-1 py-0.5 rounded text-xs font-medium">Acte de vente</span>;
      case 'Contrat de Location': return <span className="text-blue-800 px-1 py-0.5 rounded text-xs font-medium">Contrat Location</span>;
      case 'Propositions': return <span className="text-indigo-800 px-1 py-0.5 rounded text-xs font-medium">Proposition</span>;
      case 'Follow up': return <span className="text-pink-800 px-1 py-0.5 rounded text-xs font-medium">Follow-up</span>;
      case 'Estimation': return <span className="text-teal-800 px-1 py-0.5 rounded text-xs font-medium">Estimation</span>;
      case 'Prospection': return <span className="text-orange-800 px-1 py-0.5 rounded text-xs font-medium">Prospection</span>;
      case 'Admin': return <span className="text-gray-800 px-1 py-0.5 rounded text-xs font-medium">Admin</span>;
      default: return null;
    }
  };

  return {
    isActionDialogOpen,
    setIsActionDialogOpen,
    selectedAction,
    setSelectedAction,
    actionDate,
    setActionDate,
    actionTime,
    setActionTime,
    actionNotes,
    setActionNotes,
    handleAddAction,
    handleActionSelect,
    handleActionConfirm,
    markActionComplete,
    getActionTypeIcon
  };
};
