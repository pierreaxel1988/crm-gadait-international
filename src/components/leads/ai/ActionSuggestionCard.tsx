
import React from 'react';
import { CalendarIcon, CheckIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AISuggestedAction } from '@/services/aiActionSuggestionService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ActionSuggestionCardProps {
  suggestion: AISuggestedAction;
  onImplement: (suggestion: AISuggestedAction) => void;
  onDismiss: (suggestion: AISuggestedAction) => void;
}

export function ActionSuggestionCard({ suggestion, onImplement, onDismiss }: ActionSuggestionCardProps) {
  const getActionTypeIcon = (type: string) => {
    const baseClasses = "text-[9px] font-futura px-1 py-0.5 rounded-full";
    switch (type) {
      case 'Call': return <span className={cn(baseClasses, "bg-[#F8E2E8]/50 text-[#D05A76]")}>Appel</span>;
      case 'Visites': return <span className={cn(baseClasses, "bg-purple-100/50 text-purple-800")}>Visite</span>;
      case 'Compromis': return <span className={cn(baseClasses, "bg-amber-100/50 text-amber-800")}>Compromis</span>;
      case 'Acte de vente': return <span className={cn(baseClasses, "bg-red-100/50 text-red-800")}>Acte de vente</span>;
      case 'Contrat de Location': return <span className={cn(baseClasses, "bg-blue-100/50 text-blue-800")}>Location</span>;
      case 'Propositions': return <span className={cn(baseClasses, "bg-indigo-100/50 text-indigo-800")}>Proposition</span>;
      case 'Follow up': return <span className={cn(baseClasses, "bg-pink-100/50 text-pink-800")}>Follow-up</span>;
      case 'Estimation': return <span className={cn(baseClasses, "bg-teal-100/50 text-teal-800")}>Estimation</span>;
      case 'Prospection': return <span className={cn(baseClasses, "bg-orange-100/50 text-orange-800")}>Prospection</span>;
      case 'Admin': return <span className={cn(baseClasses, "bg-gray-100/50 text-gray-800")}>Admin</span>;
      default: return null;
    }
  };

  const formattedDate = format(suggestion.scheduledDate, 'dd/MM/yyyy à HH:mm', { locale: fr });

  return (
    <div className="border border-loro-navy/5 bg-loro-pearl/10 rounded-lg p-2 animate-[fade-in_0.3s_ease-out] relative w-full">
      <div className="flex items-start justify-between gap-1 mb-1 w-full">
        <div className="flex items-center gap-1 flex-shrink-0">
          {getActionTypeIcon(suggestion.actionType)}
        </div>
        <div className="flex items-center text-[9px] text-gray-500 bg-white/60 px-1 py-0.5 rounded-full truncate flex-shrink-0">
          <CalendarIcon className="h-2 w-2 mr-0.5 flex-shrink-0" />
          <span className="truncate">{formattedDate}</span>
        </div>
      </div>
      
      <p className="text-[10px] leading-[1.4] text-loro-navy/90 mb-2 w-full break-words overflow-hidden">
        {suggestion.notes}
      </p>
      
      <div className="flex justify-end items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-[10px] text-rose-600 hover:bg-rose-50 hover:text-rose-700 active:scale-95 transition-all duration-200 min-w-0 flex-shrink-0"
          onClick={() => onDismiss(suggestion)}
        >
          <XIcon className="h-2.5 w-2.5 mr-1" />
          Ignorer
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-1.5 text-[10px] border-loro-navy text-loro-navy hover:bg-loro-pearl/40 active:scale-95 transition-all duration-200 min-w-0 flex-shrink-0"
          onClick={() => onImplement(suggestion)}
        >
          <CheckIcon className="h-2.5 w-2.5 mr-1" />
          Appliquer
        </Button>
      </div>
    </div>
  );
}
