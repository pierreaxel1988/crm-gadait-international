
import React from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import ActionsPanel from '@/components/leads/actions/ActionsPanel';
import { LeadDetailed } from '@/types/lead';
import { Save, Check, Clock, X } from 'lucide-react';

interface LeadDetailActionBarProps {
  autoSaveEnabled: boolean;
  onAddAction: () => void;
  lead: LeadDetailed;
  getActionTypeIcon: any;
  onMarkComplete: (actionId: string) => void;
  hasChanges?: boolean;
  isSaving?: boolean;
  onManualSave?: () => void;
}

const LeadDetailActionBar: React.FC<LeadDetailActionBarProps> = ({
  autoSaveEnabled,
  onAddAction,
  lead,
  getActionTypeIcon,
  onMarkComplete,
  hasChanges = false,
  isSaving = false,
  onManualSave
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 flex justify-center items-center transition-all animate-[slide-in_0.3s_ease-out] z-20">
      <div className="flex gap-3 w-full justify-between items-center">
        <div className="flex items-center">
          {autoSaveEnabled ? (
            <div className="flex items-center" title={isSaving ? "Enregistrement en cours" : hasChanges ? "Modifications en attente" : "Tout est enregistré"}>
              {isSaving ? (
                <div className="w-5 h-5 text-amber-500 animate-pulse">
                  <Clock className="h-5 w-5" />
                </div>
              ) : hasChanges ? (
                <div className="w-5 h-5 text-amber-500">
                  <Clock className="h-5 w-5" />
                </div>
              ) : (
                <div className="w-5 h-5 text-green-500">
                  <Check className="h-5 w-5" />
                </div>
              )}
            </div>
          ) : (
            <Button 
              onClick={onManualSave} 
              size="sm" 
              variant="outline" 
              className="h-8 px-2 text-xs transition-all duration-200 active:scale-95"
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? (
                <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
              ) : hasChanges ? (
                <Save className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4 text-green-500" />
              )}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="px-4 transition-all duration-200 active:scale-95 font-futura"
              >
                Actions
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh] rounded-t-xl shadow-xl border-t-0 bg-gray-50">
              <div className="p-0 pb-0">
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-10">
                  <DrawerTitle className="text-lg font-futura">Historique des actions</DrawerTitle>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
                <DrawerDescription className="sr-only">
                  Liste des actions pour ce lead
                </DrawerDescription>
                <ScrollArea className="h-[70vh] pb-safe overflow-y-auto overscroll-contain px-4 pt-2">
                  <div className="pb-6">
                    <ActionsPanel
                      lead={lead}
                      getActionTypeIcon={getActionTypeIcon}
                      onMarkComplete={onMarkComplete}
                      onAddAction={onAddAction}
                    />
                  </div>
                </ScrollArea>
              </div>
            </DrawerContent>
          </Drawer>
          <Button 
            onClick={onAddAction} 
            className="bg-chocolate-dark hover:bg-chocolate-light transition-all duration-200 active:scale-95 font-futura"
            size="sm"
            type="button"
            aria-label="Ajouter une nouvelle action"
          >
            Nouvelle action
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailActionBar;
