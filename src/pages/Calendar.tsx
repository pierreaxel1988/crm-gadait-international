
import React, { useState } from 'react';
import { isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CalendarView from '@/components/calendar/CalendarView';
import DayDetail from '@/components/calendar/DayDetail';
import AddEventDialog from '@/components/calendar/AddEventDialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export type Event = {
  id: string;
  title: string;
  description: string;
  date: Date;
  color?: string;
  category?: string;
};

// Define event categories with colors
const eventCategories = [
  { name: 'Visite', color: '#FDE1D3', value: 'visit' },
  { name: 'Contrat', color: '#E5DEFF', value: 'contract' },
  { name: 'Finance', color: '#D3E4FD', value: 'finance' },
  { name: 'Marketing', color: '#F2FCE2', value: 'marketing' },
  { name: 'Personnel', color: '#FEF7CD', value: 'personal' },
];

// Mock data for events
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Visite propriété',
    description: 'Visite du bien avec la famille Martin',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    color: '#FDE1D3', // Soft Peach
    category: 'visit',
  },
  {
    id: '2',
    title: 'Signature contrat',
    description: 'Signature du compromis pour la villa des Lilas',
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    color: '#E5DEFF', // Soft Purple
    category: 'contract',
  },
  {
    id: '3',
    title: 'Rendez-vous banque',
    description: 'Discussion financement avec Crédit Immobilier',
    date: new Date(),
    color: '#D3E4FD', // Soft Blue
    category: 'finance',
  },
  {
    id: '4',
    title: 'Tournage vidéo',
    description: 'Tournage du bien rue Victor Hugo',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    color: '#F2FCE2', // Soft Green
    category: 'marketing',
  },
  {
    id: '5',
    title: 'Déjeuner équipe',
    description: 'Restaurant Le Bistrot',
    date: new Date(new Date().setDate(new Date().getDate() + 4)),
    color: '#FEF7CD', // Soft Yellow
    category: 'personal',
  },
];

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'date'>>({
    title: '',
    description: '',
    color: '#FDE1D3',
    category: 'visit',
  });
  const { toast } = useToast();

  const colors = eventCategories.map(cat => ({ name: cat.name, value: cat.color }));

  const toggleFilter = (category: string) => {
    setActiveFilters(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir au moins un titre pour l'événement",
        variant: "destructive",
      });
      return;
    }

    const categoryInfo = eventCategories.find(cat => cat.value === newEvent.category);

    const event: Event = {
      id: Date.now().toString(),
      ...newEvent,
      date: selectedDate,
      color: categoryInfo?.color || newEvent.color,
    };

    setEvents([...events, event]);
    setIsAddEventOpen(false);
    setNewEvent({ title: '', description: '', color: '#FDE1D3', category: 'visit' });
    
    toast({
      title: "Événement ajouté",
      description: `L'événement "${event.title}" a été ajouté au ${selectedDate.toLocaleDateString('fr-FR')}`,
    });
  };

  return (
    <div className="container py-10 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 lg:w-2/5 space-y-6">
          {/* Category filters */}
          <Card className="bg-white shadow-luxury">
            <CardContent className="p-4">
              <div className="flex items-center mb-2 gap-2">
                <Filter className="h-4 w-4 text-loro-navy" />
                <span className="font-times text-sm">Filtrer par catégorie</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {eventCategories.map(category => (
                  <Badge
                    key={category.value}
                    variant="outline"
                    className={`cursor-pointer border-2 transition-colors ${
                      activeFilters.includes(category.value) 
                        ? 'bg-opacity-30'
                        : 'bg-white opacity-60'
                    }`}
                    style={{
                      backgroundColor: activeFilters.includes(category.value) ? `${category.color}70` : '',
                      borderColor: category.color
                    }}
                    onClick={() => toggleFilter(category.value)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <CalendarView 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            events={events}
            view={view}
            setView={setView}
            activeFilters={activeFilters}
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
            activeFilters={activeFilters}
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
        categories={eventCategories}
      />
    </div>
  );
};

export default CalendarPage;
