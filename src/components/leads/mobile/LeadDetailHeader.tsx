
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import TagBadge, { LeadTag } from '@/components/common/TagBadge';

interface LeadDetailHeaderProps {
  name: string;
  createdAt?: string;
  phone?: string;
  email?: string;
  budget?: string;
  currency?: string;
  desiredLocation?: string;
  onBackClick: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  tags?: LeadTag[];
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({
  name,
  createdAt,
  phone,
  email,
  budget,
  currency,
  desiredLocation,
  onBackClick,
  onSave,
  isSaving,
  hasChanges,
  tags
}) => {
  // Format the budget number with thousand separators
  const formatBudget = (budget?: string) => {
    if (!budget) return '';
    
    // Remove any existing non-numeric characters
    const numericValue = budget.replace(/[^\d]/g, '');
    if (!numericValue) return '';
    
    // Convert to number and format with locale
    const budgetNumber = parseInt(numericValue, 10);
    if (isNaN(budgetNumber)) return budget;
    
    return budgetNumber.toLocaleString('fr-FR');
  };
  
  const formattedBudget = formatBudget(budget);
  
  return (
    <div className="flex items-center justify-between p-3 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBackClick} className="p-2 text-chocolate-dark">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="truncate">
          <h1 className="text-lg font-futura leading-tight truncate text-chocolate-dark">{name}</h1>
          <p className="text-xs text-muted-foreground">
            {createdAt && format(new Date(createdAt), 'dd/MM/yyyy')}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {formattedBudget && `${formattedBudget} ${currency || ''}`}
            {formattedBudget && desiredLocation && ' • '}
            {desiredLocation}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {phone && (
          <a 
            href={`tel:${phone}`} 
            className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
          >
            <Phone className="h-4 w-4" />
          </a>
        )}
        {email && (
          <a 
            href={`mailto:${email}`} 
            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
          >
            <Mail className="h-4 w-4" />
          </a>
        )}
        {tags && tags.length > 0 && <TagBadge tag={tags[0]} />}
      </div>
    </div>
  );
};

export default LeadDetailHeader;
