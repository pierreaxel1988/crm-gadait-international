
import React from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import ActionsPanel from '@/components/leads/actions/ActionsPanel';
import { LeadDetailed } from '@/types/lead';
import { Save, Check, Clock, X, History, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

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
  const navigate = useNavigate();
  
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
              className="h-8 px-2 text-xs transition-all duration-200 active:scale-95 font-futura"
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
                className="px-4 transition-all duration-200 active:scale-95 font-futura tracking-wide flex items-center gap-2 border-chocolate-dark/30 text-chocolate-dark hover:bg-chocolate-dark/10"
              >
                <History className="h-4 w-4 text-chocolate-dark" />
                Historique
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-gradient-to-b from-loro-white to-loro-pearl/30 border-0 max-h-[92vh] rounded-t-xl shadow-xl">
              <div className="p-0 pb-0">
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-chocolate-dark to-chocolate-dark/90 text-white sticky top-0 z-10 border-b border-chocolate-light/20 rounded-t-xl">
                  <div className="flex-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 mr-2 rounded-full text-white hover:bg-white/10 transition-colors"
                      asChild
                    >
                      <DrawerClose>
                        <ArrowLeft className="h-4 w-4" />
                      </DrawerClose>
                    </Button>
                  </div>
                  
                  <DrawerTitle className="text-lg font-futura flex items-center gap-2 tracking-wide flex-[2] text-center">
                    <History className="h-4 w-4 text-loro-pearl/80" />
                    {lead.name}
                  </DrawerTitle>
                  
                  <div className="flex-1 flex justify-end">
                    <DrawerClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/10 transition-colors">
                        <X className="h-4 w-4" />
                      </Button>
                    </DrawerClose>
                  </div>
                </div>
                
                <div className="px-3 py-2 bg-loro-pearl/20 border-b border-loro-pearl/30">
                  <div className="text-xs text-loro-navy/70 font-futuraLight">
                    {lead.email && <div className="mb-1">Email: {lead.email}</div>}
                    {lead.phone && <div>Tél: {lead.phone}</div>}
                  </div>
                </div>
                
                <DrawerDescription className="sr-only">
                  Liste des actions pour ce lead
                </DrawerDescription>
                <ScrollArea className="h-[78vh] pb-safe overflow-y-auto overscroll-contain pt-0">
                  <div className="pb-8">
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
            className="bg-chocolate-dark hover:bg-chocolate-light transition-all duration-200 active:scale-95 font-futura tracking-wide"
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
