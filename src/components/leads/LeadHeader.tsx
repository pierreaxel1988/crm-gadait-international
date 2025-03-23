
import React from 'react';
import { ArrowLeft, Plus, Trash2, MapPin, Euro, Save, Loader2 } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import CustomButton from '@/components/ui/CustomButton';
import TagBadge from '@/components/common/TagBadge';
import { formatBudget } from '@/services/utils/leadMappers';

interface LeadHeaderProps {
  lead?: LeadDetailed;
  onBack: () => void;
  onAddAction: () => void;
  onDelete: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

const LeadHeader: React.FC<LeadHeaderProps> = ({
  lead,
  onBack,
  onAddAction,
  onDelete,
  onSave,
  isSaving = false,
  hasChanges = false,
}) => {
  // Use the formatBudget utility function
  const getBudgetDisplay = () => {
    if (!lead) return null;
    
    return formatBudget(lead.budgetMin, lead.budget, lead.currency);
  };

  return (
    <div className="flex flex-col gap-3 sticky top-0 z-10 bg-white pb-3 pt-3 px-3 border-b border-gray-100 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CustomButton 
            variant="outline" 
            onClick={onBack} 
            className="w-auto p-2 rounded border-chocolate-light text-chocolate-dark hover:bg-chocolate-light/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </CustomButton>
          <div>
            <h1 className="text-2xl md:text-3xl font-futura">
              {lead ? `${lead.name}` : 'Nouveau Lead'}
            </h1>
            <p className="text-chocolate-dark font-futuraLight">
              {lead ? 'Modifier les informations du lead' : 'Ajouter un nouveau lead'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onSave && (
            <CustomButton 
              variant="chocolate" 
              onClick={onSave} 
              disabled={isSaving || !hasChanges}
              className="w-auto p-2 rounded text-white"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </CustomButton>
          )}
          <CustomButton 
            variant="outline" 
            onClick={onAddAction} 
            className="w-auto p-2 rounded text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 border-zinc-800"
          >
            <Plus className="h-4 w-4" />
          </CustomButton>
          {lead && (
            <CustomButton 
              variant="outline" 
              onClick={onDelete} 
              className="w-auto p-2 rounded text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            >
              <Trash2 className="h-4 w-4" />
            </CustomButton>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-1">
        {/* Display tags */}
        {lead && lead.tags && lead.tags.length > 0 && (
          lead.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))
        )}
        
        {/* Display budget if available */}
        {lead && getBudgetDisplay() && (
          <div className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800">
            <Euro className="h-3 w-3" />
            <span>{getBudgetDisplay()}</span>
          </div>
        )}
        
        {/* Display location if available */}
        {lead && lead.desiredLocation && (
          <div className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800">
            <MapPin className="h-3 w-3" />
            <span>{lead.desiredLocation}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadHeader;
