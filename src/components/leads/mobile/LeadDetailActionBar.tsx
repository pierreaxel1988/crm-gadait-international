
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { History, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LeadDetailed } from '@/types/lead';
import { ActionSuggestion } from '@/services/noteAnalysisService';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();
  
  // Get the layout configuration based on viewport
  const getLayoutConfig = () => {
    if (isMobile) {
      return {
        containerClass: "p-3",
        buttonClass: "px-4 text-sm h-9",
        iconSize: "h-4 w-4",
        textSize: "text-xs",
        actionButtonSize: "h-6 px-1.5",
        badgeSize: "h-4 w-4 text-[10px]"
      };
    } else {
      return {
        containerClass: "px-[100px] py-4",
        buttonClass: "px-6 text-base h-10",
        iconSize: "h-5 w-5",
        textSize: "text-sm",
        actionButtonSize: "h-8 px-3",
        badgeSize: "h-5 w-5 text-xs"
      };
    }
  };

  const layoutConfig = getLayoutConfig();
  
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
      
      if (pending > 0 && !notificationShown) {
        toast({
          title: "Actions en attente",
          description: `Vous avez ${pending} action${pending > 1 ? 's' : ''} à réaliser`,
        });
        setNotificationShown(true);
      }
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

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex justify-center items-center transition-all animate-[slide-in_0.3s_ease-out] z-50",
      layoutConfig.containerClass
    )}>
      <div className="flex gap-3 w-full justify-between items-center">
        <div className="flex items-center gap-2">
          {!isActionsTab && (
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"} 
              className={cn(
                "transition-all duration-200 active:scale-95 font-futura tracking-wide flex items-center gap-2 border-loro-navy/30 text-loro-navy hover:bg-loro-pearl/20", 
                layoutConfig.buttonClass
              )} 
              onClick={handleActionsClick}
            >
              <History className={cn(layoutConfig.iconSize, "text-loro-navy")} />
              Actions
              {(showSuggestionsBadge || pendingActionsCount > 0) && (
                <div className={cn(
                  "flex items-center justify-center rounded-full bg-[#FFDEE2] text-loro-terracotta ml-1",
                  layoutConfig.badgeSize
                )}>
                  {pendingActionsCount + (actionSuggestions?.length || 0)}
                </div>
              )}
              {pendingActionsCount > 0 && (
                <Bell className={cn(isMobile ? "h-3 w-3" : "h-4 w-4", "text-loro-terracotta ml-1 animate-bounce")} />
              )}
            </Button>
          )}
          {isActionsTab && (
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className={cn(
                "transition-all duration-200 active:scale-95 font-futura tracking-wide border-loro-navy/30 text-loro-navy hover:bg-loro-pearl/20",
                layoutConfig.buttonClass
              )}
              onClick={handleNavigateToActions}
            >
              Toutes les actions
            </Button>
          )}
        </div>
        <Button 
          onClick={onAddAction} 
          className={cn(
            "bg-chocolate-dark hover:bg-chocolate-light transition-all duration-200 active:scale-95 font-futura tracking-wide",
            isMobile ? "text-sm" : "text-base"
          )} 
          size={isMobile ? "sm" : "default"} 
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
