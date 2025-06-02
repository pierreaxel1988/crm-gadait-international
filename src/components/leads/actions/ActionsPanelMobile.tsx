
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { addActionToLead } from '@/services/leadService';
import { TaskType } from '@/components/kanban/KanbanCard';

interface ActionsPanelMobileProps {
  lead: LeadDetailed;
  onClose: () => void;
  onActionAdded: () => void;
}

const ActionsPanelMobile: React.FC<ActionsPanelMobileProps> = ({ lead, onClose, onActionAdded }) => {
  const [newAction, setNewAction] = useState({
    actionType: 'Note',
    scheduledDate: new Date().toISOString(),
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAction.notes?.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez saisir une note pour cette action."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const actionData = {
        actionType: newAction.actionType as TaskType,
        scheduledDate: newAction.scheduledDate || new Date().toISOString(),
        notes: newAction.notes,
        completedDate: newAction.actionType === 'Note' ? new Date().toISOString() : undefined
      };
      
      const updatedLead = await addActionToLead(lead.id, actionData);
      
      if (updatedLead) {
        toast({
          title: "Action ajoutée",
          description: "L'action a été ajoutée avec succès."
        });
        onActionAdded();
        onClose();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="actionType">Type d'action</Label>
        <Select
          value={newAction.actionType}
          onValueChange={(value) => setNewAction(prev => ({ ...prev, actionType: value }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Call">Appel</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="Meeting">Rendez-vous</SelectItem>
            <SelectItem value="Visit">Visite</SelectItem>
            <SelectItem value="Follow-up">Suivi</SelectItem>
            <SelectItem value="Proposal">Proposition</SelectItem>
            <SelectItem value="Contract">Contrat</SelectItem>
            <SelectItem value="Closing">Clôture</SelectItem>
            <SelectItem value="Note">Note</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            <SelectItem value="Other">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {newAction.actionType !== 'Note' && (
        <div className="space-y-2">
          <Label htmlFor="scheduledDate">Date prévue</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Choisir une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={false}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={newAction.notes}
          onChange={(e) => setNewAction(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Ajouter une note..."
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Envoi...' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
};

export default ActionsPanelMobile;
