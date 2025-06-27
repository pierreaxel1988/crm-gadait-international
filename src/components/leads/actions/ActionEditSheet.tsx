
import React, { useState, useEffect } from 'react';
import { ActionHistory } from '@/types/actionHistory';
import { LeadDetailed } from '@/types/lead';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Clock, Save, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { updateLead } from '@/services/leadService';

interface ActionEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  action: ActionHistory | null;
  lead: LeadDetailed;
  onUpdate: (updatedLead: LeadDetailed) => void;
  getActionTypeIcon: (type: string) => React.ReactNode;
}

const ActionEditSheet: React.FC<ActionEditSheetProps> = ({
  isOpen,
  onClose,
  action,
  lead,
  onUpdate,
  getActionTypeIcon
}) => {
  const [editedAction, setEditedAction] = useState<ActionHistory | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState<string>('12:00');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (action) {
      setEditedAction(action);
      setNotes(action.notes || '');
      
      if (action.scheduledDate) {
        const date = new Date(action.scheduledDate);
        setScheduledDate(date);
        setScheduledTime(format(date, 'HH:mm'));
      } else {
        setScheduledDate(undefined);
        setScheduledTime('12:00');
      }
    }
  }, [action]);

  const handleSave = async () => {
    if (!editedAction || !lead) return;

    try {
      setIsLoading(true);
      console.log("Saving action with:", {
        actionId: editedAction.id,
        scheduledDate,
        scheduledTime,
        notes
      });

      // Combiner la date et l'heure correctement
      let updatedScheduledDate = editedAction.scheduledDate;
      if (scheduledDate) {
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const combinedDateTime = new Date(scheduledDate);
        combinedDateTime.setHours(hours, minutes, 0, 0); // Reset seconds and milliseconds
        updatedScheduledDate = combinedDateTime.toISOString();
        console.log("Combined date/time:", updatedScheduledDate);
      }

      const updatedActionHistory = lead.actionHistory?.map(a => 
        a.id === editedAction.id ? {
          ...a,
          scheduledDate: updatedScheduledDate,
          notes: notes
        } : a
      ) || [];

      console.log("Updated action history:", updatedActionHistory);

      const updatedLead = await updateLead({
        ...lead,
        actionHistory: updatedActionHistory
      });

      if (updatedLead) {
        console.log("Lead updated successfully:", updatedLead);
        onUpdate(updatedLead);
        toast({
          title: "Action mise à jour",
          description: "L'action a été mise à jour avec succès"
        });
        onClose();
      } else {
        console.error("Failed to update lead - no response");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Aucune réponse lors de la mise à jour"
        });
      }
    } catch (error) {
      console.error("Error updating action:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour l'action"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editedAction || !lead) return;

    try {
      setIsLoading(true);

      const updatedActionHistory = lead.actionHistory?.filter(a => a.id !== editedAction.id) || [];

      const updatedLead = await updateLead({
        ...lead,
        actionHistory: updatedActionHistory
      });

      if (updatedLead) {
        onUpdate(updatedLead);
        toast({
          title: "Action supprimée",
          description: "L'action a été supprimée avec succès"
        });
        onClose();
      }
    } catch (error) {
      console.error("Error deleting action:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'action"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!editedAction) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center gap-3">
            {getActionTypeIcon(editedAction.actionType)}
            <span className="text-lg font-futura text-chocolate-dark">
              Modifier l'action
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Action Type (Read-only) */}
          <div>
            <Label className="text-sm font-medium text-gray-800">Type d'action</Label>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                {getActionTypeIcon(editedAction.actionType)}
                <span className="font-medium text-chocolate-dark">
                  {editedAction.actionType}
                </span>
              </div>
            </div>
          </div>

          {/* Scheduled Date */}
          <div>
            <Label className="text-sm font-medium text-gray-800">Date programmée</Label>
            <div className="mt-2 flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? (
                      format(scheduledDate, "dd/MM/yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => {
                    console.log("Time changed to:", e.target.value);
                    setScheduledTime(e.target.value);
                  }}
                  className="w-24"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium text-gray-800">Notes</Label>
            <Textarea
              placeholder="Ajouter des notes pour cette action..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 min-h-[120px] resize-none"
            />
          </div>

          {/* Status Info */}
          {editedAction.completedDate && (
            <div>
              <Label className="text-sm font-medium text-gray-800">Status</Label>
              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✅ Action terminée le {format(new Date(editedAction.completedDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-chocolate-dark hover:bg-chocolate-dark/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>

            <Button
              onClick={handleDelete}
              disabled={isLoading}
              variant="destructive"
              className="px-4"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ActionEditSheet;
