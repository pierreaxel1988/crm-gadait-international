
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LeadDetailed } from '@/types/lead';
import { ActionSuggestion } from '@/services/noteAnalysisService';

interface LeadDetailActionBarProps {
  autoSaveEnabled: boolean;
  onAddAction: () => void;
  lead: LeadDetailed;
  hasChanges?: boolean;
  isSaving?: boolean;
  onManualSave?: () => void;
  actionSuggestions?: ActionSuggestion[];
}

const LeadDetailActionBar: React.FC<LeadDetailActionBarProps> = ({
  autoSaveEnabled,
  onAddAction,
  lead,
  hasChanges = false,
  isSaving = false,
  onManualSave,
  actionSuggestions = []
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuggestionsBadge, setShowSuggestionsBadge] = useState<boolean>(false);

  useEffect(() => {
    setShowSuggestionsBadge(actionSuggestions && actionSuggestions.length > 0);
  }, [actionSuggestions]);

  const handleActionsClick = () => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', 'actions');
    navigate(`/leads/${lead.id}?${searchParams.toString()}`, {
      replace: true
    });
  };

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');
  const isActionsTab = currentTab === 'actions';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 flex justify-center items-center transition-all animate-[slide-in_0.3s_ease-out] z-50">
      <div className="flex gap-3 w-full justify-between items-center">
        <div className="flex items-center">
          {!isActionsTab && (
            <Button 
              variant="outline" 
              size="sm" 
              className="px-4 transition-all duration-200 active:scale-95 font-futura tracking-wide flex items-center gap-2 border-loro-navy/30 text-loro-navy hover:bg-loro-pearl/20" 
              onClick={handleActionsClick}
            >
              <History className="h-4 w-4 text-loro-navy" />
              Actions
              {showSuggestionsBadge && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white ml-1">
                  {actionSuggestions?.length || 0}
                </div>
              )}
            </Button>
          )}
        </div>
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
  );
};

export default LeadDetailActionBar;
