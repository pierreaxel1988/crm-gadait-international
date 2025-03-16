
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LeadDetailed } from '@/types/lead';
import { updateLead, deleteLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import FloatingActionButtons from '@/components/ui/FloatingActionButtons';
import { useLeadActions } from '@/hooks/useLeadActions';
import LeadHeader from '@/components/leads/LeadHeader';
import ActionDialog from '@/components/leads/actions/ActionDialog';
import { useLeadData } from '@/hooks/useLeadData';
import LeadLoadingState from '@/components/leads/LeadLoadingState';
import LeadNotFound from '@/components/leads/LeadNotFound';
import LeadTabs from '@/components/leads/LeadTabs';

const LeadEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('informations');
  const navigate = useNavigate();
  
  const { lead, setLead, isLoading } = useLeadData(id);
  
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

  if (isLoading) {
    return <LeadLoadingState />;
  }

  if (!lead && id) {
    return <LeadNotFound />;
  }
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <LeadHeader 
        lead={lead} 
        onBack={() => navigate('/leads')} 
        onAddAction={handleAddAction} 
        onDelete={handleDelete}
      />

      {lead && (
        <LeadTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lead={lead}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/leads')}
          markActionComplete={markActionComplete}
          getActionTypeIcon={getActionTypeIcon}
          onAddAction={handleAddAction}
        />
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

      {lead && <FloatingActionButtons onAddAction={handleAddAction} phoneNumber={lead.phone} email={lead.email} />}
    </div>
  );
};

export default LeadEdit;
