
import React from 'react';
import LeadForm from '@/components/leads/LeadForm';
import { LeadDetailed } from '@/types/lead';

interface LeadFormWrapperProps {
  onSubmit: (data: LeadDetailed) => void;
  onCancel: () => void;
  adminAssignedAgent?: string | undefined;
  isSubmitting: boolean;
}

const LeadFormWrapper: React.FC<LeadFormWrapperProps> = ({
  onSubmit,
  onCancel,
  adminAssignedAgent,
  isSubmitting
}) => {
  console.log("LeadFormWrapper - adminAssignedAgent:", adminAssignedAgent);
  
  return (
    <div className="luxury-card p-6 border-loro-sand">
      <LeadForm 
        onSubmit={onSubmit} 
        onCancel={onCancel}
        adminAssignedAgent={adminAssignedAgent}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default LeadFormWrapper;
