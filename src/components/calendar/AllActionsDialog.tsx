
import React, { useState, useMemo } from 'react';
import { Event, eventCategories, useCalendar } from '@/contexts/CalendarContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Clock, AlertTriangle, User, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskType } from '@/components/kanban/KanbanCard';
import { supabase } from '@/integrations/supabase/client';

interface AllActionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TeamMember {
  id: string;
  name: string;
}

const AllActionsDialog = ({ isOpen, onOpenChange }: AllActionsDialogProps) => {
  const { events, markEventComplete } = useCalendar();
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Fetch team members on dialog open
  React.useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      if (data) {
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  // Filter events based on action property and completion status
  const actionEvents = useMemo(() => {
    // First filter to get only action events
    let filtered = events.filter(event => event.actionId);
    
    // Then apply category filter if not 'all'
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    // Then apply assignee filter if not 'all'
    if (selectedAssignee !== 'all') {
      filtered = filtered.filter(event => event.assignedToId === selectedAssignee);
    }
    
    return filtered;
  }, [events, selectedCategory, selectedAssignee]);
  
  // Get today's date at midnight for comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Tomorrow at midnight
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Filter by tab selection
  const filteredEvents = useMemo(() => {
    return activeTab === 'all' 
      ? actionEvents 
      : activeTab === 'today'
        ? actionEvents.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === today.getTime() && !event.isCompleted;
          })
        : activeTab === 'upcoming'
          ? actionEvents.filter(event => {
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              return eventDate.getTime() > today.getTime() && !event.isCompleted;
            })
          : actionEvents.filter(event => {
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              return eventDate.getTime() < today.getTime() && !event.isCompleted;
            });
  }, [actionEvents, activeTab]);

  // Sort events by date
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredEvents]);

  const getStatusIcon = (event: Event) => {
    if (event.isCompleted) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate.getTime() < today.getTime()) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    
    if (eventDate.getTime() === today.getTime()) {
      return <Clock className="h-4 w-4 text-amber-500" />;
    }
    
    return <CalendarIcon className="h-4 w-4 text-blue-500" />;
  };

  const getFilteredCountByTab = (tabName: 'all' | 'today' | 'upcoming' | 'overdue') => {
    if (tabName === 'all') return actionEvents.length;
    
    return actionEvents.filter(e => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      
      if (tabName === 'today') {
        return eventDate.getTime() === today.getTime() && !e.isCompleted;
      } else if (tabName === 'upcoming') {
        return eventDate.getTime() > today.getTime() && !e.isCompleted;
      } else { // overdue
        return eventDate.getTime() < today.getTime() && !e.isCompleted;
      }
    }).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-futuraLight text-loro-terracotta text-xl font-medium">
            Toutes les Actions
          </DialogTitle>
          <DialogDescription className="font-times text-chocolate-dark">
            Visualisez et gérez toutes vos actions planifiées
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Filtrer par catégorie</label>
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent searchable>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {eventCategories.map((category) => (
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
          
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground">Filtrer par personne</label>
            <Select 
              value={selectedAssignee} 
              onValueChange={setSelectedAssignee}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Assigné à" />
              </SelectTrigger>
              <SelectContent searchable>
                <SelectItem value="all">Tous les membres</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'all' | 'today' | 'upcoming' | 'overdue')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">
              Toutes ({getFilteredCountByTab('all')})
            </TabsTrigger>
            <TabsTrigger value="today">
              Aujourd'hui ({getFilteredCountByTab('today')})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              À venir ({getFilteredCountByTab('upcoming')})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              En retard ({getFilteredCountByTab('overdue')})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="overflow-auto max-h-[calc(80vh-270px)]">
            {sortedEvents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statut</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Assigné à</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEvents.map((event) => (
                    <TableRow key={event.id} className={event.isCompleted ? 'bg-gray-50 opacity-70' : ''}>
                      <TableCell className="w-12">
                        {getStatusIcon(event)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-gray-500">{event.description}</div>
                          )}
                          {event.category && (
                            <div className="mt-1">
                              <span 
                                className="text-xs py-0.5 px-2 rounded-full font-medium"
                                style={{ 
                                  backgroundColor: eventCategories.find(c => c.value === event.category)?.color + '80' || '#D3D3D380' 
                                }}
                              >
                                {event.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="whitespace-nowrap">
                          {format(event.date, 'dd MMM yyyy', { locale: fr })}
                        </div>
                        {event.time && (
                          <div className="text-xs text-gray-600">{event.time}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {event.assignedToName && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1 text-gray-500" />
                            <span className="text-sm">{event.assignedToName}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {!event.isCompleted && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-xs text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                            onClick={() => markEventComplete(event.id)}
                          >
                            <Check className="h-3 w-3 mr-1" /> Terminer
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <p className="text-muted-foreground text-xs font-futuraLight italic">
                  Aucune action trouvée pour cette sélection.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AllActionsDialog;
