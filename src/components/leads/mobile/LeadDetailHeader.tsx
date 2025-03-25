
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, Star, Calendar, Share2, MapPin } from 'lucide-react';
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
    <div className="bg-loro-white dark:bg-loro-navy/90 shadow-sm">
      {/* Back button and name */}
      <div className="flex items-center pt-4 px-4 pb-1">
        <Button variant="ghost" size="icon" onClick={onBackClick} className="p-2 mr-2 rounded-full hover:bg-loro-pearl/20">
          <ArrowLeft className="h-5 w-5 text-loro-hazel dark:text-loro-pearl" />
        </Button>
        <h1 className="text-xl font-futuraMd tracking-wide leading-tight text-loro-navy dark:text-loro-pearl">
          {name}
        </h1>
      </div>
      
      {/* Lead information */}
      <div className="px-5 pb-3">
        <div className="flex flex-wrap items-center gap-x-3 text-xs mt-0.5 text-loro-navy/70 dark:text-loro-pearl/70">
          {createdAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="font-futura">{format(new Date(createdAt), 'dd MMM yyyy')}</span>
            </div>
          )}
          
          {formattedBudget && (
            <div className="flex items-center gap-1">
              <span className="font-futuraLight text-loro-hazel dark:text-loro-sand">{formattedBudget} {currency || ''}</span>
            </div>
          )}
          
          {desiredLocation && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="font-futura">{desiredLocation}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between items-center px-4 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {tags && tags.map((tag, index) => (
            <TagBadge key={index} tag={tag} />
          ))}
        </div>
        
        <TooltipProvider>
          <div className="flex items-center gap-2">
            {phone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={`tel:${phone}`} className="p-2 rounded-full bg-gradient-to-br from-loro-sand/10 to-loro-sand/30 text-loro-hazel shadow-sm border border-loro-sand/20">
                    <Phone className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent className="bg-loro-white border-loro-pearl">
                  <p className="font-futura text-loro-navy text-xs">{phone}</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {email && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={`mailto:${email}`} className="p-2 rounded-full bg-gradient-to-br from-loro-sand/10 to-loro-sand/30 text-loro-hazel shadow-sm border border-loro-sand/20">
                    <Mail className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent className="bg-loro-white border-loro-pearl">
                  <p className="font-futura text-loro-navy text-xs">{email}</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 shadow-sm border border-amber-200/50">
                  <Star className="h-4 w-4 text-amber-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-loro-white border-loro-pearl">
                <p className="font-futura text-loro-navy text-xs">Marquer comme favori</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      
      <Separator className="bg-loro-pearl/30 dark:bg-loro-sand/20" />
    </div>
  );
};

export default LeadDetailHeader;
