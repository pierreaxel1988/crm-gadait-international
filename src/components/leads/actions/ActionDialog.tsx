import React from 'react';
import { X, Check, CalendarClock, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { TaskType } from '@/components/kanban/KanbanCard';
import CustomButton from '@/components/ui/CustomButton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const isMobile = useIsMobile();
  if (!isOpen) return null;
  const handleConfirmClick = () => {
    // Appeler la fonction onConfirm pour enregistrer l'action
    onConfirm();
  };
  return <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className={cn("bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg w-full shadow-luxury transition-all duration-300 animate-slide-in", isMobile ? "max-h-[85vh] overflow-y-auto" : "max-w-md")} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-4 border-b rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-left text-loro-text">
              {!selectedAction ? "Nouvelle action" : `Planifier ${selectedAction}`}
            </h2>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {selectedAction && <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-2">
                {getActionTypeIcon(selectedAction)}
              </div>
              <button className="text-xs text-blue-600 hover:underline" onClick={() => setSelectedAction(null)}>
                Changer
              </button>
            </div>}
        </div>
        
        <div className="p-4">
          {!selectedAction ? <ActionTypeSelector onSelect={setSelectedAction} /> : <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal border rounded-md h-11", !actionDate && "text-muted-foreground")}>
                      <CalendarClock className="mr-2 h-4 w-4" />
                      {actionDate ? format(actionDate, 'dd/MM/yyyy') : <span>Sélectionner une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-md" align="start">
                    <Calendar mode="single" selected={actionDate} onSelect={setActionDate} initialFocus className="p-3" />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Heure</label>
                <Input type="time" value={actionTime} onChange={e => setActionTime(e.target.value)} className="w-full h-11 rounded-md" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea value={actionNotes} onChange={e => setActionNotes(e.target.value)} className="w-full p-3 border rounded-md resize-none h-24" placeholder="Notes sur cette action..." />
              </div>
            </div>}
        </div>
        
        <div className="p-4 border-t bg-gray-50 dark:bg-gray-800 sticky bottom-0 rounded-b-lg">
          {selectedAction ? <div className="flex gap-3">
              <CustomButton variant="outline" onClick={() => setSelectedAction(null)} className="flex-1 flex justify-center rounded-md">
                Retour
              </CustomButton>
              <CustomButton variant="chocolate" onClick={handleConfirmClick} className="flex-1 flex justify-center rounded-md" type="button" aria-label="Confirmer l'action">
                Confirmer
              </CustomButton>
            </div> : <CustomButton variant="outline" onClick={onClose} className="w-full rounded-md text-loro-terracotta bg-loro-text">
              Annuler
            </CustomButton>}
        </div>
      </div>
    </div>;
};
const ActionTypeSelector: React.FC<{
  onSelect: (action: TaskType) => void;
}> = ({
  onSelect
}) => {
  const actionGroups = [['Call', 'Follow up', 'Visites'], ['Estimation', 'Propositions', 'Prospection'], ['Compromis', 'Acte de vente', 'Contrat de Location', 'Admin']];
  return <div className="space-y-4">
      {actionGroups.map((group, groupIndex) => <div key={groupIndex} className="grid grid-cols-3 gap-2">
          {group.map(actionType => <CustomButton key={actionType} variant="outline" onClick={() => onSelect(actionType as TaskType)} className={cn("justify-center text-center py-2 text-sm h-auto rounded-md", "text-zinc-800 font-normal border-zinc-200")}>
              {actionType}
            </CustomButton>)}
        </div>)}
    </div>;
};
export default ActionDialog;