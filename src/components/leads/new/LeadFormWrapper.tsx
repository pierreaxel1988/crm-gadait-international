
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
  isAdmin?: boolean;
}

const LeadFormWrapper: React.FC<LeadFormWrapperProps> = ({
  onSubmit,
  onCancel,
  adminAssignedAgent,
  isSubmitting,
  currentUserTeamId,
}) => {
  const { isAdmin } = useAuth();
  
  console.log("[LeadFormWrapper] Render - isAdmin:", isAdmin);
  console.log("[LeadFormWrapper] adminAssignedAgent:", adminAssignedAgent);
  console.log("[LeadFormWrapper] currentUserTeamId:", currentUserTeamId);
  
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
