
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ActionHistory } from '@/types/actionHistory';
import { format, isPast } from 'date-fns';
import { Check, Clock, Calendar, Trash2, Plus, MessageSquare, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLead } from '@/services/leadService';
import { LeadDetailed } from '@/types/lead';
import { toast } from '@/hooks/use-toast';
import { updateLead } from '@/services/leadUpdater';
import { LeadAIAssistant } from '@/components/leads/ai/LeadAIAssistant';
import { AIActionSuggestions } from '@/components/leads/ai/AIActionSuggestions';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [prompt, setPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  const handleSendToGPT = async () => {
    if (!prompt || !lead) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer un message et attendre que les données du lead soient chargées."
      });
      return;
    }
    setIsAiLoading(true);
    try {
      const bedroomsDisplay = Array.isArray(lead.bedrooms) ? lead.bedrooms.join(', ') : typeof lead.bedrooms === 'number' ? lead.bedrooms.toString() : 'Non spécifié';
      const body = {
        message: prompt,
        leadContext: `
          Lead ID: ${lead.id}
          Nom: ${lead.name || 'Non spécifié'}
          Langue: ${lead.preferredLanguage || 'Non spécifiée'}
          Budget min: ${lead.budgetMin || 'Non spécifié'} 
          Budget max: ${lead.budget || 'Non spécifié'}
          Devise: ${lead.currency || 'EUR'}
          Type de bien: ${lead.propertyTypes ? lead.propertyTypes.join(', ') : 'Non spécifié'}
          Vue souhaitée: ${lead.views ? lead.views.join(', ') : 'Non spécifiée'}
          Nombre de chambres: ${bedroomsDisplay}
          Localisation: ${lead.desiredLocation || 'Non spécifiée'}
          Notes: ${lead.notes || 'Aucune note'}
          Agent: ${lead.assignedTo || 'Non assigné'}
        `,
        type: "action_suggestion"
      };
      const response = await fetch("https://hxqoqkfnhbpwzkjgukrc.functions.supabase.co/chat-gadait", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec l\'assistant');
      }
      const data = await response.json();
      console.log("Réponse IA :", data.response);
      toast({
        title: "Message envoyé",
        description: "L'assistant traite votre demande"
      });
      setPrompt("");
      fetchLeadData();
    } catch (error) {
      console.error("Erreur lors de l'envoi à l'IA:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de communiquer avec l'assistant IA"
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'Call':
        return <span className="bg-[#EBD5CE] text-[#D05A76] px-2 py-0.5 rounded-full text-xs font-futura">Appel</span>;
      case 'Visites':
        return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-futura">Visite</span>;
      case 'Compromis':
        return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-futura">Compromis</span>;
      case 'Acte de vente':
        return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-futura">Acte de vente</span>;
      case 'Contrat de Location':
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-futura">Contrat Location</span>;
      case 'Propositions':
        return <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-futura">Proposition</span>;
      case 'Follow up':
        return <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full text-xs font-futura">Follow-up</span>;
      case 'Estimation':
        return <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-xs font-futura">Estimation</span>;
      case 'Prospection':
        return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-futura">Prospection</span>;
      case 'Admin':
        return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-futura">Admin</span>;
      default:
        return null;
    }
  };

  const sortedActions = [...(actionHistory || [])].sort((a, b) => {
    return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
  });

  const pendingActions = sortedActions.filter(action => !action.completedDate);
  const completedActions = sortedActions.filter(action => action.completedDate);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header avec suggestions IA */}
      {leadId && lead && (
        <div className="sticky top-0 z-10 bg-white border-b border-loro-pearl/20 pb-2">
          <div className="p-3">
            <h3 className="text-sm font-futura text-loro-navy mb-2.5">
              Assistant IA
            </h3>
            <div className="mb-3">
              <AIActionSuggestions lead={lead} onActionAdded={fetchLeadData} />
            </div>
          </div>
          
          <div className="px-3 pb-1 border-t border-loro-pearl/20 pt-2.5">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-loro-pearl/20 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-loro-navy/60" />
                </div>
                <div>
                  <h3 className="text-sm font-futura text-loro-navy">Actions en attente</h3>
                  <p className="text-xs text-loro-navy/60">{pendingActions.length} actions</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAddAction}
                className="h-8 px-3 text-xs font-futura border-loro-sand hover:bg-loro-sand/10"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Nouvelle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Zone de défilement principale - contenant les actions */}
      <ScrollArea className="flex-1 px-3 pb-20 animate-[fade-in_0.3s_ease-out]">
        <div className="space-y-3 pt-1">
          {/* Actions en attente */}
          {pendingActions.map(action => {
            const isOverdue = isPast(new Date(action.scheduledDate));
            const isCallAction = action.actionType === 'Call';
            
            return (
              <div 
                key={action.id}
                className={cn(
                  "rounded-lg border p-3 animate-[fade-in_0.3s_ease-out]",
                  isOverdue 
                    ? isCallAction 
                      ? 'bg-[#FDF4F6]/50 border-pink-200' 
                      : 'bg-[#FFDEE2]/30 border-pink-200' 
                    : 'bg-[#F2FCE2]/40 border-green-100'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                    isCallAction 
                      ? isOverdue 
                        ? 'bg-[#FDF4F6] text-[#D05A76]' 
                        : 'bg-[#EBD5CE] text-[#D05A76]' 
                      : isOverdue 
                        ? 'bg-rose-100 text-rose-600' 
                        : 'bg-green-100 text-green-600'
                  )}>
                    {action.actionType === 'Call' ? (
                      <Phone className="h-5 w-5" />
                    ) : (
                      <Calendar className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-loro-navy truncate">
                        {action.actionType}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        <Clock className="h-3 w-3 inline-block mr-1" />
                        {format(new Date(action.scheduledDate), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    
                    {action.notes && (
                      <p className={cn(
                        "text-sm p-2 rounded-lg mt-2 break-words",
                        isOverdue 
                          ? 'bg-white/80 text-rose-800 border border-rose-100' 
                          : 'bg-white/80 text-green-800 border border-green-100'
                      )}>
                        {action.notes}
                      </p>
                    )}
                    
                    <div className="flex justify-end items-center gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAction(action.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-rose-500 hover:bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => onMarkComplete(action)}
                        className={cn(
                          "h-8 font-futura text-xs",
                          isOverdue 
                            ? "border-rose-300 text-rose-600 hover:bg-rose-50" 
                            : "border-green-300 text-green-600 hover:bg-green-50"
                        )}
                      >
                        <Check className="h-3.5 w-3.5 mr-1.5" />
                        Terminer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Actions terminées */}
          {completedActions.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-futura text-gray-600">Actions terminées</h3>
                  <p className="text-xs text-gray-500">{completedActions.length} actions</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {completedActions.map(action => (
                  <div 
                    key={action.id}
                    className="rounded-lg border border-gray-200 p-3 bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {action.actionType === 'Call' ? (
                          <Phone className="h-5 w-5 text-gray-600" />
                        ) : (
                          <Calendar className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-600 truncate">
                            {action.actionType}
                          </span>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            <Check className="h-3 w-3 inline-block mr-1 text-green-500" />
                            {format(new Date(action.completedDate || ''), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                        
                        {action.notes && (
                          <p className="text-sm p-2 rounded-lg mt-2 bg-white text-gray-600 break-words border border-gray-100">
                            {action.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Assistant IA (footer fixé en bas) */}
      {lead && (
        <div className="sticky bottom-0 border-t border-loro-pearl/20 bg-white p-3 pb-safe">
          <LeadAIAssistant lead={lead} />
        </div>
      )}
    </div>
  );
};

export default ActionsPanelMobile;
