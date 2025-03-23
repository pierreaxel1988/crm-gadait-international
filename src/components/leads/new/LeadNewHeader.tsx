
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import CustomButton from '@/components/ui/CustomButton';

interface LeadNewHeaderProps {
  onBack: () => void;
}

const LeadNewHeader: React.FC<LeadNewHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex items-center gap-2">
      <CustomButton 
        variant="outline" 
        onClick={onBack}
        className="w-auto p-2 rounded border-chocolate-light text-chocolate-dark hover:bg-chocolate-light/10"
      >
        <ArrowLeft className="h-4 w-4" />
      </CustomButton>
      <div>
        <h1 className="text-2xl md:text-3xl font-futura text-loro-navy">Nouveau Lead</h1>
        <p className="text-chocolate-dark font-futuraLight">Ajouter un nouveau lead dans le système</p>
      </div>
    </div>
  );
};

export default LeadNewHeader;
