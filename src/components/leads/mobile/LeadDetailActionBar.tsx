
import React from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerTrigger, DrawerContent } from '@/components/ui/drawer';
import ActionsPanel from '@/components/leads/actions/ActionsPanel';
import { LeadDetailed } from '@/types/lead';

interface LeadDetailActionBarProps {
  autoSaveEnabled: boolean;
  onAddAction: () => void;
  lead: LeadDetailed;
  getActionTypeIcon: any;
  onMarkComplete: (actionId: string) => void;
}

const LeadDetailActionBar: React.FC<LeadDetailActionBarProps> = ({
  autoSaveEnabled,
  onAddAction,
  lead,
  getActionTypeIcon,
  onMarkComplete
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-center items-center">
      <div className="flex gap-3 w-full justify-between">
        <div className="flex items-center gap-1 text-sm">
          <div className={`w-3 h-3 rounded-full ${autoSaveEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="text-xs text-gray-600">Auto-save {autoSaveEnabled ? 'activé' : 'désactivé'}</span>
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
          >
            Nouvelle action
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailActionBar;
