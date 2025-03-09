
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Event } from '@/contexts/CalendarContext';
import { TaskType } from '@/components/kanban/KanbanCard';

interface ColorOption {
  name: string;
  value: string;
}

interface CategoryOption {
  name: string;
  value: TaskType;
  color: string;
}

interface AddEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  newEvent: Omit<Event, 'id' | 'date'>;
  setNewEvent: React.Dispatch<React.SetStateAction<Omit<Event, 'id' | 'date'>>>;
  onAddEvent: () => void;
  colors: ColorOption[];
  categories?: CategoryOption[];
}

const AddEventDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedDate, 
  newEvent, 
  setNewEvent, 
  onAddEvent,
  colors,
  categories = []
}: AddEventDialogProps) => {
  
  // Générer les options d'heures de 00:00 à 23:30 par intervalle de 30 minutes avec format AM/PM
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) === 0 ? '00' : '30';
    const hourFormatted = hour.toString().padStart(2, '0');
    const timeValue = `${hourFormatted}:${minute}`;
    
    // Créer un affichage avec AM/PM
    const ampm = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const hour12Formatted = hour12.toString();
    const displayTime = `${hour12Formatted}:${minute} ${ampm} (${hourFormatted}:${minute})`;
    
    return { value: timeValue, display: displayTime };
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="font-times text-xl text-loro-terracotta">
            Ajouter un événement 
            {selectedDate && 
              <span className="font-timesItalic text-loro-navy text-lg ml-2">
                {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
              </span>
            }
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              className="border-loro-sand focus-visible:ring-loro-terracotta"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              className="border-loro-sand focus-visible:ring-loro-terracotta"
            />
          </div>

          {/* Champ pour la sélection de l'heure avec format AM/PM */}
          <div className="grid gap-2">
            <Label htmlFor="time">Heure</Label>
            <Select 
              value={newEvent.time || '09:00'} 
              onValueChange={(value) => setNewEvent({...newEvent, time: value})}
            >
              <SelectTrigger id="time" className="border-loro-sand focus:ring-loro-terracotta">
                <SelectValue placeholder="Sélectionner une heure" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {timeOptions.map(time => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {categories.length > 0 && (
            <div className="grid gap-2">
              <Label>Type d'action</Label>
              <Select 
                value={newEvent.category} 
                onValueChange={(value: TaskType) => {
                  const selectedCategory = categories.find(cat => cat.value === value);
                  setNewEvent({
                    ...newEvent, 
                    category: value,
                    color: selectedCategory?.color || newEvent.color
                  });
                }}
              >
                <SelectTrigger className="border-loro-sand focus:ring-loro-terracotta">
                  <SelectValue placeholder="Sélectionner un type d'action" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid gap-2">
            <Label>Couleur</Label>
            <RadioGroup 
              value={newEvent.color}
              onValueChange={(value) => setNewEvent({...newEvent, color: value})}
              className="flex flex-wrap gap-2"
            >
              {colors.map((color) => (
                <div key={color.value} className="flex items-center">
                  <RadioGroupItem 
                    value={color.value} 
                    id={color.value}
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor={color.value}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-2 hover:bg-gray-50 peer-data-[state=checked]:border-loro-terracotta [&:has([data-state=checked])]:border-loro-terracotta"
                  >
                    <div 
                      className="h-8 w-8 rounded-full border" 
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={onAddEvent}
            className="bg-loro-terracotta hover:bg-loro-terracotta/80"
          >
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;
