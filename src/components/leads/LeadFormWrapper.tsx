
import React from 'react';
import LeadForm from '@/components/leads/LeadForm';
import { LeadDetailed } from '@/types/lead';
import { useAuth } from '@/hooks/useAuth';

interface LeadFormWrapperProps {
  onSubmit: (data: LeadDetailed) => void;
  onCancel: () => void;
  adminAssignedAgent?: string | undefined;
  isSubmitting: boolean;
  currentUserTeamId?: string | undefined;
  enforceRlsRules?: boolean;
  lead?: LeadDetailed;
}

const LeadFormWrapper: React.FC<LeadFormWrapperProps> = ({
  onSubmit,
  onCancel,
  adminAssignedAgent,
  isSubmitting,
  currentUserTeamId,
  lead,
  enforceRlsRules = true, // Default to true for RLS enforcement
}) => {
  const { isAdmin } = useAuth();
  
  console.log("[LeadFormWrapper] Render - isAdmin:", isAdmin);
  console.log("[LeadFormWrapper] adminAssignedAgent:", adminAssignedAgent);
  console.log("[LeadFormWrapper] currentUserTeamId:", currentUserTeamId);
  console.log("[LeadFormWrapper] Lead ID:", lead?.id);
  console.log("[LeadFormWrapper] enforceRlsRules:", enforceRlsRules);
  
  return (
    <div className="luxury-card p-6 border-loro-sand">
      <LeadForm 
        lead={lead}
        onSubmit={onSubmit} 
        onCancel={onCancel}
        adminAssignedAgent={adminAssignedAgent}
        isSubmitting={isSubmitting}
        currentUserTeamId={currentUserTeamId}
        enforceRlsRules={enforceRlsRules}
      />
    </div>
  );
};

export default LeadFormWrapper;
