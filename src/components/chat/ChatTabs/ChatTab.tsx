
import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, ArrowDown, Copy, Check } from 'lucide-react';
import EnhancedInput from '../EnhancedInput';
import { Button } from '@/components/ui/button';
import { Message } from '../types/chatTypes';

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
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <div 
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="flex-1 mb-4 pr-4 overflow-y-auto no-scrollbar smooth-scroll"
      >
        {/* Afficher les suggestions même s'il y a des messages */}
        <div className="mb-6 animate-[fade-in_0.5s_ease-out]">
          <p className="text-loro-navy/70 text-sm mb-3">Suggestions de prompts:</p>
          <div className="grid gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(prompt)}
                className={`text-left p-3 rounded-lg border border-loro-sand/50 hover:bg-loro-pearl/30 text-loro-navy transition-colors
                 ${selectedSuggestion === prompt ? 'bg-loro-pearl border-loro-hazel/30' : 'bg-white'}`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4 px-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto' : 'mr-auto'
              }`}
            >
              <div
                className={`p-3 rounded-lg relative group ${
                  msg.role === 'user'
                    ? 'bg-loro-hazel text-white'
                    : 'bg-loro-pearl/50 text-loro-navy'
                } shadow-sm`}
              >
                <div 
                  className="whitespace-pre-line pr-8" 
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }}
                />
                
                {/* Copy button */}
                <Button
                  variant="ghost" 
                  size="icon"
                  className={`absolute top-2 right-2 h-6 w-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                    msg.role === 'user' ? 'text-white hover:bg-loro-hazel/80' : 'text-loro-navy/70 hover:bg-loro-pearl'
                  }`}
                  onClick={() => copyMessageContent(msg.id, msg.content)}
                  title="Copier le message"
                >
                  {copiedMessageId === msg.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div
                className={`text-xs text-gray-500 mt-1 ${
                  msg.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Scroll down button */}
      {showScrollButton && (
        <Button
          className="absolute bottom-24 right-8 h-10 w-10 rounded-full bg-loro-hazel text-white shadow-md hover:bg-loro-hazel/90 z-10 transition-all duration-300"
          onClick={scrollToBottom}
          size="icon"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      )}
      
      <EnhancedInput
        input={input}
        setInput={setInput}
        placeholder="Ask anything..."
        isLoading={isLoading}
        handleSend={handleSendMessage}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default ChatTab;
