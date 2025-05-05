
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, RefreshCw, Clock, CheckCheck, History, Loader2, ArrowRight } from 'lucide-react';
import { ActionHistory } from '@/types/actionHistory';
import { format, isPast, isValid, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';
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
import { motion, AnimatePresence } from 'framer-motion';

interface ActionsTabProps {
  leadId: string;
}

const ActionsTab: React.FC<ActionsTabProps> = ({ leadId }) => {
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
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
      
      return format(dateObj, formatStr, { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Date invalide';
    }
  };

  const getRelativeDate = (dateString?: string) => {
    if (!dateString) return 'Date non définie';
    
    try {
      const date = parseISO(dateString);
      
      if (isToday(date)) {
        return `Aujourd'hui à ${format(date, 'HH:mm')}`;
      } else if (isYesterday(date)) {
        return `Hier à ${format(date, 'HH:mm')}`;
      } else {
        const daysDiff = Math.abs(differenceInDays(date, new Date()));
        if (daysDiff < 7) {
          return format(date, 'EEEE dd MMM à HH:mm', { locale: fr });
        } else {
          return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
        }
      }
    } catch (error) {
      console.error('Error formatting relative date:', error, dateString);
      return 'Date invalide';
    }
  };

  if (isLoading || isSyncing) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-lg flex flex-col justify-center items-center h-80">
        <Loader2 className="h-10 w-10 animate-spin text-loro-terracotta opacity-70 mb-4" />
        <div className="text-loro-navy/80 font-futura tracking-wide text-sm">
          {isSyncing ? 'Synchronisation en cours...' : 'Chargement des actions...'}
        </div>
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

  // New award-winning design with microinteractions
  return (
    <div className="relative space-y-8 bg-gradient-to-b from-white to-loro-pearl/10 backdrop-blur-sm rounded-xl shadow-sm border border-loro-pearl/20 p-8 animate-[fade-in_0.5s_ease-out]">
      {/* Floating pattern for visual appeal */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-loro-terracotta/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-loro-navy/5 rounded-full blur-2xl"></div>
      </div>

      {/* Header with sync button */}
      <div className="relative flex justify-between items-center">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-futura text-loro-navy tracking-tight"
        >
          Suivi des actions
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={syncActions}
            className="text-loro-navy/70 hover:text-loro-navy font-futura flex items-center gap-1.5 transition-all duration-300 group"
          >
            <RefreshCw className="h-4 w-4 transition-transform duration-500 ease-in-out group-hover:rotate-180" /> 
            <span className="tracking-wide">Synchroniser</span>
          </Button>
        </motion.div>
      </div>
      
      {/* Pending Actions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg bg-white rounded-xl transition-all duration-300 hover:shadow-xl">
          <div className="bg-gradient-to-r from-loro-terracotta/90 to-loro-terracotta p-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm transform transition-transform duration-300 hover:scale-105">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-white font-futura tracking-wide text-xl">Actions en attente</h3>
            </div>
          </div>
          
          <div className="p-6">
            {pendingActions.length === 0 ? (
              <div className="text-center p-10 bg-loro-pearl/5 rounded-lg transition-all duration-300">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-loro-pearl/10 flex items-center justify-center mb-4">
                    <Calendar className="h-7 w-7 text-loro-navy/40" />
                  </div>
                  <p className="text-loro-navy/60 font-futura text-lg mb-2">Aucune action en attente</p>
                  <p className="text-loro-navy/40 font-futuraLight text-sm mb-6">
                    Toutes les actions ont été complétées
                  </p>
                  <Button 
                    onClick={() => {}} 
                    className="mt-2 bg-loro-terracotta hover:bg-loro-terracotta/90 font-futura flex items-center gap-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Plus className="h-4 w-4" /> 
                    <span className="tracking-wide">Créer une action</span>
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {pendingActions.map((action, index) => {
                    const isPastAction = action.scheduledDate ? isPast(new Date(action.scheduledDate)) : false;
                    
                    return (
                      <motion.div 
                        key={action.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ 
                          duration: 0.4,
                          delay: index * 0.1,
                          ease: [0.19, 1.0, 0.22, 1.0]
                        }}
                      >
                        <div 
                          className={cn(
                            "p-5 rounded-lg border transition-all duration-300 hover:shadow-md group cursor-pointer",
                            isPastAction 
                              ? "bg-red-50/80 border-red-200/70 hover:border-red-300" 
                              : "bg-blue-50/40 border-blue-200/70 hover:border-blue-300",
                            activeAction === action.id && "ring-2 ring-loro-terracotta/40 shadow-md"
                          )}
                          onClick={() => setActiveAction(activeAction === action.id ? null : action.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-sm border font-medium inline-flex items-center gap-1.5 shadow-sm",
                                  getActionTypeBadgeStyle(action.actionType)
                                )}>
                                  {action.actionType}
                                </span>
                                
                                {isPastAction && (
                                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs border border-red-200 shadow-sm animate-[pulse_3s_ease-in-out_infinite]">
                                    En retard
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-loro-navy/70" />
                                <span className="text-loro-navy font-futuraLight">
                                  {getRelativeDate(action.scheduledDate)}
                                </span>
                              </div>
                              
                              <AnimatePresence>
                                {(activeAction === action.id || action.notes) && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {action.notes && (
                                      <p className="text-sm mt-1 p-4 bg-white rounded-lg border border-loro-pearl/30 text-loro-navy/80 shadow-sm">
                                        {action.notes}
                                      </p>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkComplete(action);
                              }}
                              variant="outline"
                              className="ml-2 opacity-80 group-hover:opacity-100 transition-opacity border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 rounded-full font-futura tracking-wide"
                            >
                              <CheckCheck className="h-4 w-4 mr-1.5" />
                              Terminer
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
      
      {/* Completed Actions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg bg-white rounded-xl transition-all duration-300 hover:shadow-xl">
          <div className="bg-gradient-to-r from-loro-navy/90 to-loro-navy p-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm transform transition-transform duration-300 hover:scale-105">
                <History className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-white font-futura tracking-wide text-xl">Historique des actions</h3>
            </div>
          </div>
          
          <div className="max-h-[500px] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-loro-pearl/60 scrollbar-track-transparent hover:scrollbar-thumb-loro-terracotta/40 transition-colors duration-300">
            {completedActions.length === 0 ? (
              <div className="text-center p-8 bg-loro-pearl/5 rounded-lg">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-full bg-loro-pearl/10 flex items-center justify-center mb-3">
                    <History className="h-6 w-6 text-loro-navy/40" />
                  </div>
                  <p className="text-loro-navy/60 font-futura">Aucune action complétée dans l'historique</p>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-1 pt-2 pl-3">
                {completedActions.map((action, index) => (
                  <motion.div 
                    key={action.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: [0.19, 1.0, 0.22, 1.0]
                    }}
                    className={cn(
                      "relative p-4 border-l-2 border-green-400 ml-3 animate-[fade-in_0.4s_ease-out] group cursor-pointer",
                      index !== completedActions.length - 1 && "pb-6",
                      activeAction === `completed-${action.id}` && "bg-loro-pearl/5 rounded-r-lg"
                    )}
                    onClick={() => setActiveAction(activeAction === `completed-${action.id}` ? null : `completed-${action.id}`)}
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-[9px] top-5 h-4 w-4 rounded-full bg-green-400 ring-4 ring-white transform transition-transform duration-300 group-hover:scale-110"></div>
                    
                    {/* Timeline vertical line continuing to next item */}
                    {index !== completedActions.length - 1 && (
                      <div className="absolute left-[-2px] top-9 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    
                    <div className="pl-2">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-sm border font-medium inline-flex items-center gap-1.5 shadow-sm",
                          getActionTypeBadgeStyle(action.actionType)
                        )}>
                          {action.actionType}
                        </span>
                        
                        <span className="text-green-700 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full text-xs border border-green-200 shadow-sm">
                          <CheckCheck className="h-3 w-3" /> Terminé
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-sm text-loro-navy/70 mb-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="font-futuraLight">
                          Complétée le {getRelativeDate(action.completedDate)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-sm text-loro-navy/70">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-futuraLight">
                          Prévue pour {getRelativeDate(action.scheduledDate)}
                        </span>
                      </div>
                      
                      <AnimatePresence>
                        {(activeAction === `completed-${action.id}` && action.notes) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {action.notes && (
                              <p className="text-sm mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-600 shadow-sm">
                                {action.notes}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
      
      {/* Add new action button */}
      <motion.div 
        className="flex justify-end pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Button 
          onClick={() => {}} 
          className="bg-loro-terracotta hover:bg-loro-terracotta/90 shadow-lg hover:shadow-xl transition-all duration-300 font-futura flex items-center gap-2 rounded-full group transform hover:-translate-y-1"
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" /> 
          <span className="tracking-wide">Nouvelle action</span>
          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-300" />
        </Button>
      </motion.div>
    </div>
  );
};

export default ActionsTab;
