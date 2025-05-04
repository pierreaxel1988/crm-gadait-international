
import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, ArrowDown, Copy, Check } from 'lucide-react';
import EnhancedInput from '../EnhancedInput';
import { Button } from '@/components/ui/button';
import { Message } from '../types/chatTypes';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatTabProps {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  handleSendMessage: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  suggestedPrompts?: string[];
}

const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  input,
  setInput,
  isLoading,
  handleSendMessage,
  messagesEndRef,
  suggestedPrompts = [
    "Suggère des actions de suivi pour ce lead",
    "Rédige un email de relance professionnel",
    "Quelles propriétés recommandes-tu pour ce client?",
    "Analyse le potentiel d'achat de ce lead",
    "Comment puis-je améliorer ma communication avec ce client?"
  ]
}) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
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

  // Fonction pour formater le contenu du message avec un meilleur espacement
  const formatMessageContent = (content: string) => {
    // Remplace les étoiles doubles par du texte en gras
    let formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
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

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Conteneur principal des messages avec défilement */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="flex-1 overflow-y-auto no-scrollbar smooth-scroll px-4 md:px-8 lg:px-12"
      >
        {/* Section des messages */}
        <div className="max-w-3xl mx-auto w-full pb-32 pt-4 space-y-4">
          {/* Afficher les suggestions en début de conversation, style ChatGPT */}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-loro-pearl/50 p-4 mb-6">
                <MessageSquare className="h-8 w-8 text-loro-hazel" />
              </div>
              <h3 className="text-xl font-medium text-loro-navy mb-6">Comment puis-je vous aider aujourd'hui?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(prompt)}
                    className="bg-white hover:bg-loro-pearl/30 text-left p-4 rounded-xl border border-loro-sand/30 shadow-sm hover:shadow transition-all text-loro-navy"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Liste des messages avec style ChatGPT */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  } w-full`}
                >
                  <div className={`max-w-[85%] flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}>
                    {/* En-tête du message avec avatar et rôle */}
                    <div className={`flex items-center gap-2 mb-1 ${
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center 
                        ${msg.role === 'user' ? 'bg-loro-hazel' : 'bg-loro-pearl'}`}>
                        {msg.role === 'user' ? (
                          <span className="text-sm text-white font-medium">U</span>
                        ) : (
                          <MessageSquare className="h-3 w-3 text-loro-hazel" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-loro-navy/70 capitalize">
                        {msg.role === 'assistant' ? 'Gadait' : 'Vous'}
                      </span>
                    </div>
                    
                    {/* Contenu du message */}
                    <div 
                      className={`relative group rounded-lg px-4 py-3 ${
                        msg.role === 'user' 
                          ? 'bg-loro-hazel text-white rounded-tr-sm' 
                          : 'bg-loro-pearl/40 text-loro-navy rounded-tl-sm'
                      }`}
                    >
                      <div 
                        className="whitespace-pre-line pr-7"
                        dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }}
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
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    {/* Horodatage */}
                    <div className={`text-xs text-gray-500 mt-1 ${
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
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Bouton de défilement vers le bas */}
      {showScrollButton && (
        <Button
          className="fixed bottom-24 right-8 h-10 w-10 rounded-full bg-loro-hazel text-white shadow-md hover:bg-loro-hazel/90 z-10 transition-all duration-300"
          onClick={scrollToBottom}
          size="icon"
        >
          <ArrowDown className="h-5 w-5" />
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
