
import React from 'react';
import { ArrowLeft, Plus, Trash2, MapPin, Euro, Save, Loader2 } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import CustomButton from '@/components/ui/CustomButton';
import TagBadge from '@/components/common/TagBadge';
import { formatBudget } from '@/services/utils/leadMappers';
import { useIsMobile } from '@/hooks/use-mobile';

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

  return (
    <div className={`flex flex-col gap-${compact || isMobile ? '2' : '3'} sticky top-0 z-10 bg-white ${compact ? 'pb-2 pt-2 px-2' : 'pb-3 pt-3 px-3'} border-b border-gray-100 shadow-sm`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CustomButton 
            variant="outline" 
            onClick={onBack} 
            className={`w-auto ${compact || isMobile ? 'p-1.5' : 'p-2'} rounded border-chocolate-light text-chocolate-dark hover:bg-chocolate-light/10`}
          >
            <ArrowLeft className={`${compact || isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
          </CustomButton>
          <h1 className={`${compact || isMobile ? 'text-lg' : 'text-2xl md:text-3xl'} font-futura truncate max-w-[200px] sm:max-w-xs`}>
            {lead ? `${lead.name}` : 'Nouveau Lead'}
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
        <div className="flex flex-wrap gap-1.5 mt-1">
          {lead.tags && lead.tags.length > 0 && (
            lead.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} size={isMobile ? "sm" : "default"} />
            ))
          )}
          
          {getBudgetDisplay() && (
            <div className={`flex items-center gap-1 rounded-full ${isMobile ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} font-medium bg-emerald-100 text-emerald-800`}>
              <Euro className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
              <span>{getBudgetDisplay()}</span>
            </div>
          )}
          
          {lead.desiredLocation && (
            <div className={`flex items-center gap-1 rounded-full ${isMobile ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} font-medium bg-blue-100 text-blue-800`}>
              <MapPin className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
              <span>{lead.desiredLocation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadHeader;
