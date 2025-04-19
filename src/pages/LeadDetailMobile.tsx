
import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ActionHistory } from '@/types/actionHistory';
import { toast } from '@/hooks/use-toast';
import { useLeadActions } from '@/hooks/useLeadActions';
import ActionDialog from '@/components/leads/actions/ActionDialog';
import { updateLead } from '@/services/leadService';
import { useLeadDetail } from '@/hooks/useLeadDetail';
import { useIsMobile } from '@/hooks/use-mobile';

import LeadDetailHeader from '@/components/leads/mobile/LeadDetailHeader';
import LeadDetailTabs from '@/components/leads/mobile/LeadDetailTabs';
import LeadDetailActionBar from '@/components/leads/mobile/LeadDetailActionBar';
import { LoadingState, NotFoundState } from '@/components/leads/mobile/LeadDetailErrorStates';
import LeadDetailContent from '@/components/leads/mobile/LeadDetailContent';
import CallManagement from '@/components/leads/mobile/CallManagement';
import SaveIndicator from '@/components/leads/mobile/SaveIndicator';

const LeadDetailMobile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'criteria';
  
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  
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
    formatDuration
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

  const handlePhoneCall = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Phone call initiated");
    startCallTracking('phone');
    setIsCallDialogOpen(true);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("WhatsApp initiated");
    startCallTracking('whatsapp');
    setIsCallDialogOpen(true);
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
      <div className="sticky top-0 left-0 right-0 z-30 w-full">
        <div className="bg-loro-sand pt-[env(safe-area-inset-top)]">
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
            onBackClick={handleBackClick}
            onSave={handleSaveWithIndicator}
            isSaving={isSaving}
            hasChanges={hasChanges}
            tags={lead.tags}
            onPhoneCall={handlePhoneCall}
            onWhatsAppClick={handleWhatsAppClick}
            onEmailClick={handleEmailClick}
          />
        </div>
        <LeadDetailTabs defaultTab={activeTab} />
      </div>
      
      <LeadDetailContent
        lead={lead}
        activeTab={activeTab}
        onDataChange={handleDataChange}
        actionSuggestions={actionSuggestions}
        onAcceptSuggestion={acceptSuggestion}
        onRejectSuggestion={rejectSuggestion}
        onMarkComplete={handleMarkComplete}
        fetchLead={fetchLead}
      />
      
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

      <SaveIndicator show={showSaveIndicator} />

      <CallManagement
        name={lead.name}
        phone={getFormattedPhoneForCall()}
        isCallDialogOpen={isCallDialogOpen}
        setIsCallDialogOpen={setIsCallDialogOpen}
        callStatus={lead.isCallInProgress ? 'calling' : 'idle'}
        callDuration={lead.callDuration || 0}
        formatDuration={formatDuration}
        endCall={endCallTracking}
      />

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
    </div>
  );
};

export default LeadDetailMobile;
