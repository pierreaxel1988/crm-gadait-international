import React from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import ActionsPanel from '@/components/leads/actions/ActionsPanel';
import { LeadDetailed } from '@/types/lead';
import { Save, Check, Clock, X, History, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  
  const handleActionsClick = () => {
    // Navigate to Actions tab by updating URL search parameters
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', 'actions');
    navigate(`/leads/${lead.id}?${searchParams.toString()}`, { replace: true });
  };
  
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
          <Button 
            variant="outline" 
            size="sm" 
            className="px-4 transition-all duration-200 active:scale-95 font-futura tracking-wide flex items-center gap-2 border-loro-navy/30 text-loro-navy hover:bg-loro-pearl/20"
            onClick={handleActionsClick}
          >
            <History className="h-4 w-4 text-loro-navy" />
            Actions
          </Button>
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
