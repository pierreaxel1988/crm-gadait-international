
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
      case 'Call': return <span className="bg-[#F8E2E8] text-[#D05A76] px-3 py-1 rounded-full text-xs font-medium">Appel</span>;
      case 'Visites': return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">Visite</span>;
      case 'Compromis': return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">Compromis</span>;
      case 'Acte de vente': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">Acte de vente</span>;
      case 'Contrat de Location': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">Contrat Location</span>;
      case 'Propositions': return <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">Proposition</span>;
      case 'Follow up': return <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-medium">Follow-up</span>;
      case 'Estimation': return <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-medium">Estimation</span>;
      case 'Prospection': return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">Prospection</span>;
      case 'Admin': return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">Admin</span>;
      default: return null;
    }
  };

  const formattedDate = format(suggestion.scheduledDate, 'dd/MM/yyyy à HH:mm', { locale: fr });

  return (
    <div className="border border-loro-navy/10 bg-loro-pearl/20 rounded-lg p-4 animate-[fade-in_0.3s_ease-out] relative group touch-manipulation">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          {getActionTypeIcon(suggestion.actionType)}
        </div>
        <div className="flex items-center text-xs text-gray-500 bg-white/80 px-2.5 py-1.5 rounded-full">
          <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
          {formattedDate}
        </div>
      </div>
      
      <p className="text-base leading-relaxed text-loro-navy/90 my-4 line-clamp-3">
        {suggestion.notes}
      </p>
      
      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2.5">
        <Button
          variant="ghost"
          size="lg"
          className="h-12 px-4 text-base text-rose-600 hover:bg-rose-50 hover:text-rose-700 active:scale-95 transition-all duration-200"
          onClick={() => onDismiss(suggestion)}
        >
          <XIcon className="h-5 w-5 mr-2" />
          Ignorer
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-12 px-4 text-base border-loro-navy text-loro-navy hover:bg-loro-pearl/40 active:scale-95 transition-all duration-200"
          onClick={() => onImplement(suggestion)}
        >
          <CheckIcon className="h-5 w-5 mr-2" />
          Appliquer
        </Button>
      </div>
    </div>
  );
}
