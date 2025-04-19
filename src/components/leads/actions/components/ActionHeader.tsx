
import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIActionSuggestions } from '@/components/leads/ai/AIActionSuggestions';
import { LeadDetailed } from '@/types/lead';

interface ActionHeaderProps {
  lead: LeadDetailed;
  onActionAdded: () => void;
  onAddAction: () => void;
  pendingActionsCount: number;
}

const ActionHeader: React.FC<ActionHeaderProps> = ({
  lead,
  onActionAdded,
  onAddAction,
  pendingActionsCount
}) => {
  return (
    <div className="sticky top-0 z-10 bg-white pb-1 w-full overflow-x-hidden">
      <div className="p-3 border-b border-gray-100 w-full">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Assistant IA
        </h3>
        <div className="w-full">
          <AIActionSuggestions lead={lead} onActionAdded={onActionAdded} />
        </div>
      </div>
      
      <div className="px-3 pt-2 w-full">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gray-50 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Actions en attente</h3>
              <p className="text-xs text-gray-400">{pendingActionsCount} actions</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddAction}
            className="h-8 px-3 text-xs font-medium border-gray-200 hover:bg-gray-50"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nouvelle
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionHeader;
