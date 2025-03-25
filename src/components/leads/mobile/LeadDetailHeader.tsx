
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, Star, Calendar, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    <div className="bg-gradient-to-r from-loro-pearl/40 to-white backdrop-blur-sm">
      <div className="flex items-center justify-between p-3 relative">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBackClick} className="p-2 rounded-full hover:bg-loro-sand/20">
            <ArrowLeft className="h-5 w-5 text-loro-navy" />
          </Button>
          <div className="truncate">
            <h1 className="text-lg font-futura leading-tight truncate font-medium">{name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              {createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-loro-hazel/70" />
                  <span>{format(new Date(createdAt), 'dd/MM/yyyy')}</span>
                </div>
              )}
              {formattedBudget && (
                <>
                  {createdAt && <span className="text-loro-hazel/40">•</span>}
                  <span className="font-medium text-loro-hazel/90">{formattedBudget} {currency || ''}</span>
                </>
              )}
              {desiredLocation && (
                <>
                  {(createdAt || formattedBudget) && <span className="text-loro-hazel/40">•</span>}
                  <span>{desiredLocation}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <TooltipProvider>
          <div className="flex items-center gap-2">
            {phone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={`tel:${phone}`} className="p-2 rounded-full bg-gradient-to-br from-green-100 to-green-200 text-green-600 shadow-sm border border-green-200/50">
                    <Phone className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Appeler {phone}</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {email && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={`mailto:${email}`} className="p-2 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 shadow-sm border border-blue-200/50">
                    <Mail className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Envoyer un email</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-loro-sand/20">
                  <Star className="h-4 w-4 text-amber-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Marquer comme favori</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      
      <div className="px-3 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {tags && tags.map((tag, index) => (
          <TagBadge key={index} tag={tag} />
        ))}
      </div>
    </div>
  );
};

export default LeadDetailHeader;
