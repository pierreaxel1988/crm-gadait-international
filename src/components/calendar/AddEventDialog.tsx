
import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Event } from '@/pages/Calendar';

interface AddEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  newEvent: Omit<Event, 'id' | 'date'>;
  setNewEvent: React.Dispatch<React.SetStateAction<Omit<Event, 'id' | 'date'>>>;
  onAddEvent: () => void;
  colors: { name: string; value: string }[];
}

const AddEventDialog = ({
  isOpen,
  onOpenChange,
  selectedDate,
  newEvent,
  setNewEvent,
  onAddEvent,
  colors,
}: AddEventDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-times text-xl text-loro-terracotta">
            Ajouter un événement
          </DialogTitle>
          <DialogDescription>
            Ajoutez un nouvel événement au {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'calendrier'}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Titre de l'événement"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Description de l'événement"
            />
          </div>
          <div className="grid gap-2">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <div
                  key={color.value}
                  className={`h-8 w-8 rounded-full cursor-pointer border-2 transition-all ${
                    newEvent.color === color.value ? 'border-loro-navy scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onAddEvent}>
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;
