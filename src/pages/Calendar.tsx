
import React, { useState } from 'react';
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, isWithinInterval } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Event = {
  id: string;
  title: string;
  description: string;
  date: Date;
  color?: string;
};

// Mock data for events
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Visite propriété',
    description: 'Visite du bien avec la famille Martin',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    color: '#FDE1D3', // Soft Peach
  },
  {
    id: '2',
    title: 'Signature contrat',
    description: 'Signature du compromis pour la villa des Lilas',
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    color: '#E5DEFF', // Soft Purple
  },
  {
    id: '3',
    title: 'Rendez-vous banque',
    description: 'Discussion financement avec Crédit Immobilier',
    date: new Date(),
    color: '#D3E4FD', // Soft Blue
  },
];

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'date'>>({
    title: '',
    description: '',
    color: '#FDE1D3',
  });
  const { toast } = useToast();

  const colors = [
    { name: 'Pêche', value: '#FDE1D3' },
    { name: 'Lavande', value: '#E5DEFF' },
    { name: 'Ciel', value: '#D3E4FD' },
    { name: 'Pistache', value: '#F2FCE2' },
    { name: 'Soleil', value: '#FEF7CD' },
    { name: 'Terracotta', value: '#9D5248' },
  ];

  const eventsForSelectedDate = selectedDate
    ? events.filter((event) => isSameDay(event.date, selectedDate))
    : [];

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir au moins un titre pour l'événement",
        variant: "destructive",
      });
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      ...newEvent,
      date: selectedDate,
    };

    setEvents([...events, event]);
    setIsAddEventOpen(false);
    setNewEvent({ title: '', description: '', color: '#FDE1D3' });
    
    toast({
      title: "Événement ajouté",
      description: `L'événement "${event.title}" a été ajouté au ${format(selectedDate, 'dd/MM/yyyy')}`,
    });
  };

  // Function to generate day content - small dots for events
  const renderDayContent = (day: Date) => {
    const eventsOnDay = events.filter((event) => isSameDay(event.date, day));
    
    if (eventsOnDay.length === 0) return null;
    
    return (
      <div className="flex justify-center mt-1 space-x-0.5">
        {eventsOnDay.slice(0, 3).map((event, i) => (
          <div 
            key={i} 
            className="h-1.5 w-1.5 rounded-full" 
            style={{ backgroundColor: event.color }}
          />
        ))}
        {eventsOnDay.length > 3 && (
          <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
        )}
      </div>
    );
  };

  return (
    <div className="container py-10 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 lg:w-2/5 space-y-6">
          <Card className="bg-white shadow-luxury">
            <CardHeader className="pb-2">
              <CardTitle className="font-times text-2xl text-loro-terracotta">Calendrier</CardTitle>
              <CardDescription className="font-times text-chocolate-dark">
                Suivi de vos rendez-vous et événements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="border-0"
                components={{
                  DayContent: ({ date }) => (
                    <>
                      {date.getDate()}
                      {renderDayContent(date)}
                    </>
                  ),
                }}
                modifiers={{
                  hasEvent: (date) => events.some(event => isSameDay(event.date, date)),
                }}
                modifiersClassNames={{
                  hasEvent: "font-medium text-loro-navy",
                }}
              />
            </CardContent>
          </Card>
          
          <Button 
            className="w-full" 
            onClick={() => setIsAddEventOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un événement
          </Button>
        </div>
        
        <div className="md:w-1/2 lg:w-3/5">
          <Card className="bg-white shadow-luxury h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-times text-2xl text-loro-terracotta">
                  {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: require('date-fns/locale/fr') }) : 'Sélectionner une date'}
                </CardTitle>
                <CalendarIcon className="h-5 w-5 text-loro-terracotta" />
              </div>
              <CardDescription className="font-times text-chocolate-dark">
                {eventsForSelectedDate.length 
                  ? `${eventsForSelectedDate.length} événement${eventsForSelectedDate.length > 1 ? 's' : ''}`
                  : 'Aucun événement prévu'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {eventsForSelectedDate.map((event) => (
                    <div 
                      key={event.id} 
                      className="p-4 rounded-lg border transition-all hover:shadow-luxury-hover"
                      style={{ backgroundColor: `${event.color}30` /* 30% opacity */ }}
                    >
                      <h3 className="font-times text-lg font-medium">{event.title}</h3>
                      <p className="text-loro-navy mt-1">{event.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-loro-navy font-timesItalic">
                    Aucun événement prévu pour cette date.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => setIsAddEventOpen(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un événement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
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
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddEvent}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
