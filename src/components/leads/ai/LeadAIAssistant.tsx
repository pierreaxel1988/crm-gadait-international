
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
    <div className={cn("flex flex-col border rounded-lg shadow-sm bg-white overflow-hidden h-[350px] sm:h-[400px] w-full", className)}>
      <div className="bg-gray-100 px-4 py-2 border-b">
        <h3 className="font-medium text-sm text-gray-700">Assistant IA GADAIT</h3>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-3">
          {isInitialLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          ) : conversation.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-center text-gray-500 px-4">
              <div>
                <Bot className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <p className="text-xs">Posez une question ou générez un message adapté au marché du luxe</p>
              </div>
            </div>
          ) : (
            conversation.map((msg) => (
              <div 
                key={msg.id}
                className={cn(
                  "flex items-start gap-2 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto" : "mr-auto"
                )}
              >
                <div className={cn(
                  "rounded-lg px-3 py-2 text-xs shadow-sm",
                  msg.role === 'user' 
                    ? "bg-blue-50 text-gray-800 order-1 rounded-tr-none" 
                    : "bg-gray-100 text-gray-800 order-2 rounded-tl-none"
                )}>
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  <div className="text-[10px] text-gray-500 mt-1 text-right">
                    {formatDate(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t p-2">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Écris ici ta demande..."
            className="flex-1 resize-none min-h-[40px] py-2 px-3 text-xs rounded-lg"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white h-9 w-9 p-0 rounded-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
