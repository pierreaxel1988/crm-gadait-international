
import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, ArrowDown, Copy, Check, Sparkles } from 'lucide-react';
import EnhancedInput from '../EnhancedInput';
import { Button } from '@/components/ui/button';
import { Message } from '../types/chatTypes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LeadDetailed } from '@/types/lead';

interface ChatTabProps {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  handleSendMessage: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  suggestedPrompts?: string[];
  leadData?: LeadDetailed;
}

const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  input,
  setInput,
  isLoading,
  handleSendMessage,
  messagesEndRef,
  suggestedPrompts,
  leadData
}) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Generate contextual starters based on lead data
  const getContextualStarters = () => {
    if (!leadData) {
      return suggestedPrompts || [
        "Suggère des actions de suivi pour ce lead",
        "Rédige un email de relance professionnel",
        "Quelles propriétés recommandes-tu pour ce client?",
        "Analyse le potentiel d'achat de ce lead",
        "Comment puis-je améliorer ma communication avec ce client?"
      ];
    }

    const starters: string[] = [];
    const name = leadData.name || "ce client";

    // Starters based on lead status
    if (leadData.status === 'New') {
      starters.push(`Rédige un premier mail pour ${name}`);
      starters.push(`Comment qualifier davantage ${name}?`);
      starters.push(`Suggère 3 questions pour qualifier ${name}`);
      starters.push(`Prépare un appel téléphonique avec ${name}`);
      starters.push(`Rédige un email de bienvenue pour ${name}`);
    } else if (leadData.status === 'Qualified') {
      starters.push(`Rédige une proposition commerciale pour ${name}`);
      starters.push(`Suggère des propriétés à montrer à ${name}`);
    } else if (leadData.status === 'Proposal') {
      starters.push(`Comment convaincre ${name} de finaliser l'achat?`);
      starters.push(`Rédige un email de relance pour ${name} concernant la proposition`);
    } else if (leadData.status === 'Perdu') {
      starters.push(`Comment réengager ${name} après avoir perdu l'opportunité?`);
    }

    // Starters based on property preferences
    if (leadData.desiredLocation) {
      starters.push(`Quelles sont les tendances du marché à ${leadData.desiredLocation}?`);
    }

    if (leadData.budget) {
      starters.push(`Analyse les options dans un budget de ${leadData.budget} ${leadData.currency || '€'}`);
    }
    
    // Starters based on property type
    if (leadData.propertyType || (leadData.propertyTypes && leadData.propertyTypes.length > 0)) {
      const propertyType = leadData.propertyType || (leadData.propertyTypes && leadData.propertyTypes[0]);
      starters.push(`Quels sont les avantages d'investir dans un(e) ${propertyType}?`);
    }

    // Additional contextual starters
    if (leadData.source) {
      starters.push(`Comment optimiser le suivi pour les leads venant de ${leadData.source}?`);
    }

    starters.push(`Résume les informations clés sur ${name}`);
    starters.push(`Suggère les prochaines étapes pour ${name}`);
    starters.push(`Rédige un email personnalisé pour ${name}`);

    return starters.slice(0, 6); // Limit to 6 suggestions
  };

  const contextualStarters = getContextualStarters();
  
  // Check if we should show the scroll button
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show button when user has scrolled up (not at bottom)
      const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isNotAtBottom);
    }
  };
  
  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Automatically scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Contrôle l'affichage des suggestions
  useEffect(() => {
    // Ne masquer les suggestions que si un message utilisateur a été envoyé
    const hasUserMessage = messages.some(msg => msg.role === 'user');
    setShowSuggestions(!hasUserMessage);
  }, [messages]);
  
  // Fonction pour formater le contenu du message avec un meilleur espacement
  const formatMessageContent = (content: string, role: string) => {
    // Si c'est un message de l'assistant, essayer d'identifier et de mettre en évidence la question de suivi
    if (role === 'assistant') {
      // Chercher une question de suivi typique à la fin du message
      const followUpPatterns = [
        /Souhaitez-vous que je.*\?$/,
        /Voulez-vous que je.*\?$/,
        /Puis-je vous aider à.*\?$/,
        /Avez-vous besoin.*\?$/,
        /Préférez-vous que.*\?$/,
        /Dois-je.*\?$/
      ];
      
      // Vérifier chaque pattern
      for (const pattern of followUpPatterns) {
        const match = content.match(pattern);
        if (match && match.index && match.index > content.length / 2) { // Si trouvé dans la deuxième moitié du texte
          const followUp = match[0];
          const beforeFollowUp = content.substring(0, match.index).trim();
          
          // Retourner du HTML avec le suivi mis en évidence
          return `${beforeFollowUp}
          
<div class="follow-up-question mt-4 pt-3 border-t border-loro-sand/20">
  <strong class="text-loro-hazel">${followUp}</strong>
</div>`;
        }
      }
    }
    
    // Continuer avec le formatage standard si aucun modèle de suivi n'est trouvé
    let formattedContent = content;
    
    // Remplace les étoiles doubles par du texte en gras
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Ajoute un espacement après les numéros de sections (comme "1.", "2.", etc.)
    formattedContent = formattedContent.replace(/(\d+\.)\s*/g, '$1 ');
    
    // Ajoute un espacement après les points d'interrogation suivis d'un texte
    formattedContent = formattedContent.replace(/\?(\w)/g, '? $1');
    
    // Améliore la structure des listes numérotées en ajoutant des sauts de ligne
    formattedContent = formattedContent.replace(/(\d+\.)/g, '\n$1');
    
    // Retire les sauts de ligne au début du texte si présents
    formattedContent = formattedContent.replace(/^\n/, '');
    
    return formattedContent;
  };
  
  // Fonction pour choisir une suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setInput(suggestion);
  };

  // Fonction pour copier le contenu d'un message
  const copyMessageContent = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000); // Reset after 2 seconds
    });
  };

  // Check if we have a system welcome message only
  const hasOnlySystemMessage = messages.length === 1 && messages[0].role === 'system';

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Conteneur principal des messages avec défilement */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="flex-1 overflow-y-auto no-scrollbar smooth-scroll px-4 md:px-8 lg:px-12"
      >
        {/* Section des messages */}
        <div className="max-w-3xl mx-auto w-full pb-32 pt-4 space-y-6">
          {/* Afficher les suggestions même si un message système existe */}
          {(showSuggestions || hasOnlySystemMessage) && (
            <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
              <div className="rounded-full bg-gradient-to-r from-loro-hazel/40 to-loro-pearl/60 p-4 mb-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                <Sparkles className="h-7 w-7 text-loro-hazel animate-pulse group-hover:text-loro-terracotta transition-colors duration-300" />
              </div>
              {leadData ? (
                <h3 className="text-base font-medium text-loro-navy mb-5">
                  Comment puis-je vous aider avec {leadData.name}?
                </h3>
              ) : (
                <h3 className="text-base font-medium text-loro-navy mb-5">
                  Comment puis-je vous aider aujourd'hui?
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {contextualStarters.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(prompt)}
                    className="bg-white hover:bg-loro-pearl/20 text-left p-3.5 rounded-lg border border-loro-sand/30 shadow-sm hover:shadow transition-all text-loro-navy text-base hover:border-loro-hazel/40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Liste des messages avec style ChatGPT */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              } w-full`}
            >
              <div className={`max-w-[90%] md:max-w-[80%] flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}>
                {/* En-tête du message avec avatar et rôle */}
                <div className={`flex items-center gap-2 mb-1 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center 
                    ${msg.role === 'user' ? 'bg-loro-hazel' : 'bg-loro-pearl'}`}>
                    {msg.role === 'user' ? (
                      <span className="text-xs text-white font-medium">U</span>
                    ) : (
                      <MessageSquare className="h-3 w-3 text-loro-hazel" />
                    )}
                  </div>
                  <span className="text-base font-medium text-loro-navy/70 capitalize">
                    {msg.role === 'assistant' ? 'Gadait' : 'Vous'}
                  </span>
                </div>
                
                {/* Contenu du message */}
                <div 
                  className={`relative group rounded-lg px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-loro-hazel text-white rounded-tr-sm' 
                      : 'bg-loro-pearl/30 text-loro-navy rounded-tl-sm'
                  }`}
                >
                  <div 
                    className="whitespace-pre-line pr-7 text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content, msg.role) }}
                  />
                  
                  {/* Bouton de copie */}
                  <button
                    className={`absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                      msg.role === 'user' 
                        ? 'hover:bg-white/10 text-white' 
                        : 'hover:bg-loro-navy/10 text-loro-navy/70'
                    }`}
                    onClick={() => copyMessageContent(msg.id, msg.content)}
                    title="Copier le message"
                  >
                    {copiedMessageId === msg.id ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                
                {/* Horodatage */}
                <div className={`text-base text-gray-500 mt-1 ${
                  msg.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Bouton de défilement vers le bas */}
      {showScrollButton && (
        <Button
          className="fixed bottom-24 right-8 h-9 w-9 rounded-full bg-loro-hazel text-white shadow-md hover:bg-loro-hazel/90 z-10 transition-all duration-300"
          onClick={scrollToBottom}
          size="icon"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
      
      {/* Zone de saisie de texte */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-4 px-4 md:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <EnhancedInput
            input={input}
            setInput={setInput}
            placeholder="Posez votre question..."
            isLoading={isLoading}
            handleSend={handleSendMessage}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
