import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeadActions } from '@/hooks/useLeadActions';
import ActionDialog from '@/components/leads/actions/ActionDialog';
import ActionsTab from '@/components/leads/actions/ActionsTab';
import ActionSuggestions from '@/components/leads/actions/ActionSuggestions';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { updateLead } from '@/services/leadService';
import LeadDetailHeader from '@/components/leads/LeadDetailHeader';
import { LoadingState, NotFoundState } from '@/components/leads/LeadDetailErrorStates';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import StatusSection from '@/components/leads/form/StatusSection';
import GeneralInfoSection from '@/components/leads/form/GeneralInfoSection';
import SearchCriteriaSection from '@/components/leads/form/SearchCriteriaSection';
import NotesSection from '@/components/leads/form/NotesSection';
import PublicCriteriaLinkManager from '@/components/leads/PublicCriteriaLinkManager';
import { Button } from '@/components/ui/button';
import { syncExistingActionsWithLeads } from '@/services/leadActions';
import ChatGadaitFloatingButton from '@/components/chat/ChatGadaitFloatingButton';

const LeadDetailDesktop = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  
  const {
    lead,
    setLead,
    isLoading,
    isSaving,
    hasChanges,
    autoSaveEnabled,
    setAutoSaveEnabled,
    handleSave,
    handleDataChange,
    fetchLead,
    getFormattedPhoneForCall,
    getFormattedPhoneForWhatsApp,
    startCallTracking,
    endCallTracking,
    formatDuration,
    handleReassignToJacques
  } = useLeadDetail(id);
  
  const {
    isActionDialogOpen,
    setIsActionDialogOpen,
    selectedAction,
    setSelectedAction,
    actionDate,
    setActionDate,
    actionTime,
    setActionTime,
    actionNotes,
    setActionNotes,
    handleAddAction,
    handleActionConfirm,
    markActionComplete,
    getActionTypeIcon,
    actionSuggestions,
    acceptSuggestion,
    rejectSuggestion
  } = useLeadActions(lead, setLead);
  
  // Synchroniser les actions existantes avec les leads au chargement
  useEffect(() => {
    if (id) {
      syncExistingActionsWithLeads(id)
        .then(success => {
          if (success) {
            console.log(`Actions du lead ${id} synchronisées avec succès`);
          }
        })
        .catch(error => {
          console.error(`Erreur lors de la synchronisation des actions pour le lead ${id}:`, error);
        });
    }
  }, [id]);
  
  const handleBackClick = () => {
    navigate('/pipeline');
  };
  
  const handleMarkComplete = (action) => {
    if (action && action.id) {
      markActionComplete(action.id);
    }
  };
  
  const handleDeleteAction = async (actionId) => {
    if (!lead) return;
    try {
      const updatedActionHistory = lead.actionHistory.filter(action => action.id !== actionId);
      const updatedLead = {
        ...lead,
        actionHistory: updatedActionHistory,
        email_envoye: false // S'assurer que l'email automatique ne soit pas déclenché
      };
      const result = await updateLead(updatedLead);
      if (result) {
        setLead(result);
        toast({
          title: "Action supprimée",
          description: "L'action a été supprimée avec succès"
        });
      }
    } catch (error) {
      console.error("Error deleting action:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'action"
      });
    }
  };
  
  const handleSaveWithIndicator = async () => {
    await handleSave();
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 2000);
  };
  
  const handlePhoneCall = (e) => {
    e.preventDefault();
    console.log("Phone call initiated");
    startCallTracking('phone');
  };
  
  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    console.log("WhatsApp initiated");
    startCallTracking('whatsapp');
  };
  
  const handleEmailClick = (e) => {
    e.preventDefault();
    if (lead?.email) {
      window.location.href = `mailto:${lead.email}`;
    }
  };
  
  const handleCallComplete = (duration) => {
    console.log("Call completed with duration:", duration);
    if (lead) {
      endCallTracking(duration);
    }
  };
  
  const getPendingActionsCount = () => {
    if (!lead?.actionHistory) return 0;
    return lead.actionHistory.filter(action => !action.completedDate).length;
  };
  
  if (isLoading) {
    return <LoadingState isLoading={isLoading} />;
  }
  
  if (!lead && id) {
    return <NotFoundState show={!lead && !!id} id={id} />;
  }
  
  if (!lead) return null;
  
  return <div className="flex h-screen bg-white dark:bg-loro-night">
      <div className="w-64 border-r border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <Button variant="ghost" onClick={handleBackClick}>
            Retour au Pipeline
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-100px)] pb-8">
          <div className="px-6 py-4">
            <LeadDetailHeader 
              name={lead.name} 
              createdAt={lead.createdAt} 
              phone={getFormattedPhoneForCall()} 
              email={lead.email} 
              budget={lead.budget} 
              currency={lead.currency} 
              desiredLocation={lead.desiredLocation} 
              country={lead.country} 
              purchaseTimeframe={lead.purchaseTimeframe} 
              onSave={handleSaveWithIndicator} 
              isSaving={isSaving} 
              hasChanges={hasChanges} 
              tags={lead.tags} 
              onPhoneCall={handlePhoneCall} 
              onWhatsAppClick={handleWhatsAppClick} 
              onEmailClick={handleEmailClick} 
              onCallComplete={() => {}} 
            />
          </div>
          
          <Tabs defaultValue="criteria" className="flex flex-col h-full">
            <TabsList className="flex-1">
              <TabsTrigger value="info" className="data-[state=active]:bg-muted/50">
                Informations
              </TabsTrigger>
              <TabsTrigger value="criteria" className="data-[state=active]:bg-muted/50">
                Critères
              </TabsTrigger>
              <TabsTrigger value="status" className="data-[state=active]:bg-muted/50">
                Statut
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-muted/50">
                Notes
              </TabsTrigger>
              <TabsTrigger value="share" className="data-[state=active]:bg-muted/50">
                Partager
              </TabsTrigger>
              <TabsTrigger value="actions" className="data-[state=active]:bg-muted/50">
                Actions ({getPendingActionsCount()})
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 p-6">
              <TabsContent value="info" className="flex-1 overflow-hidden">
                <GeneralInfoSection lead={lead} onDataChange={handleDataChange} />
              </TabsContent>
              
              <TabsContent value="criteria" className="flex-1 overflow-hidden">
                <SearchCriteriaSection lead={lead} onDataChange={handleDataChange} />
              </TabsContent>
              
              <TabsContent value="status" className="flex-1 overflow-hidden">
                <StatusSection lead={lead} onDataChange={handleDataChange} />
              </TabsContent>
              
              <TabsContent value="notes" className="flex-1 overflow-hidden">
                <NotesSection lead={lead} onDataChange={handleDataChange} />
              </TabsContent>

              <TabsContent value="share" className="flex-1 overflow-hidden">
                <PublicCriteriaLinkManager leadId={lead.id} leadName={lead.name} />
              </TabsContent>
              
              <TabsContent value="actions" className="flex-1 overflow-hidden">
                <ActionsTab lead={lead} />
              </TabsContent>
            </div>
          </Tabs>
        </ScrollArea>
      </div>

      {showSaveIndicator && 
        <div className="fixed top-4 right-4 bg-green-500 text-white p-2 rounded-md shadow-md animate-[fade-in_0.3s_ease-out]">
          <CheckCircle className="h-5 w-5" />
        </div>
      }

      <ActionDialog 
        isOpen={isActionDialogOpen} 
        onClose={() => setIsActionDialogOpen(false)} 
        selectedAction={selectedAction} 
        setSelectedAction={setSelectedAction} 
        actionDate={actionDate} 
        setActionDate={setActionDate} 
        actionTime={actionTime} 
        setActionTime={setActionTime} 
        actionNotes={actionNotes} 
        setActionNotes={setActionNotes} 
        onConfirm={handleActionConfirm} 
        getActionTypeIcon={getActionTypeIcon} 
      />
    </div>;
};

export default LeadDetailDesktop;
