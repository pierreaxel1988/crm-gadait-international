
import React from 'react';
import LeadForm from '@/components/leads/LeadForm';
import { LeadDetailed } from '@/types/lead';

interface LeadFormWrapperProps {
  onSubmit: (data: LeadDetailed) => void;
  onCancel: () => void;
  adminAssignedAgent?: string | undefined;
  isSubmitting: boolean;
  currentUserTeamId?: string | undefined;
  isAdmin?: boolean;
  enforceRlsRules?: boolean;
}

const LeadFormWrapper: React.FC<LeadFormWrapperProps> = ({
  onSubmit,
  onCancel,
  adminAssignedAgent,
  isSubmitting,
  currentUserTeamId,
  isAdmin,
  // Forcer enforceRlsRules à false pour ignorer complètement les restrictions RLS
  enforceRlsRules = false 
}) => {
  console.log("[LeadFormWrapper] Render avec enforceRlsRules:", enforceRlsRules);
  console.log("[LeadFormWrapper] adminAssignedAgent:", adminAssignedAgent);
  
  return (
    <div className="luxury-card p-6 border-loro-sand">
      <LeadForm 
        onSubmit={onSubmit} 
        onCancel={onCancel}
        adminAssignedAgent={adminAssignedAgent}
        isSubmitting={isSubmitting}
        currentUserTeamId={currentUserTeamId}
        enforceRlsRules={false} // Forcer à false pour désactiver les restrictions
      />
    </div>
  );
};

export default LeadFormWrapper;
