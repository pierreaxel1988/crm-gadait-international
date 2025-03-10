
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LeadDetailed } from '@/types/lead';
import { getLead, updateLead, deleteLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import FloatingActionButtons from '@/components/ui/FloatingActionButtons';
import { useLeadActions } from '@/hooks/useLeadActions';
import LeadHeader from '@/components/leads/LeadHeader';
import ActionDialog from '@/components/leads/actions/ActionDialog';
import LeadTabs from '@/components/leads/edit/LeadTabs';
import LeadEditLoader from '@/components/leads/edit/LeadEditLoader';
import LeadNotFound from '@/components/leads/edit/LeadNotFound';

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
    if (id) {
      try {
        const leadData = getLead(id);
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
  }, [id]);

  const handleSubmit = (data: LeadDetailed) => {
    try {
      updateLead(data);
      navigate('/leads');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications."
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lead ?')) {
      try {
        if (id) {
          deleteLead(id);
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

  const navigateBack = () => navigate('/leads');

  if (isLoading) {
    return <LeadEditLoader />;
  }

  if (!lead && id) {
    return <LeadNotFound onNavigateBack={navigateBack} />;
  }
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <LeadHeader 
        lead={lead} 
        onBack={navigateBack} 
        onAddAction={handleAddAction} 
        onDelete={handleDelete}
      />

      <LeadTabs
        lead={lead}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleSubmit={handleSubmit}
        onNavigateBack={navigateBack}
        getActionTypeIcon={getActionTypeIcon}
        markActionComplete={markActionComplete}
        onAddAction={handleAddAction}
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

      {lead && <FloatingActionButtons onAddAction={handleAddAction} phoneNumber={lead.phone} email={lead.email} />}
    </div>
  );
};

export default LeadEdit;
