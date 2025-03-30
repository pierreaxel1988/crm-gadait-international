
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import CustomButton from '@/components/ui/CustomButton';
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

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (phone) {
      // Format phone number for WhatsApp (remove spaces and any non-digit characters except +)
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanedPhone}`, '_blank');
    }
  };
  
  const formattedBudget = formatBudget(budget);
  
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-100">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBackClick} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="truncate">
          <h1 className="text-lg font-futura leading-tight truncate">{name}</h1>
          <p className="text-xs text-zinc-400">
            {createdAt && format(new Date(createdAt), 'dd/MM/yyyy')}
          </p>
          <p className="text-xs flex items-center gap-1 text-zinc-800">
            {formattedBudget && `${formattedBudget} ${currency || ''}`}
            {formattedBudget && desiredLocation && ' • '}
            {desiredLocation}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {phone && (
          <>
            <a 
              href={`tel:${phone}`} 
              className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Phone className="h-4 w-4" />
            </a>
            <button 
              onClick={handleWhatsAppClick}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="Contacter via WhatsApp"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </>
        )}
        {email && 
          <a 
            href={`mailto:${email}`} 
            className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Mail className="h-4 w-4" />
          </a>
        }
        {tags && tags.length > 0 && <TagBadge tag={tags[0]} />}
      </div>
    </div>
  );
};

export default LeadDetailHeader;
