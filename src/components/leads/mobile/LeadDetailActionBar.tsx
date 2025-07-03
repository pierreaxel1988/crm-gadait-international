import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { History, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LeadDetailed } from '@/types/lead';
import { ActionSuggestion } from '@/services/noteAnalysisService';
import { toast } from '@/hooks/use-toast';
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
  const [pendingActionsCount, setPendingActionsCount] = useState<number>(0);
  const [notificationShown, setNotificationShown] = useState<boolean>(false);
  useEffect(() => {
    if (lead?.actionHistory) {
      const now = new Date();
      const pending = lead.actionHistory.filter(action => {
        if (action.completedDate) return false;
        if (!action.scheduledDate) return false;
        const scheduledDate = new Date(action.scheduledDate);
        return scheduledDate >= now || scheduledDate < now;
      }).length;
      setPendingActionsCount(pending);
      // Notification supprimée - plus besoin d'alerter sur les actions en attente
    }
  }, [lead?.actionHistory, notificationShown]);
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
  const handleNavigateToActions = () => {
    navigate('/actions');
  };
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');
  const isActionsTab = currentTab === 'actions';
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 flex justify-center items-center transition-all animate-[slide-in_0.3s_ease-out] z-50">
      <div className="flex gap-3 w-full justify-between items-center">
        <div className="flex items-center gap-2">
          {!isActionsTab && <Button variant="outline" size="sm" onClick={handleActionsClick} className="px-4 transition-all duration-200 active:scale-95 font-futura tracking-wide flex items-center gap-2 border-loro-navy/30 text-loro-navy bg-loro-white">
              <History className="h-4 w-4 text-loro-navy" />
              Actions
              {(showSuggestionsBadge || pendingActionsCount > 0) && <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FFDEE2] text-loro-terracotta text-[10px] ml-1">
                  {pendingActionsCount + (actionSuggestions?.length || 0)}
                </div>}
              {pendingActionsCount > 0 && <Bell className="h-3 w-3 text-loro-terracotta ml-1 animate-bounce" />}
            </Button>}
          {isActionsTab && <Button variant="outline" size="sm" className="px-4 transition-all duration-200 active:scale-95 font-futura tracking-wide border-loro-navy/30 text-loro-navy hover:bg-loro-pearl/20" onClick={handleNavigateToActions}>
              Toutes les actions
            </Button>}
        </div>
        <Button onClick={onAddAction} size="sm" type="button" aria-label="Ajouter une nouvelle action" className="transition-all duration-200 active:scale-95 font-futura tracking-wide rounded-sm border border-loro-terracotta/50 bg-[#0A2540] text-white">
          Nouvelle action
        </Button>
      </div>
    </div>;
};
export default LeadDetailActionBar;