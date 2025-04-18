import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ActionHistory } from '@/types/actionHistory';
import { format, isPast } from 'date-fns';
import { Check, Clock, Calendar, Trash2, Phone, MessageCircle, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLead } from '@/services/leadService';
import { LeadDetailed } from '@/types/lead';
import { toast } from '@/hooks/use-toast';
import { updateLead } from '@/services/leadUpdater';
import { AIActionSuggestions } from '@/components/leads/ai/AIActionSuggestions';
import AssistantIA from '@/components/leads/ai/AssistantIA';
import LeadActionSuggestions from '@/components/leads/ai/LeadActionSuggestions';

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
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isHeaderMeasured, setIsHeaderMeasured] = useState(false);

  const quickActions = [
    { 
      label: "Appel", 
      icon: Phone, 
      action: () => {
        toast({ title: "Appel", description: "Fonctionnalité d'appel à implémenter" });
      }
    },
    { 
      label: "WhatsApp", 
      icon: MessageCircle, 
      action: () => {
        toast({ title: "WhatsApp", description: "Envoyer un message WhatsApp" });
      }
    },
    { 
      label: "Email", 
      icon: Home, 
      action: () => {
        toast({ title: "Email", description: "Envoyer un email" });
      }
    }
  ];

  useEffect(() => {
    const measureHeader = () => {
      const headerElement = document.querySelector('.bg-loro-sand');
      if (headerElement) {
        const height = headerElement.getBoundingClientRect().height;
        setHeaderHeight(height);
        setIsHeaderMeasured(true);
      }
    };
    
    measureHeader();
    window.addEventListener('resize', measureHeader);
    const timeoutId = setTimeout(measureHeader, 300);
    
    return () => {
      window.removeEventListener('resize', measureHeader);
      clearTimeout(timeoutId);
    };
  }, []);

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
      console.log('Fetching lead data for ActionsPanelMobile:', leadId);
      const fetchedLead = await getLead(leadId);
      
      if (fetchedLead) {
        console.log('Lead data fetched successfully');
        setLead(fetchedLead);
        setActionHistory(fetchedLead.actionHistory || []);
      } else {
        console.error('No lead data returned');
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

  const handleDeleteAction = async (actionId: string) => {
    if (!lead && !leadId) return;
    
    try {
      setActionHistory((currentActions) => 
        currentActions.filter(action => action.id !== actionId)
      );
      
      const currentLead = lead || await getLead(leadId);
      
      if (currentLead) {
        const updatedActionHistory = (currentLead.actionHistory || [])
          .filter(action => action.id !== actionId);
        
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

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'Call': return <span className="bg-[#EBD5CE] text-[#D05A76] px-2 py-0.5 rounded-full text-xs font-futura">Appel</span>;
      case 'Visites': return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-futura">Visite</span>;
      case 'Compromis': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-futura">Compromis</span>;
      case 'Acte de vente': return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-futura">Acte de vente</span>;
      case 'Contrat de Location': return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-futura">Contrat Location</span>;
      case 'Propositions': return <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-futura">Proposition</span>;
      case 'Follow up': return <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full text-xs font-futura">Follow-up</span>;
      case 'Estimation': return <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-xs font-futura">Estimation</span>;
      case 'Prospection': return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-futura">Prospection</span>;
      case 'Admin': return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-futura">Admin</span>;
      default: return null;
    }
  };

  const sortedActions = [...actionHistory].sort((a, b) => {
    return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
  });

  const pendingActions = sortedActions.filter(action => !action.completedDate);
  const completedActions = sortedActions.filter(action => action.completedDate);
  
  const isDatePast = (dateString: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin h-5 w-5 border-3 border-chocolate-dark rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div 
      className="space-y-3 pt-4"
      style={{ marginTop: dynamicTopMargin }}
    >
      <div className="grid grid-cols-3 gap-2 mb-6">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex flex-col h-[80px] justify-center items-center space-y-2"
            onClick={action.action}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>

      {leadId && lead && (
        <div className="mb-6 animate-[fade-in_0.4s_ease-out]">
          <AssistantIA 
            lead={lead}
            leadId={leadId}
            refresh={fetchLeadData}
          />
        </div>
      )}
      
      {leadId && lead && (
        <div className="mb-6 animate-[fade-in_0.4s_ease-out]">
          <h3 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-3">
            SUGGESTIONS D'ACTIONS IA
          </h3>
          <LeadActionSuggestions lead={lead} />
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b">ACTIONS EN ATTENTE</h3>
      </div>

      {pendingActions.length === 0 ? (
        <div className="text-center py-5 border rounded-md bg-gray-50 animate-[fade-in_0.3s_ease-out]">
          <p className="text-muted-foreground text-xs font-futura">Aucune action en attente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pendingActions.map((action) => {
            const isOverdue = isDatePast(action.scheduledDate);
            const isCallAction = action.actionType === 'Call';
            
            const bgColorClass = isOverdue 
              ? isCallAction
                ? 'bg-[#F8E2E8]/30' 
                : 'bg-[#FFDEE2]/30' 
              : 'bg-[#F2FCE2]/40 border-green-100';
            
            const iconBgClass = isCallAction
              ? isOverdue
                ? 'bg-[#F8E2E8] text-[#D05A76]'
                : 'bg-[#EBD5CE] text-[#D05A76]'
              : isOverdue
                ? 'bg-rose-100 text-rose-600'
                : 'bg-green-100 text-green-600';
                
            const notesBgClass = isOverdue 
              ? isCallAction
                ? 'bg-[#FDF4F6] text-[#D05A76] border border-pink-100'
                : 'bg-[#FFF0F2] text-rose-800 border border-pink-100'
              : 'bg-[#F7FEF1] text-green-800 border border-green-100';
            
            return (
              <div 
                key={action.id} 
                className={`border rounded-md p-2 shadow-sm transition-all duration-200 animate-[fade-in_0.3s_ease-out] ${bgColorClass} relative`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${iconBgClass}`}>
                      <Calendar className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="font-futura text-sm">{action.actionType}</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-2.5 w-2.5 mr-1" />
                        {format(new Date(action.scheduledDate), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 px-1.5 border-green-500 text-green-600 hover:bg-green-50 transition-all duration-200 active:scale-95"
                    onClick={() => onMarkComplete(action)}
                  >
                    <Check className="h-3 w-3 mr-1" /> 
                    <span className="text-xs font-futura">Terminer</span>
                  </Button>
                </div>
                {action.notes && (
                  <div className={`text-xs p-1.5 rounded-md mt-1.5 animate-[fade-in_0.2s_ease-out] ${notesBgClass}`}>
                    {action.notes}
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute bottom-1 right-1 h-6 w-6 p-0 text-gray-400 hover:text-rose-500 hover:bg-transparent"
                  onClick={() => handleDeleteAction(action.id)}
                  title="Supprimer cette action"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
      
      {completedActions.length > 0 && (
        <>
          <h3 className="text-sm font-futura uppercase tracking-wider text-gray-800 mt-6 mb-3">HISTORIQUE DES ACTIONS</h3>
          <div className="space-y-2">
            {completedActions.map((action) => (
              <div 
                key={action.id} 
                className={cn(
                  "border rounded-md p-2 bg-[#F1F0FB] transition-all duration-200 animate-[fade-in_0.3s_ease-out]",
                  "opacity-80 relative"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Check className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="font-futura text-sm text-gray-700">{action.actionType}</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <Check className="h-2.5 w-2.5 mr-1 text-green-500" />
                        {action.completedDate && format(new Date(action.completedDate), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>
                {action.notes && (
                  <div className="text-xs bg-white p-1.5 rounded-md mt-1.5 text-gray-600 animate-[fade-in_0.2s_ease-out] border border-gray-100">
                    {action.notes}
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute bottom-1 right-1 h-6 w-6 p-0 text-gray-400 hover:text-rose-500 hover:bg-transparent"
                  onClick={() => handleDeleteAction(action.id)}
                  title="Supprimer cette action"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ActionsPanelMobile;
