
import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TaskType } from '@/types/actionHistory';

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
  setActionDate,
  actionTime,
  setActionTime,
  actionNotes,
  setActionNotes,
  onConfirm,
  getActionTypeIcon
}) => {
  // Action types available in the system
  const actionTypes: TaskType[] = [
    'Call',
    'Visit',
    'Contract',
    'Sales Act',
    'Rental Contract',
    'Offer',
    'Follow Up',
    'Estimation',
    'Prospecting',
    'Admin'
  ];

  // Validate if form can be submitted
  const canSubmit = selectedAction !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-times">Planifier une action</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Type d'action</h3>
            <Tabs 
              onValueChange={(value) => setSelectedAction(value as TaskType)} 
              value={selectedAction || undefined}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <div className="grid grid-cols-2 gap-1 col-span-2">
                  {actionTypes.map(type => (
                    <TabsTrigger 
                      key={type} 
                      value={type} 
                      className="py-1.5 px-1 text-xs rounded flex items-center justify-center gap-1"
                    >
                      {type}
                    </TabsTrigger>
                  ))}
                </div>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Date et heure</h3>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {actionDate ? (
                      format(actionDate, "dd/MM/yyyy")
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={actionDate}
                    onSelect={setActionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <select 
                value={actionTime}
                onChange={(e) => setActionTime(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {Array.from({ length: 24 }).map((_, hour) => {
                  return (
                    <React.Fragment key={hour}>
                      <option value={`${hour.toString().padStart(2, '0')}:00`}>
                        {hour.toString().padStart(2, '0')}:00
                      </option>
                      <option value={`${hour.toString().padStart(2, '0')}:30`}>
                        {hour.toString().padStart(2, '0')}:30
                      </option>
                    </React.Fragment>
                  );
                })}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Notes</h3>
            <Textarea 
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Ajouter des notes concernant cette action..."
              className="min-h-[80px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            disabled={!canSubmit} 
            className="bg-chocolate-dark hover:bg-chocolate-light text-white"
            onClick={onConfirm}
          >
            Planifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActionDialog;
