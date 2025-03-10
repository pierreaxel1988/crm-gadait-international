
import React from 'react';
import CustomButton from '@/components/ui/CustomButton';

interface LeadNotFoundProps {
  onNavigateBack: () => void;
}

const LeadNotFound: React.FC<LeadNotFoundProps> = ({ onNavigateBack }) => {
  return (
    <div className="p-6">
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Lead introuvable</h2>
        <p className="text-muted-foreground mt-2">Le lead que vous recherchez n'existe pas.</p>
        <CustomButton className="mt-4" variant="chocolate" onClick={onNavigateBack}>
          Retour à la liste
        </CustomButton>
      </div>
    </div>
  );
};

export default LeadNotFound;
