
import React, { useState } from 'react';
import { isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CalendarView from '@/components/calendar/CalendarView';
import DayDetail from '@/components/calendar/DayDetail';
import AddEventDialog from '@/components/calendar/AddEventDialog';

export type Event = {
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
      description: `L'événement "${event.title}" a été ajouté au ${selectedDate.toLocaleDateString('fr-FR')}`,
    });
  };

  return (
    <div className="container py-10 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 lg:w-2/5 space-y-6">
          <CalendarView 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            events={events}
          />
          
          <Button 
            className="w-full" 
            onClick={() => setIsAddEventOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un événement
          </Button>
        </div>
        
        <div className="md:w-1/2 lg:w-3/5">
          <DayDetail
            selectedDate={selectedDate}
            events={events}
            setIsAddEventOpen={setIsAddEventOpen}
          />
        </div>
      </div>

      <AddEventDialog
        isOpen={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        selectedDate={selectedDate}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        onAddEvent={handleAddEvent}
        colors={colors}
      />
    </div>
  );
};

export default CalendarPage;
