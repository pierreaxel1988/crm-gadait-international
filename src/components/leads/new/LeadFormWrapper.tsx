
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
  enforceRlsRules?: boolean; // Added this line to fix the TypeScript error
}

const LeadFormWrapper: React.FC<LeadFormWrapperProps> = ({
  onSubmit,
  onCancel,
  adminAssignedAgent,
  isSubmitting,
  currentUserTeamId,
  isAdmin,
  enforceRlsRules = false // Default to false
}) => {
  return (
    <div className="luxury-card p-6 border-loro-sand">
      <LeadForm 
        onSubmit={onSubmit} 
        onCancel={onCancel}
        adminAssignedAgent={adminAssignedAgent}
        isSubmitting={isSubmitting}
        currentUserTeamId={currentUserTeamId}
        enforceRlsRules={enforceRlsRules} // Pass the prop to LeadForm
      />
    </div>
  );
};

export default LeadFormWrapper;
