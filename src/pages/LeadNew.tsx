
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLeadCreation } from '@/hooks/useLeadCreation';
import LeadNewHeader from '@/components/leads/new/LeadNewHeader';
import LeadErrorAlert from '@/components/leads/new/LeadErrorAlert';
import AdminAssignmentSection from '@/components/leads/new/AdminAssignmentSection';
import LeadFormWrapper from '@/components/leads/new/LeadFormWrapper';

const LeadNew = () => {
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
    setLeadStatus
  } = useLeadCreation();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <LeadNewHeader onBack={() => navigate('/leads')} />

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
        onCancel={() => navigate('/leads')}
        adminAssignedAgent={assignedAgent}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default LeadNew;
