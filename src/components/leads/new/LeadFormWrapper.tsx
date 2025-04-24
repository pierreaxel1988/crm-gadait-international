
import React, { useEffect } from 'react';
import LeadForm from '@/components/leads/LeadForm';
import { LeadDetailed } from '@/types/lead';

interface LeadFormWrapperProps {
  onSubmit: (data: LeadDetailed) => void;
  onCancel: () => void;
  adminAssignedAgent?: string | undefined;
  isSubmitting: boolean;
  currentUserTeamId?: string | undefined;
  isAdmin?: boolean;
}

const LeadFormWrapper: React.FC<LeadFormWrapperProps> = ({
  onSubmit,
  onCancel,
  adminAssignedAgent,
  isSubmitting,
  currentUserTeamId,
  isAdmin
}) => {
  useEffect(() => {
    console.log("LeadFormWrapper - adminAssignedAgent:", adminAssignedAgent);
    console.log("LeadFormWrapper - currentUserTeamId:", currentUserTeamId);
    console.log("LeadFormWrapper - isAdmin:", isAdmin);
  }, [adminAssignedAgent, currentUserTeamId, isAdmin]);
  
  return (
    <div className="luxury-card p-6 border-loro-sand">
      <LeadForm 
        onSubmit={onSubmit} 
        onCancel={onCancel}
        adminAssignedAgent={adminAssignedAgent}
        isSubmitting={isSubmitting}
        currentUserTeamId={currentUserTeamId}
      />
    </div>
  );
};

export default LeadFormWrapper;
