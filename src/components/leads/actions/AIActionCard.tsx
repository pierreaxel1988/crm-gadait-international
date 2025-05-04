
import React from 'react';
import { MessageSquarePlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadDetailed } from '@/types/lead';

interface AIActionCardProps {
  lead: LeadDetailed;
  onGenerateMessage: (prompt: string) => void;
}

const AIActionCard: React.FC<AIActionCardProps> = ({ lead, onGenerateMessage }) => {
  // Fonction pour générer le prompt de bienvenue personnalisé
  const generateWelcomePrompt = () => {
    // Déterminer la langue en fonction de la langue préférée du lead
    const language = lead.preferredLanguage || 'fr'; // Par défaut, français si non spécifié
    
    // Récupérer les informations du lead
    const name = lead.name?.split(' ')[0] || 'client';
    const location = lead.desiredLocation || lead.location || lead.country || 'votre région d\'intérêt';
    const propertyType = lead.propertyType || 
                        (lead.propertyTypes && lead.propertyTypes.length > 0 ? lead.propertyTypes.join(', ') : 'propriété');
    const budget = lead.budget || lead.budgetMin || '';
    const currency = lead.currency || '€';
    const url = lead.url || '';
    
    // Créer le flag emoji en fonction du pays si disponible
    const countryFlag = lead.country === 'Mauritius' ? '🇲🇺' : 
                      lead.country === 'France' ? '🇫🇷' : 
                      lead.country === 'Spain' ? '🇪🇸' : 
                      lead.country === 'Portugal' ? '🇵🇹' : '';
    
    // Générer le prompt en fonction de la langue
    if (language === 'en' || language === 'English') {
      return `Draft me a professional welcome email in English for ${name} with the following structure:

Hello ${name},

I am delighted to assist you with your real estate project in ${location} ${countryFlag}.

You are currently looking for a ${propertyType} property with a budget around ${budget} ${currency}, in the ${location} area. Is this still accurate? ✨

To better help you, could you please specify:
- Your objective: primary residence, secondary residence, or investment?
- Your essential criteria (e.g., sea view, beach access, security, etc.)?
- Your planned dates to visit (to organize property viewings)?
- Would you like me to prepare an initial selection of suitable properties?

${url ? `Here is the link to the property you viewed, for reference:\n📍 ${url}` : ''}

I'm available for any questions or quick exchanges via WhatsApp, email, or phone.

Looking forward to guiding you through this wonderful real estate journey,
[Agent name / personalized signature]

Make the tone warm, professional, and luxury-oriented.`;
    } else {
      // Par défaut en français
      return `Rédige-moi un email de bienvenue professionnel pour ${name} avec la structure suivante:

Bonjour ${name},

Je suis ravi de vous accompagner dans votre projet immobilier à ${location} ${countryFlag}.

Vous recherchez actuellement une propriété de type ${propertyType} avec un budget autour de ${budget} ${currency}, dans la région de ${location}. Est-ce toujours d'actualité ? ✨

Pour mieux vous aider, pourriez-vous me préciser :
- Votre objectif : résidence principale, secondaire ou investissement ?
- Vos critères essentiels (ex : vue mer, accès plage, sécurité, etc.) ?
- Vos dates prévues pour venir sur place (afin d'organiser des visites) ?
- Souhaitez-vous que je vous prépare une première sélection de biens adaptés ?

${url ? `Voici le lien de l'annonce que vous avez consultée, pour référence :\n📍 ${url}` : ''}

Je suis à votre disposition pour toute question ou échange rapide via WhatsApp, email ou téléphone.

Au plaisir de vous guider dans cette belle aventure immobilière,
[Nom de l'agent / signature personnalisée]

Utilise un ton chaleureux, professionnel et haut de gamme.`;
    }
  };
  
  const handleClick = () => {
    const prompt = generateWelcomePrompt();
    onGenerateMessage(prompt);
  };

  return (
    <div className="p-3 rounded-md border border-loro-hazel/30 bg-gradient-to-r from-loro-pearl/30 to-loro-sand/20 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-loro-hazel/15 flex items-center justify-center mr-3">
            <Sparkles className="h-4 w-4 text-loro-terracotta" />
          </div>
          <div>
            <h3 className="font-medium text-loro-navy">Rédiger le premier message</h3>
            <p className="text-sm text-gray-600">IA - Message de bienvenue personnalisé</p>
          </div>
        </div>
        
        <Button 
          onClick={handleClick}
          variant="outline" 
          size="sm"
          className="bg-white hover:bg-loro-pearl/30 border-loro-hazel/30 text-loro-hazel hover:text-loro-chocolate flex items-center gap-1.5"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>Générer</span>
        </Button>
      </div>
    </div>
  );
};

export default AIActionCard;
