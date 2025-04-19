
import React, { useState, useEffect } from 'react';
import { ActionHistory } from '@/types/actionHistory';
import { isPast } from 'date-fns';
import { getLead } from '@/services/leadService';
import { LeadDetailed } from '@/types/lead';
import { toast } from '@/hooks/use-toast';
import { updateLead } from '@/services/leadUpdater';
import { LeadAIAssistant } from '@/components/leads/ai/LeadAIAssistant';
import { ScrollArea } from '@/components/ui/scroll-area';

import ActionHeader from './components/ActionHeader';
import ActionCard from './components/ActionCard';
import CompletedActionsSection from './components/CompletedActionsSection';

interface ActionsPanelMobileProps {
  leadId: string;
  onMarkComplete: (action: ActionHistory) => void;
  onAddAction: () => void;
  actionHistory?: ActionHistory[];
}

const ActionsPanelMobile: React.FC<ActionsPanelMobileProps> = ({
  leadId,
  onMarkComplete,
  onAddAction,
  actionHistory: initialActionHistory
}) => {
  const [lead, setLead] = useState<LeadDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>(initialActionHistory || []);

  useEffect(() => {
    if (initialActionHistory) {
      setActionHistory(initialActionHistory);
    }
    fetchLeadData();
  }, [leadId, initialActionHistory]);

  const fetchLeadData = async () => {
    if (!leadId) {
      setLoadError("ID de lead manquant");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setLoadError(null);
      console.log('Fetching lead data for ActionsPanelMobile:', leadId);
      const fetchedLead = await getLead(leadId);
      if (fetchedLead) {
        console.log('Lead data fetched successfully', fetchedLead);
        setLead(fetchedLead);
        setActionHistory(fetchedLead.actionHistory || []);
      } else {
        console.error('No lead data returned');
        setLoadError("Données du lead non disponibles");
      }
    } catch (error) {
      console.error("Error fetching lead data:", error);
      setLoadError("Erreur lors du chargement des données");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données du lead"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    if (!lead && !leadId) return;
    try {
      setActionHistory(currentActions => currentActions.filter(action => action.id !== actionId));
      const currentLead = lead || (await getLead(leadId));
      if (currentLead) {
        const updatedActionHistory = (currentLead.actionHistory || []).filter(action => action.id !== actionId);
        const updatedLead = await updateLead({
          ...currentLead,
          actionHistory: updatedActionHistory
        });
        if (updatedLead) {
          setLead(updatedLead);
          toast({
            title: "Action supprimée",
            description: "L'action a été supprimée avec succès"
          });
        }
      }
    } catch (error) {
      console.error("Error deleting action:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'action"
      });
      fetchLeadData();
    }
  };

  const sortedActions = [...(actionHistory || [])].sort((a, b) => {
    return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
  });

  const pendingActions = sortedActions.filter(action => !action.completedDate);
  const completedActions = sortedActions.filter(action => action.completedDate);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden w-full">
      {leadId && lead && (
        <ActionHeader
          lead={lead}
          onActionAdded={fetchLeadData}
          onAddAction={onAddAction}
          pendingActionsCount={pendingActions.length}
        />
      )}

      <ScrollArea className="flex-1 pb-20 w-full overflow-x-hidden">
        <div className="space-y-2 pt-2 px-3 w-full">
          {pendingActions.map(action => {
            const isOverdue = isPast(new Date(action.scheduledDate));
            const isCallAction = action.actionType === 'Call';
            
            return (
              <ActionCard
                key={action.id}
                action={action}
                onMarkComplete={onMarkComplete}
                onDelete={handleDeleteAction}
                isOverdue={isOverdue}
                isCallAction={isCallAction}
              />
            );
          })}

          <CompletedActionsSection actions={completedActions} />
        </div>
      </ScrollArea>

      {lead && (
        <div className="sticky bottom-0 border-t border-gray-100 bg-white p-3 pb-safe w-full overflow-x-hidden">
          <LeadAIAssistant lead={lead} />
        </div>
      )}
    </div>
  );
};

export default ActionsPanelMobile;
