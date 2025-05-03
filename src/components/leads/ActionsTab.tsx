
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { ActionHistory } from '@/types/actionHistory';
import { format, isPast } from 'date-fns';
import { getLead } from '@/services/leadCore';
import { toast } from '@/hooks/use-toast';
import { TaskType } from '@/components/kanban/KanbanCard';
import { useIsMobile } from '@/hooks/use-mobile';
import ActionsPanelMobile from './actions/ActionsPanelMobile';
import { supabase } from "@/integrations/supabase/client";

interface ActionsTabProps {
  leadId: string;
}

const ActionsTab: React.FC<ActionsTabProps> = ({ leadId }) => {
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (leadId) {
      fetchLeadActions();
    }
  }, [leadId]);

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
        const parsedActions: ActionHistory[] = lead.action_history.map((item: any) => ({
          id: item.id || crypto.randomUUID(),
          actionType: item.actionType || 'Note',
          createdAt: item.createdAt || new Date().toISOString(),
          scheduledDate: item.scheduledDate || new Date().toISOString(),
          completedDate: item.completedDate,
          notes: item.notes
        }));
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
            completedDate: new Date().toISOString()
          };
        }
        return a;
      });
      
      // Update the lead in the database
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 flex justify-center items-center h-40">
        <div className="animate-spin h-6 w-6 border-3 border-chocolate-dark rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <ActionsPanelMobile 
        leadId={leadId} 
        onAddAction={fetchLeadActions} 
        onMarkComplete={handleMarkComplete} 
        actionHistory={actionHistory} 
      />
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Actions pour le lead</h2>
      
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
                          Prévu pour: {format(new Date(action.scheduledDate), 'dd/MM/yyyy HH:mm')}
                        </p>
                      )}
                      {action.completedDate && (
                        <p className="text-sm text-green-600">
                          Complété le: {format(new Date(action.completedDate), 'dd/MM/yyyy HH:mm')}
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
        <p className="text-gray-500">Aucune action disponible pour le moment.</p>
      )}
    </div>
  );
};

export default ActionsTab;
