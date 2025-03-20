
import React from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
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
  return (
    <div className="flex flex-col gap-3">
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
            <h1 className="text-2xl md:text-3xl font-futuraMd">
              {lead ? `${lead.name}` : 'Nouveau Lead'}
            </h1>
            <p className="text-muted-foreground">
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
      
      {lead && lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {lead.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadHeader;
