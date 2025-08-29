import React, { useState, useEffect } from 'react';
import { ActionHistory } from '@/types/actionHistory';
import { LeadDetailed } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Clock, CheckCircle, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { updateLead } from '@/services/leadService';

interface ActionEditCardProps {
  isOpen: boolean;
  onClose: () => void;
  action: ActionHistory | null;
  lead: LeadDetailed;
  onUpdate: (updatedLead: LeadDetailed) => void;
  getActionTypeIcon: (type: string) => React.ReactNode;
}

const ActionEditCard: React.FC<ActionEditCardProps> = ({
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
      
      console.log("=== DÉBUT SAUVEGARDE ACTION ===");
      console.log("Action originale:", editedAction);
      console.log("ID de l'action à modifier:", editedAction.id);
      console.log("Nouvelle date sélectionnée:", scheduledDate);
      console.log("Nouvelle heure sélectionnée:", scheduledTime);
      console.log("Nouvelles notes:", notes);

      let updatedScheduledDate = editedAction.scheduledDate;
      if (scheduledDate) {
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        // Créer une nouvelle date en utilisant les composants locaux pour éviter les problèmes de timezone
        const year = scheduledDate.getFullYear();
        const month = scheduledDate.getMonth();
        const day = scheduledDate.getDate();
        const combinedDateTime = new Date(year, month, day, hours, minutes, 0, 0);
        updatedScheduledDate = combinedDateTime.toISOString();
        console.log("Date sélectionnée décomposée:", { year, month, day, hours, minutes });
        console.log("Date combinée calculée:", updatedScheduledDate);
        console.log("Date combinée locale:", combinedDateTime.toLocaleDateString());
      }

      console.log("ActionHistory AVANT modification:", lead.actionHistory);
      
      const updatedActionHistory = lead.actionHistory?.map(a => {
        if (a.id === editedAction.id) {
          console.log("Action trouvée à modifier:", a);
          const updated = {
            ...a,
            scheduledDate: updatedScheduledDate,
            notes: notes
          };
          console.log("Action APRÈS modification:", updated);
          return updated;
        }
        return a;
      }) || [];

      console.log("ActionHistory APRÈS modification:", updatedActionHistory);
      console.log("Action modifiée dans l'historique:", 
        updatedActionHistory.find(a => a.id === editedAction.id)
      );

      console.log("Envoi vers updateLead avec actionHistory:", updatedActionHistory.length, "actions");

      const updatedLead = await updateLead({
        ...lead,
        actionHistory: updatedActionHistory
      });

      console.log("Réponse d'updateLead:", updatedLead);

      if (updatedLead) {
        console.log("=== SAUVEGARDE RÉUSSIE ===");
        onUpdate(updatedLead);
        toast({
          title: "Action mise à jour",
          description: "L'action a été mise à jour avec succès"
        });
        onClose();
      } else {
        console.error("=== ERREUR: updateLead a retourné null ===");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Aucune réponse lors de la mise à jour"
        });
      }
    } catch (error) {
      console.error("=== ERREUR LORS DE LA SAUVEGARDE ===", error);
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
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !editedAction) return null;

  const isCompleted = !!editedAction.completedDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md mx-4 animate-scale-in">
        {/* Action Card - Style similaire à la carte originale mais éditable */}
        <div className={`
          rounded-xl border-2 p-6 bg-white shadow-xl
          ${isCompleted ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}
        `}>
          {/* En-tête avec bouton fermer */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="text-lg font-medium text-gray-900">
                  {editedAction.actionType}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Date et heure éditables */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal bg-white border-gray-300",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? (
                      format(scheduledDate, "dd/MM/yyyy", { locale: fr })
                    ) : (
                      <span>Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center">
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-20 bg-white border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Notes éditables */}
          <div className="mb-6">
            <Textarea
              placeholder="Ajouter des détails sur cette action..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`
                min-h-[80px] resize-none border-gray-300 bg-white
                placeholder:text-gray-500 text-gray-900
              `}
            />
          </div>

          {/* Statut si terminé */}
          {isCompleted && (
            <div className="mb-4 p-3 bg-green-100 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Terminé le {format(new Date(editedAction.completedDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}
              </p>
            </div>
          )}

          {/* Boutons d'action - Style similaire à l'original */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionEditCard;