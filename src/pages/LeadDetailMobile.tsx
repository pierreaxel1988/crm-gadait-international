
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LeadDetailed } from '@/types/lead';
import { ActionHistory } from '@/types/actionHistory';
import { getLead, updateLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeadActions } from '@/hooks/useLeadActions';
import { ArrowLeft, Check, Phone, Mail, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomButton from '@/components/ui/CustomButton';
import ActionDialog from '@/components/leads/actions/ActionDialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import StatusSection from '@/components/leads/form/mobile/StatusSection';
import GeneralInfoSection from '@/components/leads/form/mobile/GeneralInfoSection';
import SearchCriteriaSection from '@/components/leads/form/mobile/SearchCriteriaSection';
import NotesSection from '@/components/leads/form/mobile/NotesSection';
import ActionsPanel from '@/components/leads/actions/ActionsPanelMobile';

const LeadDetailMobile = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadDetailed | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Use the existing useLeadActions hook for action management
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

  const fetchLead = useCallback(async () => {
    if (id) {
      try {
        setIsLoading(true);
        const leadData = await getLead(id);
        console.log("Fetched lead data:", leadData);
        setLead(leadData || undefined);
        setHasChanges(false);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations du lead."
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);
  
  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleSave = async () => {
    if (!lead) return;
    
    try {
      setIsSaving(true);
      console.log("Saving lead data:", lead);
      
      const updatedLead = await updateLead(lead);
      if (updatedLead) {
        toast({
          title: "Lead mis à jour",
          description: "Les modifications ont été enregistrées avec succès."
        });
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Error saving lead:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle auto-save functionality
  useEffect(() => {
    if (hasChanges && autoSaveEnabled && lead) {
      // Clear any existing timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      // Set a new timer to save changes after 2 seconds of inactivity
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [lead, hasChanges, autoSaveEnabled]);

  const handleDataChange = (data: Partial<LeadDetailed>) => {
    if (!lead) return;
    
    setLead(prev => {
      if (!prev) return prev;
      return { ...prev, ...data };
    });
    
    setHasChanges(true);
  };

  const handleBackClick = () => {
    navigate('/pipeline');
  };

  // Cette fonction est un wrapper pour markActionComplete qui prend une ActionHistory au lieu d'un string
  const handleMarkComplete = (action: ActionHistory) => {
    markActionComplete(action.id);
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-chocolate-dark rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!lead && id) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold">Lead introuvable</h2>
          <p className="text-muted-foreground mt-2">Le lead que vous recherchez n'existe pas.</p>
          <CustomButton className="mt-4" variant="chocolate" onClick={() => navigate('/pipeline')}>
            Retour à la liste
          </CustomButton>
        </div>
      </div>
    );
  }
  
  if (!lead) return null;
  
  return (
    <div className="pb-20">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 shadow-sm border-b">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBackClick} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="truncate">
              <h1 className="text-lg font-futura leading-tight truncate">{lead.name}</h1>
              <p className="text-xs text-muted-foreground">
                {lead.createdAt && format(new Date(lead.createdAt), 'dd/MM/yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="p-2 rounded-full bg-green-100 text-green-600">
                <Phone className="h-4 w-4" />
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Mail className="h-4 w-4" />
              </a>
            )}
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-4 w-4 mr-1" />}
              <span className="text-xs">Enregistrer</span>
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-transparent">
            <TabsTrigger 
              value="general"
              className="py-2 px-1 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none text-xs"
            >
              Général
            </TabsTrigger>
            <TabsTrigger 
              value="criteria"
              className="py-2 px-1 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none text-xs"
            >
              Critères
            </TabsTrigger>
            <TabsTrigger 
              value="status"
              className="py-2 px-1 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none text-xs"
            >
              Statut
            </TabsTrigger>
            <TabsTrigger 
              value="notes"
              className="py-2 px-1 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none text-xs"
            >
              Notes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Content with padding to avoid header overlap */}
      <div className="pt-28 px-4">
        <TabsContent value="general" className="mt-0">
          <GeneralInfoSection lead={lead} onDataChange={handleDataChange} />
        </TabsContent>
        
        <TabsContent value="criteria" className="mt-0">
          <SearchCriteriaSection lead={lead} onDataChange={handleDataChange} />
        </TabsContent>
        
        <TabsContent value="status" className="mt-0">
          <StatusSection lead={lead} onDataChange={handleDataChange} />
        </TabsContent>
        
        <TabsContent value="notes" className="mt-0">
          <NotesSection lead={lead} onDataChange={handleDataChange} />
        </TabsContent>
      </div>
      
      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-center items-center">
        <div className="flex gap-3 w-full justify-between">
          <div className="flex items-center gap-1 text-sm">
            <div className={`w-3 h-3 rounded-full ${autoSaveEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-xs text-gray-600">Auto-save {autoSaveEnabled ? 'activé' : 'désactivé'}</span>
          </div>
          <div className="flex gap-2">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="px-4">Actions</Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[90vh]">
                <div className="p-4">
                  <h2 className="text-lg font-medium mb-4">Historique des actions</h2>
                  <ActionsPanel
                    lead={lead}
                    getActionTypeIcon={getActionTypeIcon}
                    onMarkComplete={markActionComplete}
                    onAddAction={handleAddAction}
                  />
                </div>
              </DrawerContent>
            </Drawer>
            <Button 
              onClick={handleAddAction} 
              className="bg-chocolate-dark hover:bg-chocolate-light"
              size="sm"
            >
              Nouvelle action
            </Button>
          </div>
        </div>
      </div>

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
