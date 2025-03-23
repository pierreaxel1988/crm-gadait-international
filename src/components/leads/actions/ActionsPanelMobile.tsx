
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ActionHistory } from '@/types/actionHistory';
import { format } from 'date-fns';
import { Check, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLead } from '@/services/leadService';
import { LeadDetailed } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

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
  const [isLoading, setIsLoading] = useState(false);
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>(initialActionHistory || []);

  useEffect(() => {
    if (initialActionHistory) {
      setActionHistory(initialActionHistory);
    } else {
      fetchLeadData();
    }
  }, [leadId, initialActionHistory]);

  const fetchLeadData = async () => {
    if (!leadId) return;
    
    try {
      setIsLoading(true);
      const fetchedLead = await getLead(leadId);
      if (fetchedLead) {
        setLead(fetchedLead);
        setActionHistory(fetchedLead.actionHistory || []);
      }
    } catch (error) {
      console.error("Error fetching lead data:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données du lead"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'Call': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Appel</span>;
      case 'Visites': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Visite</span>;
      case 'Compromis': return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">Compromis</span>;
      case 'Acte de vente': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Acte de vente</span>;
      case 'Contrat de Location': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Contrat Location</span>;
      case 'Propositions': return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">Proposition</span>;
      case 'Follow up': return <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs">Follow-up</span>;
      case 'Estimation': return <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs">Estimation</span>;
      case 'Prospection': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">Prospection</span>;
      case 'Admin': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Admin</span>;
      default: return null;
    }
  };

  const sortedActions = [...actionHistory].sort((a, b) => {
    return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
  });

  const pendingActions = sortedActions.filter(action => !action.completedDate);
  const completedActions = sortedActions.filter(action => action.completedDate);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin h-6 w-6 border-4 border-chocolate-dark rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium">Actions en attente</h3>
        <Button 
          onClick={onAddAction}
          className="bg-chocolate-dark hover:bg-chocolate-light"
          size="sm"
        >
          Nouvelle action
        </Button>
      </div>

      {pendingActions.length === 0 ? (
        <div className="text-center py-6 border rounded-md bg-gray-50">
          <p className="text-muted-foreground text-sm">Aucune action en attente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingActions.map((action) => (
            <div key={action.id} className="border rounded-md p-3 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    {getActionTypeIcon(action.actionType)}
                  </div>
                  <div>
                    <h4 className="font-medium">{action.actionType}</h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(action.scheduledDate), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2 border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => onMarkComplete(action)}
                >
                  <Check className="h-4 w-4 mr-1" /> Terminer
                </Button>
              </div>
              {action.notes && (
                <div className="text-sm bg-gray-50 p-2 rounded-md mt-2">
                  {action.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {completedActions.length > 0 && (
        <>
          <h3 className="text-base font-medium mt-6 mb-3">Historique des actions</h3>
          <div className="space-y-3">
            {completedActions.map((action) => (
              <div key={action.id} className={cn(
                "border rounded-md p-3 bg-gray-50",
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      {getActionTypeIcon(action.actionType)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">{action.actionType}</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                        {action.completedDate && format(new Date(action.completedDate), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>
                {action.notes && (
                  <div className="text-sm bg-white p-2 rounded-md mt-2 text-gray-600">
                    {action.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ActionsPanelMobile;
