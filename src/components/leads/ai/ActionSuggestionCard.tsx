
import React from 'react';
import { CalendarIcon, CheckIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AISuggestedAction } from '@/services/aiActionSuggestionService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActionSuggestionCardProps {
  suggestion: AISuggestedAction;
  onImplement: (suggestion: AISuggestedAction) => void;
  onDismiss: (suggestion: AISuggestedAction) => void;
}

export function ActionSuggestionCard({ suggestion, onImplement, onDismiss }: ActionSuggestionCardProps) {
  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'Call': return <span className="bg-[#F8E2E8] text-[#D05A76] px-2 py-0.5 rounded-full text-[11px] font-futura">Appel</span>;
      case 'Visites': return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[11px] font-futura">Visite</span>;
      case 'Compromis': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[11px] font-futura">Compromis</span>;
      case 'Acte de vente': return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[11px] font-futura">Acte de vente</span>;
      case 'Contrat de Location': return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[11px] font-futura">Contrat Location</span>;
      case 'Propositions': return <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-[11px] font-futura">Proposition</span>;
      case 'Follow up': return <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full text-[11px] font-futura">Follow-up</span>;
      case 'Estimation': return <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-[11px] font-futura">Estimation</span>;
      case 'Prospection': return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-[11px] font-futura">Prospection</span>;
      case 'Admin': return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-[11px] font-futura">Admin</span>;
      default: return null;
    }
  };

  const formattedDate = format(suggestion.scheduledDate, 'dd/MM/yyyy à HH:mm', { locale: fr });

  return (
    <div className="border border-loro-navy/10 bg-loro-pearl/20 rounded-md p-1.5 md:p-2 animate-[fade-in_0.3s_ease-out] relative group touch-manipulation">
      <div className="flex items-start justify-between gap-1.5 mb-1">
        <div className="flex items-center gap-1">
          {getActionTypeIcon(suggestion.actionType)}
        </div>
        <div className="flex items-center text-[10px] text-gray-500 bg-white/80 px-1 py-0.5 rounded-full">
          <CalendarIcon className="h-2.5 w-2.5 mr-1" />
          {formattedDate}
        </div>
      </div>
      
      <p className="text-[11px] leading-[1.4] text-loro-navy/90 mb-2 line-clamp-2">
        {suggestion.notes}
      </p>
      
      <div className="flex justify-end items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1 text-[11px] text-rose-600 hover:bg-rose-50 hover:text-rose-700 active:scale-95 transition-all duration-200"
          onClick={() => onDismiss(suggestion)}
        >
          <XIcon className="h-3 w-3 mr-0.5" />
          Ignorer
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-1 text-[11px] border-loro-navy text-loro-navy hover:bg-loro-pearl/40 active:scale-95 transition-all duration-200"
          onClick={() => onImplement(suggestion)}
        >
          <CheckIcon className="h-3 w-3 mr-0.5" />
          Appliquer
        </Button>
      </div>
    </div>
  );
}

