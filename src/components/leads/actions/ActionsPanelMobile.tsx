import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ActionHistory } from '@/types/actionHistory';
import { format, isPast } from 'date-fns';
import { Check, Clock, Calendar, Trash2, PlaneTakeoff, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLead } from '@/services/leadService';
import { LeadDetailed } from '@/types/lead';
import { toast } from '@/hooks/use-toast';
import { updateLead } from '@/services/leadUpdater';
import { LeadAIAssistant } from '@/components/leads/ai/LeadAIAssistant';
import { AIActionSuggestions } from '@/components/leads/ai/AIActionSuggestions';
import { Textarea } from '@/components/ui/textarea';

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
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isHeaderMeasured, setIsHeaderMeasured] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

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
      const bedroomsDisplay = Array.isArray(lead.bedrooms) 
        ? lead.bedrooms.join(', ') 
        : typeof lead.bedrooms === 'number'
          ? lead.bedrooms.toString()
          : 'Non spécifié';
      
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
          "Content-Type": "application/json",
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

  const sortedActions = [...(actionHistory || [])].sort((a, b) => {
    return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
  });

  const pendingActions = sortedActions.filter(action => !action.completedDate);
  const completedActions = sortedActions.filter(action => action.completedDate);

  const quickPrompts = lead ? [
    {
      id: 'follow-up',
      label: 'Relance WhatsApp',
      prompt: `Génère une relance WhatsApp professionnelle pour ${lead.name || 'ce client'} en tenant compte de son budget de ${lead.budget || ''} ${lead.currency || 'EUR'} et sa recherche à ${lead.desiredLocation || ''}. Le message doit être cordial et adapté à son profil.`
    },
    {
      id: 'selection',
      label: 'Mail sélection personnalisée',
      prompt: `Rédige un email professionnel pour présenter une sélection de biens à ${lead.name || 'ce client'}. Utilise ces critères: Budget ${lead.budget || ''} ${lead.currency || 'EUR'}, Localisation: ${lead.desiredLocation || ''}, Type de bien: ${lead.propertyTypes ? lead.propertyTypes.join(', ') : ''}.`
    },
    {
      id: 'general-follow',
      label: 'Follow-up général',
      prompt: `Crée un message de suivi pour ${lead.name || 'ce client'} qui fait référence à son projet ${lead.propertyTypes ? lead.propertyTypes.join(', ') : 'immobilier'} à ${lead.desiredLocation || ''}. Le message doit être personnalisé et professionnel.`
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* AI Action Suggestions */}
      {leadId && lead && (
        <div>
          <h3 className="text-xs font-futura text-loro-navy/60 uppercase tracking-wide mb-3">
            Suggestions d'actions
          </h3>
          <AIActionSuggestions 
            lead={lead}
            onActionAdded={fetchLeadData}
          />
        </div>
      )}
      
      {/* Assistant IA - avec prompts rapides */}
      {leadId && (
        <div className="bg-white rounded-xl border border-loro-pearl/20 overflow-hidden">
          <h3 className="text-xs font-futura text-loro-navy/60 uppercase tracking-wide p-3 border-b border-loro-pearl/20 bg-loro-pearl/5">
            Assistant IA
          </h3>
          
          <div className="p-3 space-y-3">
            {lead ? (
              <>
                <div className="flex gap-2 overflow-x-auto -mx-3 px-3 pb-2 no-scrollbar">
                  {quickPrompts.map((quickPrompt) => (
                    <Button
                      key={quickPrompt.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt(quickPrompt.prompt)}
                      className="whitespace-nowrap text-xs border-loro-sand hover:bg-loro-sand/10 shrink-0 font-futuraLight"
                    >
                      {quickPrompt.label}
                    </Button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex. Propose une relance WhatsApp ou un résumé du client..."
                    className="w-full min-h-[80px] text-sm font-futuraLight"
                  />
                  <Button
                    onClick={handleSendToGPT}
                    disabled={isAiLoading || !prompt}
                    className="w-full bg-loro-navy hover:bg-loro-navy/90 text-white font-futura"
                  >
                    {isAiLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
                        <span>Envoi en cours...</span>
                      </div>
                    ) : (
                      <>
                        <PlaneTakeoff className="h-4 w-4 mr-2" />
                        <span>Envoyer à l'IA</span>
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-loro-navy/60 font-futuraLight">
                  Assistant IA non disponible
                </p>
              </div>
            )}
          </div>
          
          {lead && <LeadAIAssistant lead={lead} />}
        </div>
      )}
      
      {/* Actions en attente */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-futura text-loro-navy/60 uppercase tracking-wide">
            Actions en attente ({pendingActions.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddAction}
            className="h-8 px-3 text-xs font-futura border-loro-sand hover:bg-loro-sand/10"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nouvelle action
          </Button>
        </div>

        {pendingActions.length === 0 ? (
          <div className="text-center py-6 px-4 bg-loro-pearl/5 rounded-xl border border-loro-pearl/20">
            <Calendar className="h-6 w-6 text-loro-navy/40 mx-auto mb-2" />
            <p className="text-sm text-loro-navy/60 font-futuraLight">
              Aucune action en attente
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingActions.map((action) => {
              const isOverdue = isPast(new Date(action.scheduledDate));
              const isCallAction = action.actionType === 'Call';
              
              return (
                <div 
                  key={action.id} 
                  className={cn(
                    "rounded-xl border p-3 animate-[fade-in_0.3s_ease-out] relative w-full",
                    isOverdue 
                      ? isCallAction 
                        ? 'bg-[#FDF4F6]/50 border-pink-200' 
                        : 'bg-[#FFDEE2]/30 border-pink-200' 
                      : 'bg-[#F2FCE2]/40 border-green-100'
                  )}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                        isCallAction
                          ? isOverdue
                            ? 'bg-[#FDF4F6] text-[#D05A76]'
                            : 'bg-[#EBD5CE] text-[#D05A76]'
                          : isOverdue
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-green-100 text-green-600'
                      )}>
                        <Calendar className="h-4 w-4" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {getActionTypeIcon(action.actionType)}
                          <span className="text-xs text-gray-500 font-futuraLight">
                            <Clock className="h-3 w-3 inline-block mr-1" />
                            {format(new Date(action.scheduledDate), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                        
                        {action.notes && (
                          <p className={cn(
                            "text-xs p-2 rounded-lg mt-2 break-words w-full font-futuraLight",
                            isOverdue 
                              ? isCallAction
                                ? 'bg-white text-[#D05A76] border border-pink-100'
                                : 'bg-white text-rose-800 border border-pink-100'
                              : 'bg-white text-green-800 border border-green-100'
                          )}>
                            {action.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "h-8 px-3 font-futura text-xs whitespace-nowrap",
                          isOverdue
                            ? "border-rose-300 text-rose-600 hover:bg-rose-50"
                            : "border-green-300 text-green-600 hover:bg-green-50"
                        )}
                        onClick={() => onMarkComplete(action)}
                      >
                        <Check className="h-3.5 w-3.5 mr-1.5" />
                        Terminer
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-gray-400 hover:text-rose-500 hover:bg-transparent"
                        onClick={() => handleDeleteAction(action.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Actions terminées */}
      {completedActions.length > 0 && (
        <div>
          <h3 className="text-xs font-futura text-loro-navy/60 uppercase tracking-wide mb-3">
            Actions terminées ({completedActions.length})
          </h3>
          
          <div className="space-y-2">
            {completedActions.map((action) => (
              <div 
                key={action.id} 
                className="rounded-xl border border-gray-200 p-3 bg-[#F1F0FB]/50 relative w-full animate-[fade-in_0.3s_ease-out]"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                      <Check className="h-4 w-4" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {getActionTypeIcon(action.actionType)}
                        <span className="text-xs text-gray-500 font-futuraLight">
                          <Check className="h-3 w-3 inline-block mr-1 text-green-500" />
                          {action.completedDate && format(new Date(action.completedDate), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      
                      {action.notes && (
                        <p className="text-xs p-2 rounded-lg mt-2 bg-white text-gray-600 break-words w-full font-futuraLight border border-gray-100">
                          {action.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-gray-400 hover:text-rose-500 hover:bg-transparent shrink-0"
                    onClick={() => handleDeleteAction(action.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsPanelMobile;
