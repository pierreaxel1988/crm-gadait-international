
import React, { useState } from 'react';
import { Event, useCalendar } from '@/contexts/CalendarContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Clock, AlertTriangle, User, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AllActionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AllActionsDialog = ({ isOpen, onOpenChange }: AllActionsDialogProps) => {
  const { events, markEventComplete } = useCalendar();
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');

  // Filter events based on action property and completion status
  const actionEvents = events.filter(event => event.actionId);
  
  // Get today's date at midnight for comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Tomorrow at midnight
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Filter by tab selection
  const filteredEvents = activeTab === 'all' 
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

  // Sort events by date
  const sortedEvents = [...filteredEvents].sort((a, b) => a.date.getTime() - b.date.getTime());

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
        
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'all' | 'today' | 'upcoming' | 'overdue')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">
              Toutes ({actionEvents.length})
            </TabsTrigger>
            <TabsTrigger value="today">
              Aujourd'hui ({actionEvents.filter(e => {
                const eventDate = new Date(e.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() === today.getTime() && !e.isCompleted;
              }).length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              À venir ({actionEvents.filter(e => {
                const eventDate = new Date(e.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() > today.getTime() && !e.isCompleted;
              }).length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              En retard ({actionEvents.filter(e => {
                const eventDate = new Date(e.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() < today.getTime() && !e.isCompleted;
              }).length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="overflow-auto max-h-[calc(80vh-180px)]">
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
