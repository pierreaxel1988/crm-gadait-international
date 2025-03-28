
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Event, eventCategories } from '@/contexts/CalendarContext';
import { TaskType } from '@/components/kanban/KanbanCard';

interface AddEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  newEvent: Omit<Event, 'id' | 'date'>;
  setNewEvent: React.Dispatch<React.SetStateAction<Omit<Event, 'id' | 'date'>>>;
  onAddEvent: () => void;
  colors: { name: string; value: string }[];
  categories: { name: string; value: TaskType; color: string }[];
}

const AddEventDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedDate, 
  newEvent, 
  setNewEvent, 
  onAddEvent,
  colors,
  categories
}: AddEventDialogProps) => {
  // Generate time options (every 30 min)
  const timeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const handleCategoryChange = (category: TaskType) => {
    const categoryInfo = eventCategories.find(cat => cat.value === category);
    setNewEvent({
      ...newEvent,
      category,
      color: categoryInfo?.color || newEvent.color
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-futura text-xl text-zinc-900">
            Ajouter un événement
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <div className="flex items-center gap-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Sélectionner une date'}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="time">Heure</Label>
            <Select value={newEvent.time} onValueChange={(value) => setNewEvent({ ...newEvent, time: value })}>
              <SelectTrigger id="time" className="w-full">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Sélectionner une heure" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {timeOptions().map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
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
              rows={3} 
              value={newEvent.description} 
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} 
              placeholder="Description de l'événement" 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select 
              value={newEvent.category} 
              onValueChange={(value) => handleCategoryChange(value as TaskType)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={onAddEvent}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;
