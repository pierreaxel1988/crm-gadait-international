
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
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
              className="h-8 w-8 flex items-center justify-center rounded-full border border-white"
              aria-label="Appeler"
            >
              <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                <Phone className="h-4 w-4" />
              </div>
            </a>
            <button 
              onClick={handleWhatsAppClick}
              className="h-8 w-8 flex items-center justify-center rounded-full border border-white"
              aria-label="Contacter via WhatsApp"
            >
              <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  <path d="M9 10a.5.5 0 0 1 1 0c0 1.97 1.53 3.5 3.5 3.5a.5.5 0 0 1 0 1c-2.47 0-4.5-2.02-4.5-4.5" />
                </svg>
              </div>
            </button>
          </>
        )}
        {email && 
          <a 
            href={`mailto:${email}`} 
            className="h-8 w-8 flex items-center justify-center rounded-full border border-white"
            aria-label="Envoyer un email"
          >
            <div className="bg-loro-sand/20 h-full w-full flex items-center justify-center text-zinc-900 text-lg font-medium rounded-full">
              <Mail className="h-4 w-4" />
            </div>
          </a>
        }
        {tags && tags.length > 0 && <TagBadge tag={tags[0]} />}
      </div>
    </div>
  );
};

export default LeadDetailHeader;
