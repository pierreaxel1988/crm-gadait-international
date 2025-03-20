import { useState } from 'react';
import { LeadDetailed } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { addActionToLead, updateLead } from '@/services/leadService';

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
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter l'action."
        });
      } finally {
        setIsActionDialogOpen(false);
      }
    }
  };

  const markActionComplete = async (actionId: string) => {
    if (lead && lead.id) {
      try {
        // Find the action in history
        const actionHistory = [...(lead.actionHistory || [])];
        const actionIndex = actionHistory.findIndex(action => action.id === actionId);
        
        if (actionIndex !== -1) {
          const now = new Date();
          const currentDate = now.toISOString();
          
          // Update the action to completed
          actionHistory[actionIndex] = {
            ...actionHistory[actionIndex],
            completedDate: currentDate
          };
          
          // Update the lead with the modified action history and last contacted date
          const updatedLead = await updateLead({
            ...lead,
            lastContactedAt: currentDate, // Update last contacted date when action is completed
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
      case 'Call': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Appel</span>;
      case 'Visites': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Visite</span>;
      case 'Compromis': return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">Compromis</span>;
      case 'Acte de vente': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Acte de vente</span>;
      case 'Contrat de Location': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Contrat Location</span>;
      case 'Propositions': return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">Proposition</span>;
      case 'Follow up': return <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs">Follow-up</span>;
      case 'Estimation': return <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs">Estimation</span>;
      case 'Prospection': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">Prospection</span>;
      case 'Admin': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Admin</span>;
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
