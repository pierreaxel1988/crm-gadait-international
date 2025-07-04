import { useState, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { TaskType } from '@/components/kanban/KanbanCard';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { addActionToLead } from '@/services/leadActions';
import { updateLead } from '@/services/leadUpdater';
import { analyzeNoteText, ActionSuggestion } from '@/services/noteAnalysisService';

export const useLeadActions = (lead: LeadDetailed | undefined, setLead: (lead: LeadDetailed) => void, onAddAction?: () => void) => {
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<TaskType | null>(null);
  const [actionDate, setActionDate] = useState<Date | undefined>(undefined);
  const [actionTime, setActionTime] = useState<string>('12:00');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [actionSuggestions, setActionSuggestions] = useState<ActionSuggestion[]>([]);
  const [analyzedNotes, setAnalyzedNotes] = useState<string>('');

  // Analyze notes for action suggestions whenever they change
  useEffect(() => {
    if (lead?.notes && lead.notes !== analyzedNotes) {
      const suggestions = analyzeNoteText(lead.notes);
      
      // Filter out suggestions that already exist in actionHistory
      const filteredSuggestions = suggestions.filter(suggestion => {
        if (!lead.actionHistory || lead.actionHistory.length === 0) return true;
        
        // Check if a similar action already exists in the action history
        // We consider an action similar if it has the same type and date (ignoring time)
        return !lead.actionHistory.some(existingAction => {
          const existingDate = new Date(existingAction.scheduledDate);
          const suggestionDate = new Date(suggestion.scheduledDate);
          
          return existingAction.actionType === suggestion.actionType && 
                 existingDate.getFullYear() === suggestionDate.getFullYear() &&
                 existingDate.getMonth() === suggestionDate.getMonth() &&
                 existingDate.getDate() === suggestionDate.getDate();
        });
      });
      
      setActionSuggestions(filteredSuggestions);
      setAnalyzedNotes(lead.notes);
    }
  }, [lead?.notes, lead?.actionHistory]);

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
          // Create a valid date object from the selected date and time
          const [hours, minutes] = actionTime.split(':').map(part => parseInt(part, 10));
          const dateTime = new Date(actionDate);
          dateTime.setHours(hours, minutes);
          scheduledDateTime = dateTime.toISOString();
        } else {
          // Si aucune date n'est spécifiée, utiliser la date et heure actuelle
          scheduledDateTime = new Date().toISOString();
        }
        
        // Check for duplicates before adding
        if (scheduledDateTime && lead.actionHistory) {
          const isDuplicate = lead.actionHistory.some(action => {
            if (!action.scheduledDate) return false;
            
            try {
              const actionDate = new Date(action.scheduledDate);
              const newDate = new Date(scheduledDateTime);
              
              if (isNaN(actionDate.getTime()) || isNaN(newDate.getTime())) {
                return false;
              }
              
              return action.actionType === selectedAction && 
                    actionDate.getFullYear() === newDate.getFullYear() &&
                    actionDate.getMonth() === newDate.getMonth() &&
                    actionDate.getDate() === newDate.getDate() &&
                    actionDate.getHours() === newDate.getHours() &&
                    actionDate.getMinutes() === newDate.getMinutes();
            } catch (error) {
              console.error("Error comparing dates:", error);
              return false;
            }
          });
          
          if (isDuplicate) {
            toast({
              title: "Action similaire existe déjà",
              description: "Une action similaire existe déjà pour cette date et heure.",
              variant: "destructive"
            });
            setIsActionDialogOpen(false);
            return;
          }
        }
        
        const updatedLead = await addActionToLead(lead.id, {
          actionType: selectedAction,
          scheduledDate: scheduledDateTime,
          notes: actionNotes
        });
        
        if (updatedLead) {
          setLead(updatedLead);
          onAddAction?.();
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

  const acceptSuggestion = async (suggestion: ActionSuggestion) => {
    if (lead && lead.id) {
      try {
        const scheduledDateTime = suggestion.scheduledDate.toISOString();
        
        // Check if a similar action already exists
        if (lead.actionHistory) {
          const isDuplicate = lead.actionHistory.some(action => {
            const actionDate = new Date(action.scheduledDate);
            const suggestionDate = new Date(scheduledDateTime);
            return action.actionType === suggestion.actionType && 
                  actionDate.getFullYear() === suggestionDate.getFullYear() &&
                  actionDate.getMonth() === suggestionDate.getMonth() &&
                  actionDate.getDate() === suggestionDate.getDate() &&
                  actionDate.getHours() === suggestionDate.getHours() &&
                  actionDate.getMinutes() === suggestionDate.getMinutes() &&
                  !action.completedDate; // Only consider non-completed actions
          });
          
          if (isDuplicate) {
            toast({
              title: "Action similaire existe déjà",
              description: "Une action similaire existe déjà pour cette date et heure.",
              variant: "destructive"
            });
            
            // Remove the suggestion from the list
            setActionSuggestions(prev => prev.filter(s => 
              s.scheduledDate.getTime() !== suggestion.scheduledDate.getTime() || 
              s.actionType !== suggestion.actionType
            ));
            
            return;
          }
        }
        
        const updatedLead = await addActionToLead(lead.id, {
          actionType: suggestion.actionType,
          scheduledDate: scheduledDateTime,
          notes: suggestion.notes || `Action créée automatiquement à partir de: "${suggestion.matchedText}"`
        });
        
        if (updatedLead) {
          setLead(updatedLead);
          onAddAction?.();
          // Remove the suggestion from the list
          setActionSuggestions(prev => prev.filter(s => 
            s.scheduledDate.getTime() !== suggestion.scheduledDate.getTime() || 
            s.actionType !== suggestion.actionType
          ));
          
          toast({
            title: "Action ajoutée",
            description: `${suggestion.actionType} a été ajouté à ${lead.name} pour le ${format(suggestion.scheduledDate, 'dd/MM/yyyy à HH:mm')}`
          });
        }
      } catch (error) {
        console.error("Error in acceptSuggestion:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter l'action suggérée."
        });
      }
    }
  };

  const rejectSuggestion = (suggestion: ActionSuggestion) => {
    // Simply remove from suggestions list
    setActionSuggestions(prev => prev.filter(s => 
      s.scheduledDate.getTime() !== suggestion.scheduledDate.getTime() || 
      s.actionType !== suggestion.actionType
    ));
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
            completedDate: currentDate
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
    getActionTypeIcon,
    actionSuggestions,
    acceptSuggestion,
    rejectSuggestion
  };
};
