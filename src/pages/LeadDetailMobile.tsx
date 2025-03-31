
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ActionHistory } from '@/types/actionHistory';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useLeadActions } from '@/hooks/useLeadActions';
import ActionDialog from '@/components/leads/actions/ActionDialog';
import ActionsPanelMobile from '@/components/leads/actions/ActionsPanelMobile';
import { CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import our new components
import LeadDetailHeader from '@/components/leads/mobile/LeadDetailHeader';
import LeadDetailTabs from '@/components/leads/mobile/LeadDetailTabs';
import LeadDetailActionBar from '@/components/leads/mobile/LeadDetailActionBar';
import { LoadingState, NotFoundState } from '@/components/leads/mobile/LeadDetailErrorStates';
import { useLeadDetail } from '@/hooks/useLeadDetail';

// Import mobile section components
import StatusSection from '@/components/leads/form/mobile/StatusSection';
import GeneralInfoSection from '@/components/leads/form/mobile/GeneralInfoSection';
import SearchCriteriaSection from '@/components/leads/form/mobile/SearchCriteriaSection';
import NotesSection from '@/components/leads/form/mobile/NotesSection';

const LeadDetailMobile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'criteria';
  
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
    getActionTypeIcon
  } = useLeadActions(lead, setLead);

  const handleBackClick = () => {
    navigate('/pipeline');
  };

  const handleMarkComplete = (action: ActionHistory) => {
    if (action && action.id) {
      markActionComplete(action.id);
    }
  };

  const handleSaveWithIndicator = async () => {
    await handleSave();
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 2000);
  };

  if (isLoading) {
    return <LoadingState isLoading={isLoading} />;
  }

  if (!lead && id) {
    return <NotFoundState show={!lead && !!id} id={id} />;
  }
  
  if (!lead || !id) return null;
  
  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-loro-night overflow-hidden">
      <div className="fixed top-0 left-0 right-0 bg-white z-40 shadow-sm">
        <LeadDetailHeader
          id={id}
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
          taskType={lead.taskType}
        />
        
        <LeadDetailTabs defaultTab={activeTab} />
      </div>
      
      <ScrollArea className="flex-1 pb-24 mt-24 overflow-y-auto">
        <Tabs value={activeTab} className="w-full">
          <div className="px-4 pt-2 pb-32">
            <TabsContent value="info" className="mt-0 animate-[fade-in_0.2s_ease-out]">
              <GeneralInfoSection lead={lead} onDataChange={handleDataChange} />
            </TabsContent>
            
            <TabsContent value="criteria" className="mt-0 animate-[fade-in_0.2s_ease-out]">
              <SearchCriteriaSection lead={lead} onDataChange={handleDataChange} />
            </TabsContent>
            
            <TabsContent value="status" className="mt-0 animate-[fade-in_0.2s_ease-out]">
              <StatusSection lead={lead} onDataChange={handleDataChange} />
            </TabsContent>
            
            <TabsContent value="notes" className="mt-0 animate-[fade-in_0.2s_ease-out]">
              <NotesSection lead={lead} onDataChange={handleDataChange} />
            </TabsContent>
            
            <TabsContent value="actions" className="mt-0 animate-[fade-in_0.2s_ease-out]">
              <ActionsPanelMobile 
                leadId={lead.id} 
                onAddAction={fetchLead}
                onMarkComplete={handleMarkComplete} 
                actionHistory={lead.actionHistory || []}
              />
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
        hasChanges={hasChanges}
        isSaving={isSaving}
        onManualSave={handleSaveWithIndicator}
      />

      {showSaveIndicator && (
        <div className="fixed top-16 right-4 bg-chocolate-dark text-white p-2 rounded-full shadow-md animate-[fade-in_0.3s_ease-out]">
          <CheckCircle className="h-5 w-5" />
        </div>
      )}

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
