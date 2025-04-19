
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
    <div className="sticky top-0 z-10 bg-white pb-1">
      <div className="p-2.5 border-b border-gray-100">
        <h3 className="text-xs font-medium text-gray-700 mb-1.5">
          Assistant IA
        </h3>
        <div className="mb-1.5">
          <AIActionSuggestions lead={lead} onActionAdded={onActionAdded} />
        </div>
      </div>
      
      <div className="px-2.5 pt-1.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full bg-gray-50 flex items-center justify-center">
              <MessageSquare className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-700">Actions en attente</h3>
              <p className="text-[10px] text-gray-400">{pendingActionsCount} actions</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddAction}
            className="h-7 px-2.5 text-xs font-medium border-gray-200 hover:bg-gray-50"
          >
            <Plus className="h-3 w-3 mr-1" />
            Nouvelle
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionHeader;
