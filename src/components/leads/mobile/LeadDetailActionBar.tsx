
import React from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerTrigger, DrawerContent } from '@/components/ui/drawer';
import ActionsPanel from '@/components/leads/actions/ActionsPanel';
import { LeadDetailed } from '@/types/lead';
import { Save, Check } from 'lucide-react';

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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-center items-center">
      <div className="flex gap-3 w-full justify-between">
        <div className="flex items-center gap-2">
          {autoSaveEnabled ? (
            isSaving ? (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                <span>Enregistrement...</span>
              </div>
            ) : hasChanges ? (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Modifications en cours...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Tout est enregistré</span>
              </div>
            )
          ) : (
            <Button 
              onClick={onManualSave} 
              size="sm" 
              variant="outline" 
              className="h-8 px-2 text-xs"
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                  <span>Enregistrement...</span>
                </div>
              ) : hasChanges ? (
                <div className="flex items-center gap-1">
                  <Save className="h-3 w-3" />
                  <span>Enregistrer</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="h-3 w-3" />
                  <span>Enregistré</span>
                </div>
              )}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="px-4">Actions</Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh]">
              <div className="p-4">
                <h2 className="text-lg font-medium mb-4">Historique des actions</h2>
                <ActionsPanel
                  lead={lead}
                  getActionTypeIcon={getActionTypeIcon}
                  onMarkComplete={onMarkComplete}
                  onAddAction={onAddAction}
                />
              </div>
            </DrawerContent>
          </Drawer>
          <Button 
            onClick={onAddAction} 
            className="bg-chocolate-dark hover:bg-chocolate-light"
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
