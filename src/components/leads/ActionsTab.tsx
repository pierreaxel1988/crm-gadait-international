import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, RefreshCw } from 'lucide-react';
import { ActionHistory } from '@/types/actionHistory';
import { format, isPast, isValid } from 'date-fns';
import { getLead } from '@/services/leadCore';
import { toast } from '@/hooks/use-toast';
import { TaskType } from '@/components/kanban/KanbanCard';
import { useIsMobile } from '@/hooks/use-mobile';
import ActionsPanelMobile from './actions/ActionsPanelMobile';
import PropertySelectionHistory from './PropertySelectionHistory';
import { supabase } from "@/integrations/supabase/client";
import { syncExistingActionsWithLeads } from '@/services/leadActions';
import LoadingScreen from '@/components/layout/LoadingScreen';

interface ActionsTabProps {
  leadId: string;
}

const ActionsTab: React.FC<ActionsTabProps> = ({ leadId }) => {
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (leadId) {
      // Charger les actions immédiatement, puis synchroniser en arrière-plan
      fetchLeadActions();
      
      // Synchroniser en arrière-plan après un court délai
      setTimeout(() => {
        syncActionsInBackground();
      }, 500);
    }
  }, [leadId]);

  const syncActionsInBackground = async () => {
    if (!leadId) return;
    
    try {
      const success = await syncExistingActionsWithLeads(leadId);
      if (success) {
        console.log(`Actions du lead ${leadId} synchronisées avec succès`);
        // Recharger les actions après synchronisation réussie
        await fetchLeadActions();
      }
    } catch (error) {
      console.error(`Erreur lors de la synchronisation des actions pour le lead ${leadId}:`, error);
      // Ne pas afficher d'erreur pour la sync en arrière-plan
    }
  };

  const syncActions = async () => {
    if (!leadId) return;
    
    try {
      setIsSyncing(true);
      const success = await syncExistingActionsWithLeads(leadId);
      if (success) {
        console.log(`Actions du lead ${leadId} synchronisées avec succès`);
        await fetchLeadActions();
      }
    } catch (error) {
      console.error(`Erreur lors de la synchronisation des actions pour le lead ${leadId}:`, error);
      toast({
        variant: "destructive",
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les actions."
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchLeadActions = async (showToastOnError = false) => {
    try {
      setIsLoading(true);
      console.log('Fetching actions for lead ID:', leadId);
      
      const { data: lead, error } = await supabase
        .from('leads')
        .select('action_history')
        .eq('id', leadId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching lead actions:", error);
        
        // Retry automatique pour les erreurs temporaires
        if (retryCount < 1 && actionHistory.length === 0) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchLeadActions(false), 1000);
          return;
        }
        return;
      }
      
      // Reset retry count on success
      setRetryCount(0);
      
      if (lead && Array.isArray(lead.action_history)) {
        // Ensure each item in action_history conforms to ActionHistory type
        const parsedActions: ActionHistory[] = lead.action_history.map((item: any) => {
          // Validate and safeguard for any missing or invalid properties
          const validatedAction: ActionHistory = {
            id: item.id || crypto.randomUUID(),
            actionType: item.actionType || 'Note',
            createdAt: validateDateString(item.createdAt) || new Date().toISOString(),
            scheduledDate: validateDateString(item.scheduledDate) || new Date().toISOString(),
            completedDate: validateDateString(item.completedDate),
            notes: item.notes,
            leadId: item.leadId || leadId // Assurer que chaque action a un leadId
          };
          
          return validatedAction;
        });
        
        setActionHistory(parsedActions);
      } else {
        setActionHistory([]);
      }
    } catch (error) {
      console.error("Error fetching lead actions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to validate date strings
  const validateDateString = (dateStr?: string): string | undefined => {
    if (!dateStr) return undefined;
    
    try {
      const date = new Date(dateStr);
      return !isNaN(date.getTime()) ? date.toISOString() : undefined;
    } catch (err) {
      console.warn('Invalid date:', dateStr, err);
      return undefined;
    }
  };

  const handleMarkComplete = async (action: ActionHistory) => {
    if (!action.id) return;
    
    try {
      console.log('Marking action as complete for lead ID:', leadId);
      
      // Get the current lead data
      const { data: lead, error: fetchError } = await supabase
        .from('leads')
        .select('action_history')
        .eq('id', leadId)
        .maybeSingle();
      
      if (fetchError || !lead || !Array.isArray(lead.action_history)) {
        console.error('Error fetching lead for completion:', fetchError);
        return;
      }
      
      // Update the action in the action history
      const updatedActionHistory = lead.action_history.map((a: any) => {
        if (a.id === action.id) {
          return {
            ...a,
            completedDate: new Date().toISOString(),
            leadId: a.leadId || leadId // Assurer que l'action a un leadId
          };
        }
        return a;
      });
      
      // Update the lead in the database
      // Important: Set email_envoye to false to prevent automatic email triggering
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          action_history: updatedActionHistory,
          email_envoye: false // S'assurer que l'email automatique ne soit pas déclenché
        })
        .eq('id', leadId);
      
      if (updateError) {
        console.error('Error updating lead completion:', updateError);
        return;
      }
      
      // Mettre à jour l'état local immédiatement
      setActionHistory(updatedActionHistory);
      toast({
        title: "Action complétée",
        description: "L'action a été marquée comme complétée."
      });
      
      // Sync en arrière-plan sans afficher d'erreurs
      syncActionsInBackground();
    } catch (error) {
      console.error("Error marking action as complete:", error);
    }
  };

  const formatDateSafely = (dateString?: string, formatStr: string = 'dd/MM/yyyy HH:mm') => {
    if (!dateString) return 'Date non définie';
    
    try {
      const timestamp = Date.parse(dateString);
      if (isNaN(timestamp)) {
        console.warn('Invalid date encountered (NaN timestamp):', dateString);
        return 'Date invalide';
      }
      
      const dateObj = new Date(dateString);
      if (!isValid(dateObj)) {
        console.warn('Invalid date encountered (isValid):', dateString);
        return 'Date invalide';
      }
      
      return format(dateObj, formatStr);
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Date invalide';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4">
        <LoadingScreen fullscreen={false} />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={syncActions}
            className="text-xs flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Synchroniser
          </Button>
        </div>
        
        {/* Section des sélections de propriétés envoyées - Mobile */}
        <PropertySelectionHistory leadId={leadId} />
        
        <ActionsPanelMobile 
          leadId={leadId} 
          onAddAction={(updatedLead) => {
            console.log('🎯 ActionsTab received updatedLead:', updatedLead);
            if (updatedLead?.actionHistory) {
              console.log('📊 Updating actionHistory with', updatedLead.actionHistory.length, 'actions');
              setActionHistory(updatedLead.actionHistory);
            } else {
              console.error('❌ No actionHistory found in updatedLead');
            }
            syncActionsInBackground();
          }}
          onMarkComplete={handleMarkComplete} 
          actionHistory={actionHistory} 
        />
        {/* Le bouton ChatGadaitFloatingButton est maintenant géré au niveau des pages de détail */}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-normal">Actions pour le lead</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={syncActions}
          disabled={isSyncing}
          className="text-sm flex items-center gap-1"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} /> 
          {isSyncing ? 'Synchronisation...' : 'Synchroniser les actions'}
        </Button>
      </div>
      
      {/* Section des sélections de propriétés envoyées */}
      <div>
        <PropertySelectionHistory leadId={leadId} />
      </div>
      
      {/* Section des actions classiques */}
      <div>
        {actionHistory && actionHistory.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Historique des actions</h3>
            <div className="space-y-2">
              {actionHistory.map((action) => {
                const isPastAction = action.scheduledDate ? isPast(new Date(action.scheduledDate)) : false;
                const isCompleted = !!action.completedDate;
                
                return (
                  <div 
                    key={action.id} 
                    className={`p-3 rounded-md border ${
                      isCompleted 
                        ? 'bg-green-50 border-green-200' 
                        : isPastAction 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold">{action.actionType}</span>
                        {action.scheduledDate && (
                          <p className="text-sm text-gray-600">
                            Prévu pour: {formatDateSafely(action.scheduledDate)}
                          </p>
                        )}
                        {action.completedDate && (
                          <p className="text-sm text-green-600">
                            Complété le: {formatDateSafely(action.completedDate)}
                          </p>
                        )}
                        {action.notes && (
                          <p className="text-sm mt-1 p-2 bg-white rounded border border-gray-100">
                            {action.notes}
                          </p>
                        )}
                      </div>
                      {!isCompleted && (
                        <Button 
                          size="sm" 
                          onClick={() => handleMarkComplete(action)}
                          variant="outline"
                          className="ml-2"
                        >
                          Marquer comme terminé
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">Historique des actions</h3>
            <p className="text-gray-500">Aucune action disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionsTab;
