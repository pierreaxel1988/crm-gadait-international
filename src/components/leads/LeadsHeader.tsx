
import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '@/components/ui/CustomButton';
import { useIsMobile } from '@/hooks/use-mobile';

interface LeadsHeaderProps {
  onSortChange?: (sort: string) => void;
  onRefresh?: () => void;
  onNewLead?: () => void;
}

const LeadsHeader: React.FC<LeadsHeaderProps> = ({
  onSortChange,
  onRefresh,
  onNewLead
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return <div className="flex justify-between items-center pb-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-futura">Leads</h1>
        <p className="text-chocolate-dark font-futura">Liste de vos leads et prospects</p>
      </div>

      <div className="flex gap-3">
        <CustomButton variant="outline" className="hidden md:flex items-center gap-1.5 font-futura" onClick={() => navigate('/leads/import')}>
          <ArrowUpDown className="h-4 w-4" /> 
          Importer/Exporter
        </CustomButton>
      </div>
    </div>;
};

export default LeadsHeader;
