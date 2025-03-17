
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LeadForm from '@/components/leads/LeadForm';
import { LeadDetailed } from '@/types/lead';
import { getLead, updateLead, deleteLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import FloatingActionButtons from '@/components/ui/FloatingActionButtons';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useLeadActions } from '@/hooks/useLeadActions';
import LeadHeader from '@/components/leads/LeadHeader';
import ActionsPanel from '@/components/leads/actions/ActionsPanel';
import ActionDialog from '@/components/leads/actions/ActionDialog';
import CustomButton from '@/components/ui/CustomButton';

const LeadEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadDetailed | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('informations');
  const navigate = useNavigate();
  
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

  useEffect(() => {
    const fetchLead = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const leadData = await getLead(id);
          setLead(leadData);
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
    };
    
    fetchLead();
  }, [id]);

  const handleSubmit = async (data: LeadDetailed) => {
    try {
      await updateLead(data);
      navigate('/leads');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications."
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lead ?')) {
      try {
        if (id) {
          await deleteLead(id);
          navigate('/leads');
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

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-chocolate-dark rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!lead && id) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold">Lead introuvable</h2>
          <p className="text-muted-foreground mt-2">Le lead que vous recherchez n'existe pas.</p>
          <CustomButton className="mt-4" variant="chocolate" onClick={() => navigate('/leads')}>
            Retour à la liste
          </CustomButton>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <LeadHeader 
        lead={lead} 
        onBack={() => navigate('/leads')} 
        onAddAction={handleAddAction} 
        onDelete={handleDelete}
      />

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="w-full bg-background border-b flex justify-between overflow-x-auto">
          <TabsTrigger 
            value="informations" 
            className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
          >
            Informations générales
          </TabsTrigger>
          <TabsTrigger 
            value="criteres" 
            className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
          >
            Critères de recherche
          </TabsTrigger>
          <TabsTrigger 
            value="statut" 
            className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
          >
            Statut et suivi
          </TabsTrigger>
          <TabsTrigger 
            value="actions" 
            className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
          >
            Actions/Tâches
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="informations" className="mt-4">
          <div className="luxury-card p-6">
            <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={() => navigate('/leads')} activeTab="informations" />
          </div>
        </TabsContent>
        
        <TabsContent value="criteres" className="mt-4">
          <div className="luxury-card p-6">
            <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={() => navigate('/leads')} activeTab="criteres" />
          </div>
        </TabsContent>
        
        <TabsContent value="statut" className="mt-4">
          <div className="luxury-card p-6">
            <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={() => navigate('/leads')} activeTab="statut" />
          </div>
        </TabsContent>
        
        <TabsContent value="actions" className="mt-4">
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

      {lead && <FloatingActionButtons onAddAction={handleAddAction} phoneNumber={lead.phone} email={lead.email} />}
    </div>
  );
};

export default LeadEdit;
