
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLeadCreation } from '@/hooks/useLeadCreation';
import LeadNewHeader from '@/components/leads/new/LeadNewHeader';
import LeadErrorAlert from '@/components/leads/new/LeadErrorAlert';
import AdminAssignmentSection from '@/components/leads/new/AdminAssignmentSection';
import LeadFormWrapper from '@/components/leads/new/LeadFormWrapper';

const LeadNew: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { 
    assignedAgent,
    pipelineType,
    leadStatus,
    isSubmitting,
    error,
    availableStatuses,
    handleSubmit,
    handleAgentChange,
    handlePipelineTypeChange,
    setLeadStatus,
    currentUserTeamId
  } = useLeadCreation();

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  console.log("LeadNew render - currentUserTeamId:", currentUserTeamId);
  console.log("LeadNew render - isAdmin:", isAdmin);
  console.log("LeadNew render - assignedAgent:", assignedAgent);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <LeadNewHeader onBack={handleCancel} />

      {error && <LeadErrorAlert error={error} />}

      {isAdmin && (
        <AdminAssignmentSection 
          pipelineType={pipelineType}
          leadStatus={leadStatus}
          assignedAgent={assignedAgent}
          availableStatuses={availableStatuses}
          onPipelineTypeChange={handlePipelineTypeChange}
          onStatusChange={setLeadStatus}
          onAgentChange={handleAgentChange}
        />
      )}

      <LeadFormWrapper 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        adminAssignedAgent={assignedAgent}
        isSubmitting={isSubmitting}
        currentUserTeamId={currentUserTeamId}
        isAdmin={isAdmin}
        enforceRlsRules={false} // Set to false to disable RLS enforcement in the UI
      />
    </div>
  );
};

export default LeadNew;
