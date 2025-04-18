
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
      case 'Call': return <span className="bg-[#F8E2E8] text-[#D05A76] px-2 py-0.5 rounded-full text-xs font-futura">Appel</span>;
      case 'Visites': return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-futura">Visite</span>;
      case 'Compromis': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-futura">Compromis</span>;
      case 'Acte de vente': return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-futura">Acte de vente</span>;
      case 'Contrat de Location': return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-futura">Contrat Location</span>;
      case 'Propositions': return <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-futura">Proposition</span>;
      case 'Follow up': return <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full text-xs font-futura">Follow-up</span>;
      case 'Estimation': return <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-xs font-futura">Estimation</span>;
      case 'Prospection': return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-futura">Prospection</span>;
      case 'Admin': return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-futura">Admin</span>;
      default: return null;
    }
  };

  const formattedDate = format(suggestion.scheduledDate, 'dd/MM/yyyy à HH:mm', { locale: fr });

  return (
    <div className="border border-loro-hazel/30 bg-loro-hazel/5 rounded-md p-3 animate-[fade-in_0.3s_ease-out]">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {getActionTypeIcon(suggestion.actionType)}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <CalendarIcon className="h-3 w-3 mr-1" />
          {formattedDate}
        </div>
      </div>
      
      <p className="text-sm mb-3">{suggestion.notes}</p>
      
      <div className="flex justify-end gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => onDismiss(suggestion)}
        >
          <XIcon className="h-3 w-3 mr-1" />
          Ignorer
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
          onClick={() => onImplement(suggestion)}
        >
          <CheckIcon className="h-3 w-3 mr-1" />
          Appliquer
        </Button>
      </div>
    </div>
  );
}
