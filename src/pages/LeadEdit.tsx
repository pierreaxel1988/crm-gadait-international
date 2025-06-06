import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LeadForm from '@/components/leads/LeadForm';
import { LeadDetailed } from '@/types/lead';
import { getLead, updateLead, deleteLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeadActions } from '@/hooks/useLeadActions';
import LeadHeader from '@/components/leads/LeadHeader';
import ActionsPanel from '@/components/leads/actions/ActionsPanel';
import ActionDialog from '@/components/leads/actions/ActionDialog';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import CustomButton from '@/components/ui/CustomButton';
import FloatingActionButtons from '@/components/ui/FloatingActionButtons';
import { cn } from '@/lib/utils';

const LeadEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadDetailed | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const [hasChanges, setHasChanges] = useState(false);
  
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

  const handleSubmit = async (data: LeadDetailed) => {
    try {
      setIsSaving(true);
      console.log("Submitting lead update with data:", data);
      
      const leadDataToUpdate = {
        ...data,
        id: id || data.id
      };
      
      console.log("Final data to update:", leadDataToUpdate);
      
      const updatedLead = await updateLead(leadDataToUpdate);
      if (updatedLead) {
        toast({
          title: "Lead mis à jour",
          description: "Les modifications ont été enregistrées avec succès."
        });
        
        if (id) {
          const refreshedLead = await getLead(id);
          if (refreshedLead) {
            console.log("Lead refreshed after update:", refreshedLead);
            setLead(refreshedLead);
            setHasChanges(false);
          }
        }
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

  const handleDataChange = (data: LeadDetailed) => {
    console.log("Form data changed:", data);
    setLead(data);
    setHasChanges(true);
  };

  const handleSaveClick = () => {
    if (lead) {
      console.log("Save button clicked, saving lead:", lead);
      handleSubmit(lead);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lead ?')) {
      try {
        if (id) {
          await deleteLead(id);
          toast({
            title: "Lead supprimé",
            description: "Le lead a été supprimé avec succès."
          });
          navigate('/pipeline');
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de supprimer ce lead."
        });
      }
    }
  };

  const handleBackClick = () => {
    navigate('/pipeline');
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-chocolate-dark rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!lead && id) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-8 md:py-10">
          <h2 className="text-xl md:text-2xl font-semibold">Lead introuvable</h2>
          <p className="text-muted-foreground mt-2">Le lead que vous recherchez n'existe pas.</p>
          <CustomButton className="mt-4" variant="chocolate" onClick={() => navigate('/pipeline')}>
            Retour à la liste
          </CustomButton>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-3 md:p-6 space-y-1 pb-24 md:pb-6">
      <LeadHeader 
        lead={lead} 
        onBack={handleBackClick} 
        onAddAction={handleAddAction} 
        onDelete={handleDelete}
        onSave={handleSaveClick}
        isSaving={isSaving}
        hasChanges={hasChanges}
      />

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className={cn(
          "w-full bg-background border-b flex sticky z-10 mt-0",
          isMobile ? "overflow-x-auto no-scrollbar top-[60px] px-0" : "top-[105px]"
        )}>
          <TabsTrigger 
            value="general" 
            className={cn(
              "py-1.5 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none whitespace-nowrap",
              isMobile ? "px-2 text-xs" : "px-3 text-sm"
            )}
          >
            Général
          </TabsTrigger>
          <TabsTrigger 
            value="criteria" 
            className={cn(
              "py-1.5 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none whitespace-nowrap",
              isMobile ? "px-2 text-xs" : "px-3 text-sm"
            )}
          >
            Critères
          </TabsTrigger>
          <TabsTrigger 
            value="status" 
            className={cn(
              "py-1.5 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none whitespace-nowrap",
              isMobile ? "px-2 text-xs" : "px-3 text-sm"
            )}
          >
            Statut
          </TabsTrigger>
          <TabsTrigger 
            value="actions" 
            className={cn(
              "py-1.5 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none whitespace-nowrap",
              isMobile ? "px-2 text-xs" : "px-3 text-sm"
            )}
          >
            Actions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-0 md:mt-1 pb-16">
          <LeadForm 
            lead={lead} 
            onSubmit={handleSubmit}
            onChange={handleDataChange}
            onCancel={() => navigate('/pipeline')} 
            activeTab="general"
            isSubmitting={isSaving}
            hideSubmitButton={true}
          />
        </TabsContent>
        
        <TabsContent value="criteria" className="mt-0 md:mt-1 pb-16">
          <LeadForm 
            lead={lead} 
            onSubmit={handleSubmit}
            onChange={handleDataChange}
            onCancel={() => navigate('/pipeline')} 
            activeTab="criteria"
            isSubmitting={isSaving}
            hideSubmitButton={true}
          />
        </TabsContent>
        
        <TabsContent value="status" className="mt-0 md:mt-1 pb-16">
          <LeadForm 
            lead={lead} 
            onSubmit={handleSubmit}
            onChange={handleDataChange}
            onCancel={() => navigate('/pipeline')} 
            activeTab="status"
            isSubmitting={isSaving}
            hideSubmitButton={true}
          />
        </TabsContent>
        
        <TabsContent value="actions" className="mt-0 md:mt-1 pb-16">
          {lead && (
            <ActionsPanel 
              lead={lead}
              getActionTypeIcon={getActionTypeIcon}
              onMarkComplete={markActionComplete}
              onAddAction={handleAddAction}
            />
          )}
        </TabsContent>
      </Tabs>

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

      {lead && (
        <FloatingActionButtons 
          onAddAction={handleAddAction} 
          phoneNumber={lead.phone} 
          email={lead.email} 
        />
      )}
    </div>
  );
};

export default LeadEdit;
