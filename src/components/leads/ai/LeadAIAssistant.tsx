
import React, { useState, useRef, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { 
  AIMessage, 
  sendAIMessage, 
  getConversationHistory,
  getConversationHistoryFromDB
} from '@/services/aiAssistantService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Bot, Loader2, User, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LeadAIAssistantProps {
  lead: LeadDetailed;
  className?: string;
}

export function LeadAIAssistant({ lead, className }: LeadAIAssistantProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [conversation, setConversation] = useState<AIMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Actions rapides pour un agent immobilier de luxe
  const quickActions = [
    'Relance WhatsApp professionnelle',
    'Sélection personnalisée haut de gamme',
    'Synthèse pour le client',
    'Proposition de visite',
    'Négociation discrète',
    'Email de suivi exclusif'
  ];

  // Load conversation history - first try from DB, then fallback to localStorage
  useEffect(() => {
    if (lead?.id) {
      const loadHistory = async () => {
        try {
          // First try to get history from DB
          const dbHistory = await getConversationHistoryFromDB(lead.id);
          
          if (dbHistory && dbHistory.length > 0) {
            setConversation(dbHistory);
          } else {
            // Fallback to localStorage if DB is empty
            const localHistory = getConversationHistory(lead.id);
            setConversation(localHistory);
          }
        } catch (error) {
          console.error('Error loading conversation history:', error);
          // Fallback to localStorage
          const localHistory = getConversationHistory(lead.id);
          setConversation(localHistory);
        } finally {
          setIsInitialLoading(false);
        }
      };
      
      loadHistory();
    }
  }, [lead?.id]);

  // Scroll to bottom when conversation updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSendMessage = async () => {
    if (!message.trim() || !lead?.id) return;
    
    setIsLoading(true);
    try {
      // Ajouter temporairement le message utilisateur à la conversation pour UX immédiate
      const userMessageTemp: AIMessage = {
        id: 'temp-' + crypto.randomUUID(),
        leadId: lead.id,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, userMessageTemp]);
      
      // Send message to AI assistant
      const newMessage = await sendAIMessage(lead.id, message, lead);
      
      // Fetch updated conversation from DB
      const updatedHistory = await getConversationHistoryFromDB(lead.id);
      setConversation(updatedHistory);
      
      // Clear input
      setMessage('');
      
      // Focus the textarea after sending
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message à l'assistant IA."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
    // Trigger send message automatically for quick actions
    setTimeout(() => {
      if (textareaRef.current) {
        // Reset height to auto to get the correct scrollHeight
        textareaRef.current.style.height = 'auto';
        
        // Set the height to the scrollHeight
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        
        // Focus the textarea
        textareaRef.current.focus();
      }
    }, 50);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    } catch (e) {
      return '';
    }
  };

  // Handle Ctrl+Enter to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-adjust textarea height
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = 'auto';
    
    // Set the height to the scrollHeight
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className={cn("flex flex-col border rounded-lg shadow-sm bg-white overflow-hidden h-[400px] md:h-[500px]", className)}>
      <div className="bg-loro-navy/10 p-3 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-loro-hazel mr-2" />
          <h3 className="font-futura text-sm text-loro-navy">Assistant Gadait IA</h3>
        </div>
      </div>
      
      {/* Quick Actions améliorées */}
      <div className="p-3 border-b flex gap-2 overflow-x-auto">
        {quickActions.map((action) => (
          <Button 
            key={action} 
            variant="outline" 
            size="sm" 
            className="text-xs whitespace-nowrap flex-shrink-0 border-loro-sand hover:bg-loro-sand/10 hover:text-loro-navy"
            onClick={() => handleQuickAction(action)}
          >
            {action}
          </Button>
        ))}
      </div>
      
      <ScrollArea className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-4">
          {isInitialLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-loro-hazel/70" />
            </div>
          ) : conversation.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-center text-muted-foreground">
              <div>
                <Bot className="h-8 w-8 mx-auto mb-2 text-loro-navy/40" />
                <p className="text-sm">Posez une question ou générez un message adapté au marché du luxe en fonction du profil client</p>
              </div>
            </div>
          ) : (
            conversation.map((msg) => (
              <div 
                key={msg.id}
                className={cn(
                  "flex items-start gap-2 max-w-[85%] animate-[fade-in_0.3s_ease-out]",
                  msg.role === 'user' ? "ml-auto" : "mr-auto"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                  msg.role === 'user' 
                    ? "bg-loro-navy/10 text-loro-navy order-2" 
                    : "bg-loro-hazel/20 text-loro-hazel order-1"
                )}>
                  {msg.role === 'user' 
                    ? <User className="h-4 w-4" /> 
                    : <Bot className="h-4 w-4" />
                  }
                </div>
                
                <div className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  msg.role === 'user' 
                    ? "bg-loro-navy/10 text-loro-navy order-1 rounded-tr-none" 
                    : "bg-loro-hazel/20 text-loro-night order-2 rounded-tl-none"
                )}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 text-right">
                    {formatDate(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t p-3">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Demandez à l'assistant de générer un message personnalisé pour ce client..."
            className="flex-1 resize-none min-h-[40px] py-2 px-3 border-loro-sand/60 focus-visible:ring-loro-hazel"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
            className="bg-loro-hazel hover:bg-loro-hazel/80 text-white h-10 w-10 p-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizontal className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2 text-right">
          Appuyez sur Ctrl+Entrée pour envoyer
        </div>
      </div>
    </div>
  );
}
