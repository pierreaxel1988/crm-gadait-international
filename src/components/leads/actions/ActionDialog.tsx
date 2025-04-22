import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TaskType } from '@/types/actionHistory';
import { Textarea } from '@/components/ui/textarea';

interface ActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAction: TaskType | null;
  setSelectedAction: (action: TaskType | null) => void;
  actionDate: Date | undefined;
  setActionDate: (date: Date | undefined) => void;
  actionTime: string;
  setActionTime: (time: string) => void;
  actionNotes: string;
  setActionNotes: (notes: string) => void;
  onConfirm: () => void;
  getActionTypeIcon: (type: TaskType) => React.ReactNode;
}

const ActionDialog: React.FC<ActionDialogProps> = ({
  isOpen,
  onClose,
  selectedAction,
  setSelectedAction,
  actionDate,
  actionTime,
  actionNotes,
  setActionNotes,
  onConfirm,
  getActionTypeIcon
}) => {
  const handleActionSelect = (action: TaskType) => {
    setSelectedAction(action);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActionTime(e.target.value);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setActionNotes(e.target.value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter une action</DialogTitle>
          <DialogDescription>Sélectionnez le type d'action et entrez les détails.</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="actionType">Type d'action</Label>
            <div className="flex flex-wrap gap-2">
              {['Call', 'Visit', 'Contract', 'Sales Act', 'Rental Contract', 'Offer', 'Follow Up', 'Estimation', 'Prospecting', 'Admin'].map((actionType) => (
                <Button
                  key={actionType}
                  variant={selectedAction === actionType ? "default" : "outline"}
                  onClick={() => handleActionSelect(actionType as TaskType)}
                >
                  {getActionTypeIcon(actionType as TaskType)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label htmlFor="actionDate">Date</Label>
              <input
                type="date"
                id="actionDate"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={actionDate ? actionDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setActionDate(new Date(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="actionTime">Heure</Label>
              <input
                type="time"
                id="actionTime"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={actionTime}
                onChange={handleTimeChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Détails de l'action..."
              value={actionNotes}
              onChange={handleNotesChange}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" onClick={onConfirm} disabled={!selectedAction}>
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActionDialog;
