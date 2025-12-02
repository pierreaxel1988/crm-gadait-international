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
import LoadingScreen from '@/components/layout/LoadingScreen';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import StatusSection from '@/components/leads/form/mobile/StatusSection';
import GeneralInfoSection from '@/components/leads/form/mobile/GeneralInfoSection';
import SearchCriteriaSection from '@/components/leads/form/mobile/SearchCriteriaSection';
import NotesSection from '@/components/leads/form/mobile/NotesSection';
import OwnerInfoSection from '@/components/leads/form/mobile/components/OwnerInfoSection';
import OwnerStatusSection from '@/components/leads/form/mobile/components/OwnerStatusSection';
import OwnerLocationSection from '@/components/leads/form/mobile/components/OwnerLocationSection';
import OwnerNotesSection from '@/components/leads/form/mobile/components/OwnerNotesSection';
import OwnerPropertySection from '@/components/leads/form/mobile/components/OwnerPropertySection';
import OwnerPriceFields from '@/components/leads/form/mobile/components/OwnerPriceFields';
import { useIsMobile } from '@/hooks/use-mobile';
import ChatGadaitFloatingButton from '@/components/chat/ChatGadaitFloatingButton';
const LeadDetailMobile = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'criteria';
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<'logo' | 'skeleton' | 'error'>('logo');
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
  } = useLeadActions(lead, setLead, (updatedLead) => {
    // Mettre à jour immédiatement l'état local sans refetch
    if (updatedLead) {
      setLead(updatedLead);
    }
  });
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
        actionHistory: updatedActionHistory,
        email_envoye: false
      };
      const result = await updateLead(updatedLead);
      if (result) {
        setLead(result);
      }
    } catch (error) {
      console.error("Error deleting action:", error);
    }
  };
  const handleSaveWithIndicator = async () => {
    await handleSave();
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 2000);
  };
  const handlePhoneCall = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Phone call initiated");
    startCallTracking('phone');
  };
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("WhatsApp initiated");
    startCallTracking('whatsapp');
  };
  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (lead?.email) {
      window.location.href = `mailto:${lead.email}`;
    }
  };
  const handleCallComplete = (duration: number) => {
    console.log("Call completed with duration:", duration);
    if (lead) {
      endCallTracking(duration);
    }
  };
  const getPendingActionsCount = () => {
    if (!lead?.actionHistory) return 0;
    return lead.actionHistory.filter(action => !action.completedDate).length;
  };
  // Timer logic for loading phases
  useEffect(() => {
    if (!lead && id) {
      // Phase 1: Show logo for first 2 seconds
      setLoadingPhase('logo');
      
      const timer1 = setTimeout(() => {
        if (!lead) {
          setLoadingPhase('skeleton');
        }
      }, 2000);
      
      // Phase 3: Show error after 5 seconds if still no lead
      const timer2 = setTimeout(() => {
        if (!lead) {
          setLoadingPhase('error');
        }
      }, 5000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else if (lead) {
      setLoadingPhase('logo'); // Reset when lead is found
    }
  }, [lead, id]);

  const showErrorState = !lead && id && loadingPhase === 'error';
  
  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-loro-night overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-40 w-full">
        <div className="bg-[#051B30] pt-[env(safe-area-inset-top)]">
          <LeadDetailHeader 
            name={lead?.name || ''} 
            createdAt={lead?.createdAt || ''} 
            phone={lead ? getFormattedPhoneForCall() : ''} 
            email={lead?.email || ''} 
            budget={lead?.budget || ''} 
            desired_price={lead?.desired_price || ''} 
            pipelineType={lead?.pipelineType || 'purchase'} 
            currency={lead?.currency || 'EUR'} 
            desiredLocation={lead?.pipelineType === 'owners' ? lead?.location : lead?.desiredLocation || ''} 
            country={lead?.country || ''} 
            purchaseTimeframe={lead?.purchaseTimeframe || ''} 
            onBackClick={handleBackClick} 
            onSave={handleSaveWithIndicator} 
            isSaving={isSaving} 
            hasChanges={hasChanges} 
            tags={lead?.tags || []} 
            onPhoneCall={handlePhoneCall} 
            onWhatsAppClick={handleWhatsAppClick} 
            onEmailClick={handleEmailClick} 
            onCallComplete={() => {}} 
          />
        </div>
        
        <div className="bg-loro-50">
          <LeadDetailTabs defaultTab={activeTab} pendingActionsCount={getPendingActionsCount()} />
        </div>
      </div>
      
      <ScrollArea className="flex-1 overflow-y-auto pt-20 no-scrollbar">
        <Tabs value={activeTab} className="w-full h-full">
          <div className="px-4 pb-36 h-full my-[100px]">
            {showErrorState ? (
              <NotFoundState show={true} id={id} />
            ) : lead ? (
              renderTabContent()
            ) : loadingPhase === 'logo' ? (
              // Phase 1: Gadait logo loading
              <div className="flex justify-center items-center h-[60vh]">
                <LoadingScreen fullscreen={false} />
              </div>
            ) : (
              // Phase 2: Skeleton loading state
              <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            )}
            
            <TabsContent value="actions" className="mt-1 animate-[fade-in_0.2s_ease-out]">
              {actionSuggestions && actionSuggestions.length > 0 && <ActionSuggestions suggestions={actionSuggestions} onAccept={acceptSuggestion} onReject={rejectSuggestion} />}
              <ActionsPanelMobile leadId={lead?.id || ''} onAddAction={(updatedLead) => {
                if (updatedLead) {
                  setLead(updatedLead);
                }
              }} onMarkComplete={handleMarkComplete} onDeleteAction={(actionId) => {
                if (lead) {
                  const updatedLead = {
                    ...lead,
                    actionHistory: lead.actionHistory?.filter(action => action.id !== actionId) || []
                  };
                  setLead(updatedLead);
                }
              }} actionHistory={lead?.actionHistory || []} />
              
              {lead && <ChatGadaitFloatingButton leadData={lead} position="bottom-right" />}
            </TabsContent>
          </div>
        </Tabs>
      </ScrollArea>
      
      <LeadDetailActionBar autoSaveEnabled={autoSaveEnabled} onAddAction={handleAddAction} lead={lead} hasChanges={hasChanges} isSaving={isSaving} onManualSave={handleSaveWithIndicator} actionSuggestions={actionSuggestions} />

      {showSaveIndicator && <div className="fixed top-16 right-4 bg-chocolate-dark text-white p-2 rounded-full shadow-md animate-[fade-in_0.3s_ease-out]">
          <CheckCircle className="h-5 w-5" />
        </div>}

      <ActionDialog isOpen={isActionDialogOpen} onClose={() => setIsActionDialogOpen(false)} selectedAction={selectedAction} setSelectedAction={setSelectedAction} actionDate={actionDate} setActionDate={setActionDate} actionTime={actionTime} setActionTime={setActionTime} actionNotes={actionNotes} setActionNotes={setActionNotes} onConfirm={handleActionConfirm} getActionTypeIcon={getActionTypeIcon} pipelineType={lead?.pipelineType} />
    </div>
  );

  // Conditional rendering based on pipeline type
  function renderTabContent() {
    if (!lead) return null;
    
    if (lead.pipelineType === 'owners') {
      return <>
          <TabsContent value="info" className="mt-1 animate-[fade-in_0.2s_ease-out]">
            <div className="space-y-6">
              <OwnerInfoSection lead={lead} onDataChange={handleDataChange} />
            </div>
          </TabsContent>
          
          <TabsContent value="criteria" className="mt-1 animate-[fade-in_0.2s_ease-out]">
            <div className="space-y-6">
              <OwnerLocationSection lead={lead} onDataChange={handleDataChange} />
              <OwnerPropertySection lead={lead} onDataChange={handleDataChange} />
              <OwnerPriceFields lead={lead} onDataChange={handleDataChange} />
            </div>
          </TabsContent>
          
          <TabsContent value="status" className="mt-1 animate-[fade-in_0.2s_ease-out]">
            <OwnerStatusSection lead={lead} onDataChange={handleDataChange} />
          </TabsContent>
          
          <TabsContent value="notes" className="mt-1 animate-[fade-in_0.2s_ease-out]">
            <OwnerNotesSection lead={lead} onDataChange={handleDataChange} />
          </TabsContent>
        </>;
    }

    // Default rendering for other pipeline types
    return <>
        <TabsContent value="info" className="mt-1 animate-[fade-in_0.2s_ease-out]">
          <GeneralInfoSection lead={lead} onDataChange={handleDataChange} />
        </TabsContent>
        
        <TabsContent value="criteria" className="mt-1 animate-[fade-in_0.2s_ease-out]">
          <SearchCriteriaSection lead={lead} onDataChange={handleDataChange} />
        </TabsContent>
        
        <TabsContent value="status" className="mt-1 animate-[fade-in_0.2s_ease-out]">
          <StatusSection lead={lead} onDataChange={handleDataChange} />
        </TabsContent>
        
        <TabsContent value="notes" className="mt-1 animate-[fade-in_0.2s_ease-out]">
          <NotesSection lead={lead} onDataChange={handleDataChange} />
        </TabsContent>
      </>;
  }
};
export default LeadDetailMobile;