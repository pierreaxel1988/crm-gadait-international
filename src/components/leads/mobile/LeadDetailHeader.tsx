
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Phone, Mail, MessageCircle, Clock } from 'lucide-react';
import { convertBudgetToDisplay } from '@/utils/budgetUtils';
import { getCountryLocalTime, getCountryLocalTimeWithDetails } from '@/utils/timeUtils';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LeadDetailHeaderProps {
  name: string;
  createdAt: string;
  phone?: string;
  email?: string;
  budget?: string;
  currency?: string;
  desiredLocation?: string;
  country?: string;
  purchaseTimeframe?: string;
  onBackClick: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  tags?: string[];
  onPhoneCall?: (e: React.MouseEvent) => void;
  onWhatsAppClick?: (e: React.MouseEvent) => void;
  onEmailClick?: (e: React.MouseEvent) => void;
}

const LeadDetailHeader: React.FC<LeadDetailHeaderProps> = ({
  name,
  createdAt,
  phone,
  email,
  budget,
  currency,
  desiredLocation,
  country,
  purchaseTimeframe,
  onBackClick,
  onSave,
  isSaving,
  hasChanges,
  tags = [],
  onPhoneCall,
  onWhatsAppClick,
  onEmailClick
}) => {
  const [elapsedTime, setElapsedTime] = useState('');
  const [localTime, setLocalTime] = useState({ time: '', date: '', timezone: '' });
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateTime = () => {
      try {
        if (createdAt) {
          const date = new Date(createdAt);
          setElapsedTime(formatDistanceToNow(date, { addSuffix: true, locale: fr }));
        }
        
        if (country) {
          const details = getCountryLocalTimeWithDetails(country);
          setLocalTime(details);
        }
      } catch (error) {
        console.error("Error updating times:", error);
      }
    };
    
    // Initial update
    updateTime();
    
    // Update every minute
    intervalRef.current = setInterval(updateTime, 60000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [createdAt, country]);

  const formattedBudget = budget ? convertBudgetToDisplay(budget, currency) : '';

  return (
    <div className="p-4 bg-loro-sand">
      <div className="flex justify-between items-start mb-2">
        <button 
          onClick={onBackClick}
          className="text-chocolate-dark hover:text-chocolate-light"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={isSaving || !hasChanges}
          className={cn(
            "relative h-8 border-gray-300 hover:border-gray-400 hover:bg-gray-100",
            hasChanges && !isSaving && "border-chocolate-dark text-chocolate-dark hover:bg-chocolate-light/10 hover:border-chocolate-dark"
          )}
        >
          {isSaving ? (
            <>
              <span className="opacity-0">Sauvegarder</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 border-2 border-chocolate-dark border-t-transparent rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              <span>Sauvegarder</span>
            </>
          )}
        </Button>
      </div>
      
      <div className="mt-2">
        <h1 className="text-xl font-bold font-futura text-gray-900 line-clamp-2 mt-1">{name}</h1>
        
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Créé {elapsedTime}</span>
          </div>
          
          {country && localTime.time && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1 text-xs bg-black/5 px-2 py-1 rounded-full">
                    <Clock className="h-3 w-3" />
                    <span>{localTime.time}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="text-xs space-y-1">
                    <p>{country}</p>
                    <p>{localTime.date}</p>
                    <p>{localTime.timezone}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map(tag => (
            <span 
              key={tag} 
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-col">
            {budget && (
              <span className="text-sm font-medium">
                {formattedBudget}
              </span>
            )}
            {desiredLocation && (
              <span className="text-sm text-muted-foreground mt-0.5">
                {desiredLocation}{country ? `, ${country}` : ''}
              </span>
            )}
            {purchaseTimeframe && (
              <span className="text-xs text-muted-foreground mt-0.5">
                {purchaseTimeframe}
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            {phone && (
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border-gray-300 bg-white"
                onClick={onPhoneCall}
              >
                <Phone className="h-4 w-4 text-green-600" />
              </Button>
            )}
            
            {phone && (
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border-gray-300 bg-white"
                onClick={onWhatsAppClick}
              >
                <MessageCircle className="h-4 w-4 text-green-600" />
              </Button>
            )}
            
            {email && (
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border-gray-300 bg-white"
                onClick={onEmailClick}
              >
                <Mail className="h-4 w-4 text-blue-500" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailHeader;
