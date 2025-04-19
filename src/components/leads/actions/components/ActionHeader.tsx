
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
    <div className="sticky top-0 z-10 bg-white border-b border-loro-pearl/20 pb-2">
      <div className="p-3">
        <h3 className="text-sm font-futura text-loro-navy mb-2.5">
          Assistant IA
        </h3>
        <div className="mb-3">
          <AIActionSuggestions lead={lead} onActionAdded={onActionAdded} />
        </div>
      </div>
      
      <div className="px-3 pb-1 border-t border-loro-pearl/20 pt-2.5">
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-loro-pearl/20 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-loro-navy/60" />
            </div>
            <div>
              <h3 className="text-sm font-futura text-loro-navy">Actions en attente</h3>
              <p className="text-xs text-loro-navy/60">{pendingActionsCount} actions</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddAction}
            className="h-8 px-3 text-xs font-futura border-loro-sand hover:bg-loro-sand/10"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nouvelle
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionHeader;
