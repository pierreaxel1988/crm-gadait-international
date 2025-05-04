
import React from 'react';
import { MessageSquare, Lightbulb } from 'lucide-react';
import { LeadStatus } from '@/types/lead';

interface ContextualSuggestionsProps {
  status: LeadStatus;
  onSuggestionClick: (suggestion: string) => void;
}

const ContextualSuggestions: React.FC<ContextualSuggestionsProps> = ({
  status,
  onSuggestionClick
}) => {
  // Status-based suggestions
  const getSuggestionsForStatus = (status: LeadStatus): string[] => {
    switch(status) {
      case 'New':
        return [
          'Souhaitez-vous lui envoyer un message WhatsApp de bienvenue ?',
          'Voulez-vous lui proposer un call rapide pour mieux cerner ses critères ?'
        ];
      case 'Contacted':
        return [
          'Souhaitez-vous relancer ce lead après votre premier contact ?',
          'Souhaitez-vous générer un résumé clair de ses besoins ?'
        ];
      case 'Qualified':
        return [
          'Souhaitez-vous lui proposer une première sélection de biens adaptés ?',
          'Souhaitez-vous programmer une visite ?'
        ];
      case 'Proposal':
        return [
          'Souhaitez-vous envoyer un rappel concernant la proposition faite ?',
          'Souhaitez-vous reformuler la proposition ou ajouter une alternative ?'
        ];
      case 'Visit':
        return [
          'Souhaitez-vous lui envoyer un message de remerciement ?',
          'Souhaitez-vous résumer les impressions du client ?',
          'Souhaitez-vous relancer pour connaître sa décision ?'
        ];
      case 'Offre':
        return [
          'Souhaitez-vous lui rappeler les modalités de l\'offre ?',
          'Souhaitez-vous informer le propriétaire ?'
        ];
      case 'Deposit':
        return [
          'Souhaitez-vous envoyer un récapitulatif des prochaines étapes ?'
        ];
      case 'Signed':
        return [
          'Souhaitez-vous féliciter le client et lui envoyer un message personnalisé ?',
          'Souhaitez-vous créer une tâche de suivi post-achat ?'
        ];
      case 'Gagné':
        return [
          'Souhaitez-vous envoyer un mail de témoignage / recommandation ?',
          'Souhaitez-vous archiver ce lead avec une note finale ?'
        ];
      default:
        return [];
    }
  };

  const suggestions = getSuggestionsForStatus(status);
  
  if (suggestions.length === 0) return null;

  return (
    <div className="mb-4 p-3 bg-loro-pearl/20 rounded-lg border border-loro-sand/30">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-amber-600" />
        <h3 className="text-base font-futura">Suggestions pour ce lead</h3>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left p-2.5 bg-white hover:bg-loro-pearl/10 border border-loro-sand/30 rounded-md transition-all text-base text-loro-navy hover:border-loro-hazel/40"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-loro-hazel flex-shrink-0" />
              <span>{suggestion}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContextualSuggestions;
