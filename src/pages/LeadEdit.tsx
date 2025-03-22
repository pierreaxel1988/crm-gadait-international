
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
import { useAuth } from '@/hooks/useAuth';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';

const LeadEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadDetailed | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('actions');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [assignedAgent, setAssignedAgent] = useState<string | undefined>(undefined);
  
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
          setLead(leadData || undefined);
          if (leadData) {
            setAssignedAgent(leadData.assignedTo);
          }
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
      if (isAdmin && assignedAgent !== lead?.assignedTo) {
        data.assignedTo = assignedAgent;
      }
      
      const updatedLead = await updateLead(data);
      if (updatedLead) {
        toast({
          title: "Lead mis à jour",
          description: "Les modifications ont été enregistrées avec succès."
        });
        navigate('/leads');
      }
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

      {isAdmin && lead && (
        <div className="luxury-card p-4 border-loro-sand">
          <h2 className="text-lg font-medium mb-4">Réattribution du lead</h2>
          <TeamMemberSelect
            value={assignedAgent}
            onChange={(value) => setAssignedAgent(value)}
            label="Attribuer ce lead à"
          />
        </div>
      )}

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="w-full bg-background border-b flex justify-between overflow-x-auto">
          <TabsTrigger 
            value="general" 
            className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
          >
            Général
          </TabsTrigger>
          <TabsTrigger 
            value="criteria" 
            className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
          >
            Critères
          </TabsTrigger>
          <TabsTrigger 
            value="status" 
            className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
          >
            Statut
          </TabsTrigger>
          <TabsTrigger 
            value="actions" 
            className="py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-chocolate-dark data-[state=active]:shadow-none rounded-none"
          >
            Actions/Tâches
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-4">
          <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={() => navigate('/leads')} activeTab="general" />
        </TabsContent>
        
        <TabsContent value="criteria" className="mt-4">
          <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={() => navigate('/leads')} activeTab="criteria" />
        </TabsContent>
        
        <TabsContent value="status" className="mt-4">
          <LeadForm lead={lead} onSubmit={handleSubmit} onCancel={() => navigate('/leads')} activeTab="status" />
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
