
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import ActionsPanel from '@/components/leads/actions/ActionsPanel';
import { LeadDetailed } from '@/types/lead';
import { Save, Check, Clock, X, History, ArrowLeft, CalendarClock, Lightbulb } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ActionHistory } from '@/types/actionHistory';
import { ActionSuggestion } from '@/services/noteAnalysisService';
import ActionSuggestions from '@/components/leads/actions/ActionSuggestions';

interface LeadDetailActionBarProps {
  autoSaveEnabled: boolean;
  onAddAction: () => void;
  lead: LeadDetailed;
  getActionTypeIcon: any;
  onMarkComplete: (actionId: string) => void;
  hasChanges?: boolean;
  isSaving?: boolean;
  onManualSave?: () => void;
  actionSuggestions?: ActionSuggestion[];
  onAcceptSuggestion?: (suggestion: ActionSuggestion) => void;
  onRejectSuggestion?: (suggestion: ActionSuggestion) => void;
}

const LeadDetailActionBar: React.FC<LeadDetailActionBarProps> = ({
  autoSaveEnabled,
  onAddAction,
  lead,
  getActionTypeIcon,
  onMarkComplete,
  hasChanges = false,
  isSaving = false,
  onManualSave,
  actionSuggestions = [],
  onAcceptSuggestion,
  onRejectSuggestion
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [nextAction, setNextAction] = useState<ActionHistory | null>(null);
  const [showSuggestionsBadge, setShowSuggestionsBadge] = useState<boolean>(false);
  const [futureActions, setFutureActions] = useState<ActionHistory[]>([]);

  useEffect(() => {
    if (lead?.actionHistory?.length) {
      const pendingActions = lead.actionHistory.filter(action => !action.completedDate);
      const sortedActions = pendingActions.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
      
      setNextAction(sortedActions.length > 0 ? sortedActions[0] : null);
      
      // Get future actions (excluding the next action)
      if (sortedActions.length > 1) {
        setFutureActions(sortedActions.slice(1, 3)); // Show max 2 future actions
      } else {
        setFutureActions([]);
      }
    } else {
      setNextAction(null);
      setFutureActions([]);
    }
  }, [lead?.actionHistory]);

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

  const handleActionClick = () => {
    handleActionsClick();
  };

  const handleBackToActionsList = () => {
    navigate('/actions');
  };

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');
  const isActionsTab = currentTab === 'actions';

  const formatActionDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Aujourd'hui à ${format(date, 'HH:mm', {
        locale: fr
      })}`;
    }
    return format(date, 'dd/MM/yyyy à HH:mm', {
      locale: fr
    });
  };

  const isActionOverdue = (dateString: string) => {
    return isPast(new Date(dateString)) && !isToday(new Date(dateString));
  };

  return <>
      {futureActions.length > 0 && (
        <div className="fixed bottom-32 left-0 right-0 px-3">
          <div className="bg-loro-pearl/80 rounded-md border border-loro-sand shadow-sm animate-[fade-in_0.3s_ease-out]">
            <div className="p-2 border-b border-loro-sand/30">
              <div className="flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-loro-navy/70" />
                <span className="text-xs font-medium text-loro-navy/80">Prochaines actions planifiées</span>
              </div>
            </div>
            <div className="p-2 space-y-2">
              {futureActions.map(action => (
                <div 
                  key={action.id}
                  className="flex items-center justify-between py-1 border-b border-dashed border-loro-sand/30 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-loro-sand/50">
                      {getActionTypeIcon(action.actionType as any)}
                    </div>
                    <div className="text-xs text-loro-navy">
                      <span className="block">{formatActionDate(action.scheduledDate)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs border border-loro-navy/30 text-loro-navy hover:bg-loro-pearl"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkComplete(action.id);
                    }}
                  >
                    <Check className="h-3 w-3 mr-1" /> Terminer
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {actionSuggestions && actionSuggestions.length > 0 && onAcceptSuggestion && onRejectSuggestion && !isActionsTab && (
        <div className="fixed bottom-32 left-0 right-0 px-3 z-40">
          <div className="bg-amber-50/95 border border-amber-200 rounded-md shadow-sm animate-[fade-in_0.3s_ease-out]">
            <div className="p-2 border-b border-amber-200">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-800">Actions suggérées ({actionSuggestions.length})</span>
              </div>
            </div>
            <div className="p-2">
              <ActionSuggestions 
                suggestions={actionSuggestions.slice(0, 2)} 
                onAccept={onAcceptSuggestion}
                onReject={onRejectSuggestion}
                compact={true}
              />
              {actionSuggestions.length > 2 && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs text-amber-700 p-0 h-auto ml-1 mt-1"
                  onClick={handleActionClick}
                >
                  Voir les {actionSuggestions.length - 2} autres suggestions...
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {nextAction && <div className={`fixed bottom-16 left-0 right-0 p-2 px-3 flex items-center gap-2 justify-between animate-[fade-in_0.3s_ease-out] shadow-sm z-40 
          ${isActionOverdue(nextAction.scheduledDate) ? 'bg-rose-50 text-rose-800 border-t border-rose-200' : 'bg-loro-pearl/80 text-loro-navy border-t border-loro-pearl'}`} onClick={handleActionClick}>
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-md ${isActionOverdue(nextAction.scheduledDate) ? 'bg-rose-100' : 'bg-loro-sand/50'}`}>
              <CalendarClock className={`h-4 w-4 ${isActionOverdue(nextAction.scheduledDate) ? 'text-rose-600' : 'text-loro-navy'}`} />
            </div>
            <div className="text-xs">
              <span className="font-medium text-xs">Action prévue:</span> {nextAction.actionType} 
              <span className="block opacity-80 text-small">
                {formatActionDate(nextAction.scheduledDate)}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className={`h-7 px-2 text-xs border transition-all active:scale-95
            ${isActionOverdue(nextAction.scheduledDate) ? 'border-rose-300 text-rose-700 hover:bg-rose-100' : 'border-loro-navy/30 text-loro-navy hover:bg-loro-pearl'}`} onClick={e => {
        e.stopPropagation();
        onMarkComplete(nextAction.id);
      }}>
            <Check className="h-3 w-3 mr-1" /> Terminer
          </Button>
        </div>}
      
      {showSuggestionsBadge && !isActionsTab && (
        <div className="fixed bottom-16 left-0 right-0 bg-amber-50 p-2 px-3 border-t border-amber-200 flex items-center gap-2 justify-between animate-[fade-in_0.3s_ease-out] shadow-sm z-40" onClick={handleActionClick}>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-amber-100">
              <Lightbulb className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-xs text-amber-800">
              <span className="font-medium text-xs">Actions suggérées disponibles</span>
              <span className="block opacity-80 text-small">
                Basées sur les notes du client
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs border border-amber-300 text-amber-700 hover:bg-amber-100 transition-all active:scale-95"
            onClick={handleActionClick}
          >
            Voir
          </Button>
        </div>
      )}
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 flex justify-center items-center transition-all animate-[slide-in_0.3s_ease-out] z-50">
        <div className="flex gap-3 w-full justify-between items-center">
          <div className="flex items-center">
            {isActionsTab ? <Button variant="outline" size="sm" className="h-8 px-3 transition-all duration-200 active:scale-95 font-futura border-loro-navy/30 text-loro-navy hover:bg-loro-pearl/20 flex items-center gap-1" onClick={handleBackToActionsList}>
                <ArrowLeft className="h-4 w-4" />
                Actions
              </Button> : <>
                {autoSaveEnabled ? <div className="flex items-center" title={isSaving ? "Enregistrement en cours" : hasChanges ? "Modifications en attente" : "Tout est enregistré"}>
                    {isSaving ? <div className="w-5 h-5 text-amber-500 animate-pulse">
                        <Clock className="h-5 w-5" />
                      </div> : hasChanges ? <div className="w-5 h-5 text-amber-500">
                        <Clock className="h-5 w-5" />
                      </div> : <div className="w-5 h-5 text-green-500">
                        <Check className="h-5 w-5" />
                      </div>}
                  </div> : <Button onClick={onManualSave} size="sm" variant="outline" className="h-8 px-2 text-xs transition-all duration-200 active:scale-95 font-futura" disabled={isSaving || !hasChanges}>
                    {isSaving ? <Clock className="h-4 w-4 text-amber-500 animate-pulse" /> : hasChanges ? <Save className="h-4 w-4" /> : <Check className="h-4 w-4 text-green-500" />}
                  </Button>}
              </>}
          </div>
          <div className="flex gap-2">
            {!isActionsTab && <Button variant="outline" size="sm" className="px-4 transition-all duration-200 active:scale-95 font-futura tracking-wide flex items-center gap-2 border-loro-navy/30 text-loro-navy hover:bg-loro-pearl/20" onClick={handleActionsClick}>
                <History className="h-4 w-4 text-loro-navy" />
                Actions
                {showSuggestionsBadge && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white ml-1">
                    {actionSuggestions?.length || 0}
                  </div>
                )}
              </Button>}
            <Button onClick={onAddAction} className="bg-chocolate-dark hover:bg-chocolate-light transition-all duration-200 active:scale-95 font-futura tracking-wide" size="sm" type="button" aria-label="Ajouter une nouvelle action">
              Nouvelle action
            </Button>
          </div>
        </div>
      </div>
    </>;
};

export default LeadDetailActionBar;
