
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, RefreshCw, Clock, CheckCheck, History } from 'lucide-react';
import { ActionHistory } from '@/types/actionHistory';
import { format, isPast, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { TaskType } from '@/components/kanban/KanbanCard';
import { useIsMobile } from '@/hooks/use-mobile';
import ActionsPanelMobile from './actions/ActionsPanelMobile';
import { supabase } from "@/integrations/supabase/client";
import { syncExistingActionsWithLeads } from '@/services/leadActions';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ActionsTabProps {
  leadId: string;
}

const ActionsTab: React.FC<ActionsTabProps> = ({ leadId }) => {
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (leadId) {
      // Synchroniser les actions avant de les charger
      syncActions().then(() => {
        fetchLeadActions();
      });
    }
  }, [leadId]);

  const syncActions = async () => {
    if (!leadId) return;
    
    try {
      setIsSyncing(true);
      const success = await syncExistingActionsWithLeads(leadId);
      if (success) {
        console.log(`Actions du lead ${leadId} synchronisées avec succès`);
      }
    } catch (error) {
      console.error(`Erreur lors de la synchronisation des actions pour le lead ${leadId}:`, error);
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchLeadActions = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching actions for lead ID:', leadId);
      
      const { data: lead, error } = await supabase
        .from('leads')
        .select('action_history')
        .eq('id', leadId)
        .single();
      
      if (error) {
        console.error("Error fetching lead actions:", error);
        throw error;
      }
      
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
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les actions du lead."
      });
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
        .single();
      
      if (fetchError || !lead || !Array.isArray(lead.action_history)) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Lead introuvable ou historique d'actions inexistant."
        });
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
        throw updateError;
      }
      
      // Refresh the actions list
      await fetchLeadActions();
      
      toast({
        title: "Action complétée",
        description: "L'action a été marquée comme complétée."
      });
    } catch (error) {
      console.error("Error marking action as complete:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer l'action comme complétée."
      });
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

  if (isLoading || isSyncing) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 flex justify-center items-center h-40">
        <div className="animate-spin h-6 w-6 border-3 border-chocolate-dark rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <>
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
        <ActionsPanelMobile 
          leadId={leadId} 
          onAddAction={fetchLeadActions} 
          onMarkComplete={handleMarkComplete} 
          actionHistory={actionHistory} 
        />
        {/* Le bouton ChatGadaitFloatingButton est maintenant géré au niveau des pages de détail */}
      </>
    );
  }

  const pendingActions = actionHistory?.filter(action => !action.completedDate) || [];
  const completedActions = actionHistory?.filter(action => action.completedDate) || [];

  // Function to get the appropriate style for action type badge
  const getActionTypeBadgeStyle = (actionType: string) => {
    switch(actionType) {
      case 'Call': 
        return 'bg-[#FFF0F5] text-[#D05A76] border-pink-200';
      case 'Visites': 
        return 'bg-[#F3F0FF] text-purple-700 border-purple-200';
      case 'Follow up': 
        return 'bg-[#FFF4E6] text-amber-700 border-amber-200';
      case 'Compromis': 
        return 'bg-[#FFFAEB] text-amber-800 border-amber-200';
      case 'Acte de vente': 
        return 'bg-[#FEF2F2] text-red-700 border-red-200';
      case 'Estimation': 
        return 'bg-[#F0FFF4] text-emerald-700 border-emerald-200';
      case 'Propositions': 
        return 'bg-[#F0F7FF] text-blue-700 border-blue-200';
      default: 
        return 'bg-[#F6F6F7] text-gray-700 border-gray-200';
    }
  };

  // Updated design with our modern UI
  return (
    <div className="space-y-8 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-loro-pearl/20 p-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header with sync button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-futura text-loro-navy tracking-tight">Actions</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={syncActions}
          className="text-loro-navy/70 hover:text-loro-navy font-futura flex items-center gap-1.5"
        >
          <RefreshCw className="h-4 w-4" /> 
          <span className="tracking-wide">Synchroniser</span>
        </Button>
      </div>
      
      {/* Pending Actions Section */}
      <Card className="overflow-hidden border-0 shadow-md bg-white rounded-xl transition-all duration-300 hover:shadow-lg">
        <div className="bg-gradient-to-r from-loro-terracotta/90 to-loro-terracotta p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-white font-futura tracking-wide text-lg">Actions en attente</h3>
          </div>
        </div>
        
        <div className="p-5">
          {pendingActions.length === 0 ? (
            <div className="text-center p-8 bg-loro-pearl/5 rounded-lg">
              <p className="text-loro-navy/60 font-futuraLight">Aucune action en attente</p>
              <Button 
                onClick={() => {}} 
                className="mt-4 bg-loro-terracotta hover:bg-loro-terracotta/90 font-futura flex items-center gap-2 rounded-full"
              >
                <Plus className="h-4 w-4" /> 
                <span className="tracking-wide">Créer une action</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingActions.map((action) => {
                const isPastAction = action.scheduledDate ? isPast(new Date(action.scheduledDate)) : false;
                
                return (
                  <div 
                    key={action.id} 
                    className={cn(
                      "p-4 rounded-lg border transition-all duration-300 hover:shadow-md group",
                      isPastAction 
                        ? "bg-red-50/80 border-red-200" 
                        : "bg-blue-50/40 border-blue-200"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-sm border font-medium inline-flex items-center gap-1.5",
                            getActionTypeBadgeStyle(action.actionType)
                          )}>
                            {action.actionType}
                          </span>
                          
                          {isPastAction && (
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs border border-red-200">
                              En retard
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-loro-navy/70" />
                          <span className="text-loro-navy font-futuraLight">
                            {formatDateSafely(action.scheduledDate, 'dd MMM yyyy à HH:mm')}
                          </span>
                        </div>
                        
                        {action.notes && (
                          <p className="text-sm mt-1 p-3 bg-white rounded-lg border border-loro-pearl/30 text-loro-navy/80">
                            {action.notes}
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkComplete(action)}
                        variant="outline"
                        className="ml-2 opacity-80 group-hover:opacity-100 transition-opacity border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 rounded-full font-futura tracking-wide"
                      >
                        <CheckCheck className="h-4 w-4 mr-1.5" />
                        Terminer
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
      
      {/* Completed Actions Section */}
      <Card className="overflow-hidden border-0 shadow-md bg-white rounded-xl transition-all duration-300 hover:shadow-lg">
        <div className="bg-gradient-to-r from-loro-navy/90 to-loro-navy p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <History className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-white font-futura tracking-wide text-lg">Historique des actions</h3>
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto p-5 scrollbar-none">
          {completedActions.length === 0 ? (
            <div className="text-center p-8 bg-loro-pearl/5 rounded-lg">
              <p className="text-loro-navy/60 font-futuraLight">Aucune action complétée dans l'historique</p>
            </div>
          ) : (
            <div className="space-y-1">
              {completedActions.map((action, index) => (
                <div 
                  key={action.id}
                  className={cn(
                    "relative p-4 border-l-2 border-green-400 ml-3 animate-[fade-in_0.4s_ease-out]",
                    index !== completedActions.length - 1 && "pb-6"
                  )}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[9px] top-5 h-4 w-4 rounded-full bg-green-400 ring-4 ring-white"></div>
                  
                  {/* Timeline vertical line continuing to next item */}
                  {index !== completedActions.length - 1 && (
                    <div className="absolute left-[-2px] top-9 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                  
                  <div className="pl-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm border font-medium inline-flex items-center gap-1.5",
                        getActionTypeBadgeStyle(action.actionType)
                      )}>
                        {action.actionType}
                      </span>
                      
                      <span className="text-green-700 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full text-xs border border-green-200">
                        <CheckCheck className="h-3 w-3" /> Terminé
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm text-loro-navy/70 mb-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="font-futuraLight">
                        Complétée le {formatDateSafely(action.completedDate, 'dd MMM yyyy à HH:mm')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm text-loro-navy/70">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-futuraLight">
                        Prévue pour {formatDateSafely(action.scheduledDate, 'dd MMM yyyy à HH:mm')}
                      </span>
                    </div>
                    
                    {action.notes && (
                      <p className="text-sm mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-600">
                        {action.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
      
      {/* Add new action button */}
      <div className="flex justify-end pt-2">
        <Button 
          onClick={() => {}} 
          className="bg-loro-terracotta hover:bg-loro-terracotta/90 shadow-lg hover:shadow-xl transition-all duration-300 font-futura flex items-center gap-2 rounded-full"
        >
          <Plus className="h-4 w-4" /> 
          <span className="tracking-wide">Nouvelle action</span>
        </Button>
      </div>
    </div>
  );
};

export default ActionsTab;
