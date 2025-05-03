
import React, { useState, useEffect } from 'react';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import { ActionHistory } from '@/types/actionHistory';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { format, isPast } from 'date-fns';
import { Check, Clock, Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionsTabProps {
  leadId: string;
}

const ActionsTab: React.FC<ActionsTabProps> = ({ leadId }) => {
  const { lead, fetchLead, handleDataChange } = useLeadDetail(leadId);
  const [isLoading, setIsLoading] = useState(false);
  const [processingActionIds, setProcessingActionIds] = useState<string[]>([]);
  
  const handleMarkComplete = async (action: ActionHistory) => {
    if (!lead) return;
    
    try {
      setProcessingActionIds(prev => [...prev, action.id]);
      
      const updatedActionHistory = lead.actionHistory?.map(a => 
        a.id === action.id 
          ? { ...a, completedDate: new Date().toISOString() } 
          : a
      ) || [];
      
      await handleDataChange({
        ...lead,
        actionHistory: updatedActionHistory,
        lastContactedAt: new Date().toISOString()
      });
      
      toast({
        title: "Action complétée",
        description: "L'action a été marquée comme terminée"
      });
    } catch (error) {
      console.error("Error marking action complete:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer l'action comme terminée"
      });
    } finally {
      setProcessingActionIds(prev => prev.filter(id => id !== action.id));
    }
  };
  
  const handleDeleteAction = async (actionId: string) => {
    if (!lead) return;
    
    try {
      setProcessingActionIds(prev => [...prev, actionId]);
      
      const updatedActionHistory = lead.actionHistory?.filter(action => 
        action.id !== actionId
      ) || [];
      
      await handleDataChange({
        ...lead,
        actionHistory: updatedActionHistory
      });
      
      toast({
        title: "Action supprimée",
        description: "L'action a été supprimée avec succès"
      });
    } catch (error) {
      console.error("Error deleting action:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'action"
      });
    } finally {
      setProcessingActionIds(prev => prev.filter(id => id !== actionId));
    }
  };
  
  const getActionTypeLabel = (actionType: string): string => {
    switch (actionType) {
      case 'Call': return 'Appel';
      case 'Visites': return 'Visite';
      case 'Compromis': return 'Compromis';
      case 'Acte de vente': return 'Acte de vente';
      case 'Contrat de Location': return 'Contrat Location';
      case 'Propositions': return 'Proposition';
      case 'Follow up': return 'Follow-up';
      case 'Estimation': return 'Estimation';
      case 'Prospection': return 'Prospection';
      default: return actionType;
    }
  };
  
  const isActionOverdue = (scheduledDate: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(scheduledDate);
    date.setHours(0, 0, 0, 0);
    return isPast(date);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-chocolate-dark rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  const pendingActions = lead?.actionHistory?.filter(action => !action.completedDate) || [];
  const completedActions = lead?.actionHistory?.filter(action => action.completedDate) || [];
  
  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Actions en attente</h2>
      
      {pendingActions.length === 0 ? (
        <p className="text-gray-500 italic">Aucune action en attente</p>
      ) : (
        <div className="space-y-3 mb-6">
          {pendingActions.map((action) => {
            const isOverdue = isActionOverdue(action.scheduledDate);
            const isProcessing = processingActionIds.includes(action.id);
            
            return (
              <div 
                key={action.id} 
                className={cn(
                  "border rounded-lg p-3 transition-all duration-200",
                  isOverdue ? "bg-red-50" : "bg-gray-50"
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-sm font-medium",
                        isOverdue ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      )}>
                        {getActionTypeLabel(action.actionType)}
                      </span>
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{format(new Date(action.scheduledDate), 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                    </div>
                    {action.notes && (
                      <p className="mt-2 text-sm text-gray-700">{action.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleMarkComplete(action)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Terminer
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleDeleteAction(action.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <h2 className="text-xl font-bold mb-4">Historique des actions</h2>
      
      {completedActions.length === 0 ? (
        <p className="text-gray-500 italic">Aucune action complétée</p>
      ) : (
        <div className="space-y-3">
          {completedActions.map((action) => {
            const isProcessing = processingActionIds.includes(action.id);
            
            return (
              <div 
                key={action.id} 
                className="border rounded-lg p-3 bg-gray-50 opacity-75"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-sm font-medium">
                        {getActionTypeLabel(action.actionType)}
                      </span>
                      <div className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        <span>
                          {action.completedDate && format(new Date(action.completedDate), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                    {action.notes && (
                      <p className="mt-2 text-sm text-gray-700">{action.notes}</p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteAction(action.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActionsTab;
