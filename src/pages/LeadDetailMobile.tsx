import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ActionHistory } from '@/types/actionHistory';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useLeadActions } from '@/hooks/useLeadActions';
import ActionDialog from '@/components/leads/actions/ActionDialog';
import ActionsPanelMobile from '@/components/leads/actions/ActionsPanelMobile';
import ActionSuggestions from '@/components/leads/actions/ActionSuggestions';
import { CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { updateLead } from '@/services/leadService';

import LeadDetailHeader from '@/components/leads/mobile/LeadDetailHeader';
import LeadDetailTabs from '@/components/leads/mobile/LeadDetailTabs';
import LeadDetailActionBar from '@/components/leads/mobile/LeadDetailActionBar';
import { LoadingState, NotFoundState } from '@/components/leads/mobile/LeadDetailErrorStates';
import { useLeadDetail } from '@/hooks/useLeadDetail';

import StatusSection from '@/components/leads/form/mobile/StatusSection';
import GeneralInfoSection from '@/components/leads/form/mobile/GeneralInfoSection';
import SearchCriteriaSection from '@/components/leads/form/mobile/SearchCriteriaSection';
import NotesSection from '@/components/leads/form/mobile/NotesSection';
import EmailsTab from '@/components/leads/mobile/tabs/EmailsTab';

const LeadDetailMobile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'criteria';
  
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'completed' | 'failed'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);
  const [callType, setCallType] = useState<'phone' | 'whatsapp'>('phone');
  
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
    fetchLead
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

  const handleBackClick = () => {
    navigate('/pipeline');
  };

  const handleMarkComplete = (action: ActionHistory) => {
    if (action && action.id) {
      markActionComplete(action.id);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    if (!lead) return;
    
    try {
      const updatedActionHistory = lead.actionHistory.filter(action => action.id !== actionId);
      
      const updatedLead = {
        ...lead,
        actionHistory: updatedActionHistory
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

  const startCall = (type: 'phone' | 'whatsapp' = 'phone') => {
    if (!lead || !lead.phone) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Ce lead n'a pas de numéro de téléphone enregistré."
      });
      return;
    }

    setCallType(type);
    setIsCallDialogOpen(true);
    setCallStatus('calling');
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    setCallTimer(timer);
    
    if (type === 'phone') {
      window.location.href = `tel:${lead.phone}`;
    } else {
      const cleanedPhone = lead.phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };

  const endCall = (status: 'completed' | 'failed') => {
    if (callTimer) {
      clearInterval(callTimer);
    }
    
    setCallStatus(status);
    
    if (status === 'completed' && callDuration > 0 && lead) {
      const callAction = {
        actionType: 'Call' as any,
        notes: `${callType === 'whatsapp' ? 'WhatsApp' : 'Appel'} de ${formatDuration(callDuration)}`,
        createdAt: new Date().toISOString(),
        scheduledDate: new Date().toISOString(),
        completedDate: new Date().toISOString(),
        id: crypto.randomUUID()
      };
      
      const updatedActionHistory = [...(lead.actionHistory || []), callAction];
      
      handleDataChange({
        actionHistory: updatedActionHistory,
        lastContactedAt: new Date().toISOString()
      });
      
      toast({
        title: callType === 'whatsapp' ? "WhatsApp enregistré" : "Appel enregistré",
        description: `Un ${callType === 'whatsapp' ? 'appel WhatsApp' : 'appel'} de ${formatDuration(callDuration)} a été enregistré.`
      });
    }
    
    setTimeout(() => {
      setIsCallDialogOpen(false);
      setCallDuration(0);
      setCallStatus('idle');
    }, 1500);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePhoneCall = (e: React.MouseEvent) => {
    e.preventDefault();
    startCall('phone');
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    startCall('whatsapp');
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (lead?.email) {
      window.location.href = `mailto:${lead.email}`;
    }
  };

  if (isLoading) {
    return <LoadingState isLoading={isLoading} />;
  }

  if (!lead && id) {
    return <NotFoundState show={!lead && !!id} id={id} />;
  }
  
  if (!lead) return null;
  
  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-loro-night overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-40 bg-loro-sand w-full">
        <LeadDetailHeader
          name={lead.name}
          createdAt={lead.createdAt}
          phone={lead.phone}
          email={lead.email}
          budget={lead.budget}
          currency={lead.currency}
          desiredLocation={lead.desiredLocation}
          country={lead.country}
          purchaseTimeframe={lead.purchaseTimeframe}
          onBackClick={handleBackClick}
          onSave={handleSaveWithIndicator}
          isSaving={isSaving}
          hasChanges={hasChanges}
          tags={lead.tags}
          onPhoneCall={handlePhoneCall}
          onWhatsAppClick={handleWhatsAppClick}
          onEmailClick={handleEmailClick}
        />
        
        <div className="bg-white">
          <LeadDetailTabs defaultTab={activeTab} />
        </div>
      </div>
      
      <ScrollArea className="flex-1 overflow-y-auto pt-4">
        <Tabs value={activeTab} className="w-full h-full">
          <div className="px-4 pb-32 h-full">
            <TabsContent value="info" className="mt-0 animate-[fade-in_0.2s_ease-out]">
              <GeneralInfoSection lead={lead} onDataChange={handleDataChange} />
            </TabsContent>
            
            <TabsContent value="criteria" className="mt-0 animate-[fade-in_0.2s_ease-out]">
              <SearchCriteriaSection lead={lead} onDataChange={handleDataChange} />
            </TabsContent>
            
            <TabsContent value="status" className="mt-0 animate-[fade-in_0.2s_ease-out]">
              <StatusSection 
                lead={lead} 
                onDataChange={handleDataChange} 
                startCall={startCall}
                isCallDialogOpen={isCallDialogOpen}
                setIsCallDialogOpen={setIsCallDialogOpen}
                callStatus={callStatus}
                callDuration={callDuration}
                endCall={endCall}
                formatDuration={formatDuration}
              />
            </TabsContent>
            
            <TabsContent value="notes" className="mt-0 animate-[fade-in_0.2s_ease-out]">
              <NotesSection lead={lead} onDataChange={handleDataChange} />
            </TabsContent>
            
            <TabsContent value="actions" className="mt-0 animate-[fade-in_0.2s_ease-out]">
              {actionSuggestions && actionSuggestions.length > 0 && (
                <ActionSuggestions
                  suggestions={actionSuggestions}
                  onAccept={acceptSuggestion}
                  onReject={rejectSuggestion}
                />
              )}
              <ActionsPanelMobile 
                leadId={lead.id} 
                onAddAction={fetchLead}
                onMarkComplete={handleMarkComplete} 
                actionHistory={lead.actionHistory || []}
              />
            </TabsContent>
            
            <TabsContent value="emails" className="h-full flex-1 flex-grow">
              <EmailsTab leadId={id || ''} />
            </TabsContent>
          </div>
        </Tabs>
      </ScrollArea>
      
      <LeadDetailActionBar
        autoSaveEnabled={autoSaveEnabled}
        onAddAction={handleAddAction}
        lead={lead}
        getActionTypeIcon={getActionTypeIcon}
        onMarkComplete={markActionComplete}
        onDeleteAction={handleDeleteAction}
        hasChanges={hasChanges}
        isSaving={isSaving}
        onManualSave={handleSaveWithIndicator}
        actionSuggestions={actionSuggestions}
        onAcceptSuggestion={acceptSuggestion}
        onRejectSuggestion={rejectSuggestion}
      />

      {showSaveIndicator && (
        <div className="fixed top-16 right-4 bg-chocolate-dark text-white p-2 rounded-full shadow-md animate-[fade-in_0.3s_ease-out]">
          <CheckCircle className="h-5 w-5" />
        </div>
      )}

      <ActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => setIsCallDialogOpen(false)}
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
    </div>
  );
};

export default LeadDetailMobile;
