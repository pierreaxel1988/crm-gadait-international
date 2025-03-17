
import React, { useState } from 'react';
import { Plus, ArrowUpDown, Import } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/ui/CustomButton';
import QuickLeadImport from './QuickLeadImport';

interface LeadsHeaderProps {
  onSortChange?: (sort: string) => void;
  onRefresh?: () => void;
}

const LeadsHeader: React.FC<LeadsHeaderProps> = ({ onSortChange, onRefresh }) => {
  const navigate = useNavigate();
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <div className="flex justify-between items-center pb-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">Leads</h1>
        <p className="text-loro-hazel">Liste de vos leads et prospects</p>
      </div>

      <div className="flex gap-3">
        <CustomButton 
          variant="outline" 
          className="hidden md:flex items-center gap-1.5"
          onClick={() => navigate('/leads/import')}
        >
          <ArrowUpDown className="h-4 w-4" /> 
          Importer/Exporter
        </CustomButton>
        
        <CustomButton 
          variant="outline"
          className="flex items-center gap-1.5"
          onClick={() => setShowImportModal(true)}
        >
          <Import className="h-4 w-4" /> 
          Import Rapide
        </CustomButton>
        
        <CustomButton 
          variant="chocolate" 
          className="flex items-center gap-1.5"
          onClick={() => navigate('/leads/new')}
        >
          <Plus className="h-4 w-4" /> 
          Nouveau Lead
        </CustomButton>
      </div>

      <QuickLeadImport 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default LeadsHeader;
