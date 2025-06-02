import React, { useState, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { ActionHistory } from '@/types/actionHistory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle, Circle, Plus, XCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { addActionToLead } from '@/services/leadService';
import { TaskType } from '@/components/kanban/KanbanCard';

interface ActionsTabProps {
  lead: LeadDetailed;
  onLeadUpdate: (lead: LeadDetailed) => void;
}

const ActionsTab: React.FC<ActionsTabProps> = ({ lead, onLeadUpdate }) => {
  const [newAction, setNewAction] = useState({
    actionType: 'Note' as TaskType,
    scheduledDate: new Date().toISOString(),
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (lead) {
      setNewAction({
        actionType: 'Note' as TaskType,
        scheduledDate: new Date().toISOString(),
        notes: ''
      });
    }
  }, [lead]);

  const handleAddAction = async () => {
    if (!newAction.notes.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez saisir une description pour cette action."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const actionData = {
        actionType: newAction.actionType,
        scheduledDate: newAction.scheduledDate,
        notes: newAction.notes
      };
      
      const updatedLead = await addActionToLead(lead.id, actionData);

      if (updatedLead) {
        toast({
          title: "Action ajoutée",
          description: "L'action a été ajoutée avec succès."
        });
        onLeadUpdate(updatedLead);
        setNewAction({
          actionType: 'Note' as TaskType,
          scheduledDate: new Date().toISOString(),
          notes: ''
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter l'action."
        });
      }
    } catch (error) {
      console.error("Error adding action:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout de l'action."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionTypeChange = (value: TaskType) => {
    setNewAction(prev => ({ ...prev, actionType: value }));
  };

  const handleScheduledDateChange = (date: Date | undefined) => {
    if (date) {
      setNewAction(prev => ({ ...prev, scheduledDate: date.toISOString() }));
    }
  };

  const actionTypes: TaskType[] = [
    'Call', 'Email', 'Meeting', 'Visit', 'Follow-up', 'Proposal', 'Contract', 'Closing', 'Other', 'Note', 'WhatsApp'
  ];

  return (
    <div className="space-y-4">
      {lead.actionHistory && lead.actionHistory.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Historique des actions</h3>
          <ul className="space-y-2">
            {lead.actionHistory.map((action: ActionHistory) => (
              <li key={action.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{action.actionType}</div>
                  {action.completedDate ? (
                    <CheckCircle className="text-green-500 h-4 w-4" />
                  ) : (
                    <Circle className="text-gray-400 h-4 w-4" />
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Date prévue: {action.scheduledDate ? format(new Date(action.scheduledDate), 'dd/MM/yyyy') : 'Non définie'}
                </div>
                <div className="text-xs text-gray-500">
                  Date de création: {action.createdAt ? format(new Date(action.createdAt), 'dd/MM/yyyy') : 'Non définie'}
                </div>
                {action.completedDate && (
                  <div className="text-xs text-gray-500">
                    Date de complétion: {format(new Date(action.completedDate), 'dd/MM/yyyy')}
                  </div>
                )}
                <div className="text-sm">{action.notes}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Aucune action enregistrée pour ce lead.</div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Ajouter une action</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="actionType">Type d'action</Label>
            <Select value={newAction.actionType} onValueChange={handleActionTypeChange}>
              <SelectTrigger id="actionType" className="w-full font-futura">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map(type => (
                  <SelectItem key={type} value={type} className="font-futura">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Date prévue</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newAction.scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newAction.scheduledDate ? (
                    format(new Date(newAction.scheduledDate), "dd MMMM yyyy")
                  ) : (
                    <span>Choisir une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newAction.scheduledDate ? new Date(newAction.scheduledDate) : undefined}
                  onSelect={handleScheduledDateChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Description</Label>
          <Textarea
            id="notes"
            placeholder="Détails de l'action..."
            value={newAction.notes}
            onChange={(e) => setNewAction(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full font-futura"
          />
        </div>
        <Button onClick={handleAddAction} disabled={isSubmitting} className="bg-chocolate-dark hover:bg-chocolate-light">
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ajout en cours...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une action
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ActionsTab;
