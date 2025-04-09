
import React from 'react';
import { ArrowLeft, Plus, Trash2, MapPin, Euro, Save, Loader2 } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import CustomButton from '@/components/ui/CustomButton';
import { formatBudget } from '@/services/utils/leadMappers';
import { useIsMobile } from '@/hooks/use-mobile';
import LeadTag from '@/components/common/LeadTag';

interface LeadHeaderProps {
  lead?: LeadDetailed;
  onBack: () => void;
  onAddAction: () => void;
  onDelete: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
  compact?: boolean;
}

const LeadHeader: React.FC<LeadHeaderProps> = ({
  lead,
  onBack,
  onAddAction,
  onDelete,
  onSave,
  isSaving = false,
  hasChanges = false,
  compact = false,
}) => {
  const isMobile = useIsMobile();
  
  // Use the formatBudget utility function
  const getBudgetDisplay = () => {
    if (!lead) return null;
    
    return formatBudget(lead.budgetMin, lead.budget, lead.currency);
  };

  // Get status colors for the lead
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'New':
        return { bg: 'bg-[#DCE4E3]', text: 'text-[#4C5C59]' };
      case 'Contacted':
        return { bg: 'bg-[#F3E9D6]', text: 'text-[#B58C59]' };
      case 'Qualified':
        return { bg: 'bg-[#F5F3EE]', text: 'text-[#7A6C5D]' };
      case 'Proposal':
        return { bg: 'bg-[#F5F3EE]', text: 'text-[#7A6C5D]' };
      case 'Visit':
        return { bg: 'bg-[#EBD5CE]', text: 'text-[#D05A76]' };
      case 'Offer':
      case 'Offre':
        return { bg: 'bg-[#F3E9D6]', text: 'text-[#B58C59]' };
      case 'Deposit':
        return { bg: 'bg-[#F5F3EE]', text: 'text-[#7A6C5D]' };
      case 'Signed':
      case 'Gagné':
        return { bg: 'bg-[#F2FCE2]', text: 'text-green-700' };
      case 'Perdu':
        return { bg: 'bg-red-100', text: 'text-red-700' };
      default:
        return { bg: 'bg-[#F5F3EE]', text: 'text-[#7A6C5D]' };
    }
  };

  return (
    <div className={`flex flex-col gap-${compact || isMobile ? '2' : '3'} sticky top-0 z-40 bg-white ${compact ? 'pb-2 pt-2 px-2' : 'pb-3 pt-3 px-3'} border-b border-gray-100 shadow-sm`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CustomButton 
            variant="outline" 
            onClick={onBack} 
            className={`w-auto ${compact || isMobile ? 'p-1.5' : 'p-2'} rounded border-chocolate-light text-chocolate-dark hover:bg-chocolate-light/10`}
          >
            <ArrowLeft className={`${compact || isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
          </CustomButton>
          <h1 className={`${compact || isMobile ? 'text-lg' : 'text-2xl md:text-3xl'} font-futura truncate max-w-[200px] sm:max-w-xs md:max-w-lg`}>
            {lead ? lead.name : 'Nouveau Lead'}
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          {onSave && (
            <CustomButton 
              variant="chocolate" 
              onClick={onSave} 
              disabled={isSaving || !hasChanges}
              className={`w-auto ${compact || isMobile ? 'p-1.5' : 'p-2'} rounded text-white transition-all ${hasChanges ? 'bg-chocolate-dark' : 'bg-chocolate-dark/50'}`}
              title="Enregistrer les modifications"
            >
              {isSaving ? (
                <Loader2 className={`${compact || isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} animate-spin`} />
              ) : (
                <Save className={`${compact || isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
              )}
            </CustomButton>
          )}
          <CustomButton 
            variant="outline" 
            onClick={onAddAction} 
            className={`w-auto ${compact || isMobile ? 'p-1.5' : 'p-2'} rounded text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 border-zinc-800`}
            title="Ajouter une action"
          >
            <Plus className={`${compact || isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
          </CustomButton>
          {lead && !compact && (
            <CustomButton 
              variant="outline" 
              onClick={onDelete} 
              className={`w-auto ${compact || isMobile ? 'p-1.5' : 'p-2'} rounded text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30`}
              title="Supprimer"
            >
              <Trash2 className={`${compact || isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
            </CustomButton>
          )}
        </div>
      </div>
      
      {!compact && lead && (
        <div className="flex flex-wrap items-center text-sm gap-1.5 rounded-sm mx-0 px-0 py-[4px] bg-black/0">
          {lead.status && (
            <LeadTag 
              label={lead.status} 
              bgColor={getStatusColors(lead.status).bg} 
              textColor={getStatusColors(lead.status).text} 
              className="font-futuraLight" 
            />
          )}
          
          {lead.taskType && (
            <LeadTag 
              label={lead.taskType} 
              bgColor={lead.taskType === 'Call' ? 'bg-[#EBD5CE]' : 'bg-[#F3E9D6]'} 
              textColor={lead.taskType === 'Call' ? 'text-[#D05A76]' : 'text-[#B58C59]'} 
              className="font-futuraLight" 
            />
          )}
          
          {lead.desiredLocation && (
            <LeadTag 
              label={lead.desiredLocation} 
              bgColor="bg-[#F5F3EE]" 
              textColor="text-[#7A6C5D]" 
              className="font-futuraLight" 
            />
          )}
          
          {lead.budget && (
            <LeadTag 
              label={getBudgetDisplay() || ''} 
              bgColor="bg-[#F5F3EE]" 
              textColor="text-[#7A6C5D]" 
              className="font-futuraLight min-w-[100px] text-center" 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default LeadHeader;
