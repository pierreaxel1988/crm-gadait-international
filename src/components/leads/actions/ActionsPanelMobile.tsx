import React, { useState, useEffect, useCallback } from 'react';
import { ActionHistory } from '@/types/actionHistory';
import { LeadDetailed } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Clock, CheckCircle, Trash2, Phone, MessageSquare, MapPin, FileText, Users, Handshake, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { updateLead } from '@/services/leadService';
import { mapToLeadDetailed } from '@/services/utils/leadMappers';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ActionEditCard from './ActionEditCard';

interface ActionsPanelMobileProps {
  leadId: string;
  onAddAction: (updatedLead?: any) => void;
  onMarkComplete: (action: ActionHistory) => void;
  actionHistory: ActionHistory[];
}

const ActionsPanelMobile: React.FC<ActionsPanelMobileProps> = ({
  leadId,
  onAddAction,
  onMarkComplete,
  actionHistory = []
}) => {
  const [lead, setLead] = useState<LeadDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<ActionHistory | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const fetchLead = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;

      // Convert database row to LeadDetailed format using mapToLeadDetailed
      const convertedLead = mapToLeadDetailed(data);
      setLead(convertedLead);
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'Call':
        return <Phone className="h-4 w-4" />;
      case 'Email':
        return <MessageSquare className="h-4 w-4" />;
      case 'Visit':
      case 'Visites':
        return <MapPin className="h-4 w-4" />;
      case 'Follow up':
        return <Clock className="h-4 w-4" />;
      case 'Proposal':
      case 'Propositions':
        return <FileText className="h-4 w-4" />;
      case 'Meeting':
        return <Users className="h-4 w-4" />;
      case 'Compromis':
        return <Handshake className="h-4 w-4" />;
      case 'Creation':
        return <Plus className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const handleActionClick = (action: ActionHistory) => {
    setSelectedAction(action);
    setIsEditSheetOpen(true);
  };

  const handleActionUpdate = (updatedLead: LeadDetailed) => {
    setLead(updatedLead);
    // Notifier le parent avec les données mises à jour
    onAddAction(updatedLead);
  };

  const handleMarkComplete = async (action: ActionHistory) => {
    if (!lead) return;

    try {
      const updatedActionHistory = lead.actionHistory?.map(a => 
        a.id === action.id ? {
          ...a,
          completedDate: new Date().toISOString()
        } : a
      ) || [];

      const updatedLead = await updateLead({
        ...lead,
        actionHistory: updatedActionHistory,
        lastContactedAt: new Date().toISOString()
      });

      if (updatedLead) {
        setLead(updatedLead);
        onMarkComplete(action);
      }
    } catch (error) {
      console.error("Error marking action complete:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer l'action comme terminée"
      });
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    if (!lead) return;

    try {
      const updatedActionHistory = lead.actionHistory?.filter(action => action.id !== actionId) || [];
      const updatedLead = await updateLead({
        ...lead,
        actionHistory: updatedActionHistory
      });

      if (updatedLead) {
        setLead(updatedLead);
        toast({
          title: "Action supprimée",
          description: "L'action a été supprimée avec succès"
        });
      }
    } catch (error) {
      console.error("Error deleting action:", error);
    }
  };

  // Use actions from the local lead data to ensure consistency
  const currentActions = lead?.actionHistory || actionHistory;
  
  // Sort actions chronologically - most recent first
  const pendingActions = currentActions
    .filter(action => !action.completedDate)
    .sort((a, b) => {
      const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA; // Most recent first
    });
    
  const completedActions = currentActions
    .filter(action => action.completedDate)
    .sort((a, b) => {
      const dateA = new Date(a.completedDate!).getTime();
      const dateB = new Date(b.completedDate!).getTime();
      return dateB - dateA; // Most recent first
    });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chocolate-dark"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-[20px]">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">
          Actions
        </h3>
      </div>

      {pendingActions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-chocolate-dark flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Actions en attente ({pendingActions.length})
          </h4>
          {pendingActions.map(action => (
            <div 
              key={action.id} 
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => handleActionClick(action)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {getActionTypeIcon(action.actionType)}
                    <span className="ml-2 font-medium text-chocolate-dark">
                      {action.actionType}
                    </span>
                    {action.scheduledDate && (
                      <span className="ml-2 text-sm text-gray-600">
                        {format(new Date(action.scheduledDate), 'dd/MM/yyyy à HH:mm', {
                          locale: fr
                        })}
                      </span>
                    )}
                  </div>
                  {action.notes && (
                    <p className="text-sm text-gray-700 mb-2">{action.notes}</p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkComplete(action);
                    }} 
                    size="sm" 
                    variant="outline" 
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAction(action.id);
                    }} 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {completedActions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-chocolate-dark flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Actions terminées ({completedActions.length})
          </h4>
          {completedActions.map(action => (
            <div 
              key={action.id} 
              className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => handleActionClick(action)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {getActionTypeIcon(action.actionType)}
                    <span className="ml-2 font-medium text-chocolate-dark">
                      {action.actionType}
                    </span>
                    {action.completedDate && (
                      <span className="ml-2 text-sm text-gray-600">
                        Terminé le {format(new Date(action.completedDate), 'dd/MM/yyyy à HH:mm', {
                          locale: fr
                        })}
                      </span>
                    )}
                  </div>
                  {action.notes && (
                    <p className="text-sm text-gray-700">{action.notes}</p>
                  )}
                </div>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAction(action.id);
                  }} 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentActions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Aucune action</p>
          <p className="text-sm">Ajoutez votre première action pour ce lead</p>
        </div>
      )}

      {lead && (
      <ActionEditCard
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        action={selectedAction}
        lead={lead}
        onUpdate={handleActionUpdate}
        getActionTypeIcon={getActionTypeIcon}
      />
      )}
    </div>
  );
};

export default ActionsPanelMobile;
