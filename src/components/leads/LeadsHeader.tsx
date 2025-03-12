
import React from 'react';
import { Plus } from 'lucide-react';
import CustomButton from '@/components/ui/CustomButton';

interface LeadsHeaderProps {
  onNewLead: () => void;
}

const LeadsHeader: React.FC<LeadsHeaderProps> = ({ onNewLead }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">Leads</h1>
        <p className="text-muted-foreground">Gérez vos leads et prospects</p>
      </div>
      <CustomButton 
        className="bg-primary text-white flex items-center gap-1.5 w-full sm:w-auto"
        onClick={onNewLead}
      >
        <Plus className="h-4 w-4" /> Nouveau Lead
      </CustomButton>
    </div>
  );
};

export default LeadsHeader;
