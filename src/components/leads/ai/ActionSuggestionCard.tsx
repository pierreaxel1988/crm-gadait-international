
import React from 'react';
import { CalendarIcon, CheckIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AISuggestedAction } from '@/services/aiActionSuggestionService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ActionSuggestionCardProps {
  suggestion: AISuggestedAction;
  onImplement: (suggestion: AISuggestedAction) => void;
  onDismiss: (suggestion: AISuggestedAction) => void;
}

export function ActionSuggestionCard({ suggestion, onImplement, onDismiss }: ActionSuggestionCardProps) {
  const isMobile = useIsMobile();
  
  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'Call': return <span className="bg-[#F8E2E8] text-[#D05A76] px-2 py-0.5 rounded-full text-[10px] font-futura">Appel</span>;
      case 'Visites': return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[10px] font-futura">Visite</span>;
      case 'Compromis': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-futura">Compromis</span>;
      case 'Acte de vente': return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[10px] font-futura">Acte de vente</span>;
      case 'Contrat de Location': return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-futura">Contrat Location</span>;
      case 'Propositions': return <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-[10px] font-futura">Proposition</span>;
      case 'Follow up': return <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full text-[10px] font-futura">Follow-up</span>;
      case 'Estimation': return <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-[10px] font-futura">Estimation</span>;
      case 'Prospection': return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-[10px] font-futura">Prospection</span>;
      case 'Admin': return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-[10px] font-futura">Admin</span>;
      default: return null;
    }
  };

  const formattedDate = format(suggestion.scheduledDate, 'dd/MM/yyyy à HH:mm', { locale: fr });

  const cardClasses = cn(
    "border border-loro-navy/10 bg-loro-pearl/20 rounded-md overflow-hidden",
    "w-full box-border",
    isMobile ? "p-2 sm:p-3" : "p-4"
  );

  return (
    <div className={cardClasses}>
      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap w-full">
        <div className="flex-shrink-0">
          {getActionTypeIcon(suggestion.actionType)}
        </div>
        <div className="flex-shrink-0 text-[10px] text-gray-500 bg-white/80 px-2 py-0.5 rounded-full">
          <CalendarIcon className="inline h-3 w-3 mr-1" />
          {formattedDate}
        </div>
      </div>
      
      <p className={cn(
        "text-loro-navy/90 mb-3 w-full break-words whitespace-normal overflow-hidden px-0.5",
        isMobile ? "text-xs sm:text-sm" : "text-base"
      )}>
        {suggestion.notes}
      </p>
      
      <div className="flex justify-end items-center gap-2 w-full">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-rose-600 hover:bg-rose-50 hover:text-rose-700",
            isMobile ? "h-7 px-1.5 text-[10px] sm:h-8 sm:px-2 sm:text-xs" : "h-9 px-3 text-sm"
          )}
          onClick={() => onDismiss(suggestion)}
        >
          <XIcon className={cn("h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-1.5")} />
          Ignorer
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "border-loro-navy text-loro-navy hover:bg-loro-pearl/40",
            isMobile ? "h-7 px-1.5 text-[10px] sm:h-8 sm:px-2 sm:text-xs" : "h-9 px-3 text-sm"
          )}
          onClick={() => onImplement(suggestion)}
        >
          <CheckIcon className={cn("h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-1.5")} />
          Appliquer
        </Button>
      </div>
    </div>
  );
}
