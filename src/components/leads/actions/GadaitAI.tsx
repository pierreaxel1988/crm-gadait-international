
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, Loader2 } from 'lucide-react';
import { LeadDetailed } from '@/types/lead';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface GadaitAIProps {
  lead: LeadDetailed;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const GadaitAI: React.FC<GadaitAIProps> = ({ lead }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem(`chat-history-${lead.id}`);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`chat-history-${lead.id}`, JSON.stringify(messages));
  }, [messages, lead.id]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare the payload with the lead data
      const payload = {
        prompt: input,
        lead: {
          id: lead.id,
          nom: lead.name,
          langue: lead.preferredLanguage || 'fr',
          budget_min: lead.budgetMin?.toString() || '',
          budget_max: lead.budget?.toString() || '',
          devise: lead.currency || 'EUR',
          type_bien: lead.propertyType || '',
          vue_souhaitee: lead.view || '',
          nb_chambres: lead.bedrooms?.toString() || '',
          localisation: lead.desiredLocation || '',
          notes_generales: lead.notes || '',
          agent: lead.assignedTo || ''
        }
      };

      // Call the Supabase function
      const response = await fetch('https://hxqoqkfnhbpwzkjgukrc.functions.supabase.co/chat-gadait', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.response || 'Je suis désolé, je n\'ai pas pu traiter votre demande.';

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling AI assistant:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de contacter l'assistant IA"
      });
    } finally {
      setIsLoading(false);
      // Focus on the input field after response
      inputRef.current?.focus();
    }
  };

  const clearHistory = () => {
    if (confirm('Voulez-vous vraiment effacer tout l\'historique de conversation ?')) {
      setMessages([]);
      localStorage.removeItem(`chat-history-${lead.id}`);
    }
  };

  return (
    <div className="bg-white rounded-md mb-4 overflow-hidden">
      <div className="flex items-center gap-2 p-2 mb-2 bg-loro-navy text-white">
        <Bot size={18} />
        <h3 className="text-sm font-semibold">Assistant IA GADAIT</h3>
      </div>

      {messages.length > 0 && (
        <div className="max-h-96 overflow-y-auto p-3 space-y-3">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "p-2 rounded-md max-w-[85%] animate-[fade-in_0.3s_ease-out]",
                message.type === 'user' 
                  ? "bg-loro-sand text-loro-night ml-auto rounded-tr-none" 
                  : "bg-gray-100 text-gray-800 mr-auto rounded-tl-none border border-gray-200"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-[10px] text-gray-500 mt-1 text-right">
                {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {messages.length === 0 && (
        <div className="p-4 text-center text-gray-500 italic text-sm">
          Posez une question à l'assistant pour obtenir de l'aide
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-2 border-t flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Écris ici ta demande (ex : relance WhatsApp, résumé du client...)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon" 
          className="rounded-full bg-chocolate-dark hover:bg-loro-navy transition-colors duration-200"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      {messages.length > 0 && (
        <div className="px-2 pb-2 text-right">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearHistory} 
            className="text-xs text-gray-500 hover:text-rose-500"
          >
            Effacer l'historique
          </Button>
        </div>
      )}
    </div>
  );
};

export default GadaitAI;
