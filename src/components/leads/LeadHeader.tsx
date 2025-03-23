
import React from 'react';
import { ArrowLeft, Plus, Trash2, MapPin, Euro } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import CustomButton from '@/components/ui/CustomButton';
import TagBadge from '@/components/common/TagBadge';

interface LeadHeaderProps {
  lead?: LeadDetailed;
  onBack: () => void;
  onAddAction: () => void;
  onDelete: () => void;
}

const LeadHeader: React.FC<LeadHeaderProps> = ({
  lead,
  onBack,
  onAddAction,
  onDelete,
}) => {
  // Format budget to display
  const formatBudget = () => {
    if (!lead) return null;
    
    let budgetDisplay = '';
    
    if (lead.budget) {
      budgetDisplay = lead.budget;
      
      if (lead.budgetMin) {
        budgetDisplay = `${lead.budgetMin} - ${lead.budget}`;
      }
      
      if (lead.currency) {
        if (lead.currency === 'EUR') {
          budgetDisplay = `${budgetDisplay} €`;
        } else {
          budgetDisplay = `${budgetDisplay} ${lead.currency}`;
        }
      }
    }
    
    return budgetDisplay;
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
        {lead && formatBudget() && (
          <div className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800">
            <Euro className="h-3 w-3" />
            <span>{formatBudget()}</span>
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
