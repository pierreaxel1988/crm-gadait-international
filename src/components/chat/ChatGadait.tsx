
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Home, 
  X, 
  Loader, 
  ChevronDown, 
  FileText, 
  ArrowRight,
  MailPlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadDetailed } from '@/types/lead';
import { createLead } from '@/services/leadService';
import StatusBadge from '@/components/common/StatusBadge';
import TagBadge from '@/components/common/TagBadge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatGadaitProps {
  isOpen: boolean;
  onClose: () => void;
  leadData?: LeadDetailed;
}

const ChatGadait: React.FC<ChatGadaitProps> = ({ isOpen, onClose, leadData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [emailContent, setEmailContent] = useState('');
  const [propertyUrl, setPropertyUrl] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Bonjour! Je suis Chat Gadait, votre assistant IA pour la gestion des leads et des propriétés. Comment puis-je vous aider aujourd\'hui?',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-gadait', {
        body: { message: input, type: 'chat' }
      });

      if (error) {
        throw new Error(error.message);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de communiquer avec Chat Gadait. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const extractEmailData = async () => {
    if (!emailContent.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez coller le contenu d'un email."
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-gadait', {
        body: { type: 'email-extract', content: emailContent }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Try to parse the response as JSON
      try {
        const jsonData = JSON.parse(data.response);
        setExtractedData(jsonData);
        
        toast({
          title: "Données extraites",
          description: "Les informations ont été extraites avec succès."
        });
      } catch (parseError) {
        setExtractedData({ raw: data.response });
        toast({
          variant: "destructive",
          title: "Format incorrect",
          description: "Les données n'ont pas pu être traitées correctement."
        });
      }
    } catch (error) {
      console.error('Error extracting email data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'extraire les données de l'email."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractPropertyData = async () => {
    if (!propertyUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer l'URL d'une propriété."
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-gadait', {
        body: { type: 'property-extract', content: propertyUrl }
      });

      if (error) {
        throw new Error(error.message);
      }

      try {
        const jsonData = JSON.parse(data.response);
        setExtractedData(jsonData);
        
        toast({
          title: "Données extraites",
          description: "Les informations de la propriété ont été extraites avec succès."
        });
      } catch (parseError) {
        setExtractedData({ raw: data.response });
        toast({
          variant: "destructive",
          title: "Format incorrect",
          description: "Les données n'ont pas pu être traitées correctement."
        });
      }
    } catch (error) {
      console.error('Error extracting property data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'extraire les données de la propriété."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createLeadFromData = () => {
    if (!extractedData) return;
    
    try {
      // Here we need to properly map the extracted data to our Lead type
      // and make sure we use the correct status values from our LeadStatus type
      const newLead: Omit<LeadDetailed, "id" | "createdAt"> = {
        name: extractedData.Name || extractedData.name || "",
        email: extractedData.Email || extractedData.email || "",
        phone: extractedData.Phone || extractedData.phone || "",
        source: extractedData.Source || extractedData.source || "Site web",
        budget: extractedData.Budget || extractedData.budget || "",
        propertyReference: extractedData.property_reference || extractedData["Property reference"] || "",
        desiredLocation: extractedData.desired_location || extractedData["Desired location"] || "",
        propertyType: extractedData.property_type || extractedData["Property type"] || "",
        notes: emailContent || "",
        status: "New", // Using a valid LeadStatus value
        tags: ["Imported"], // Using a valid LeadTag value
      };
      
      createLead(newLead);
      
      toast({
        title: "Lead créé",
        description: `Le lead ${newLead.name} a été créé avec succès.`
      });
      
      // Reset form
      setEmailContent("");
      setExtractedData(null);
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le lead."
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-white dark:bg-gray-950 w-full max-w-md flex flex-col h-full shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-loro-navy" />
            <h2 className="font-semibold text-lg">Chat Gadait</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 m-4">
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="property">
              <Home className="h-4 w-4 mr-2" />
              Propriété
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto mb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 max-w-[85%] ${
                    msg.role === 'user' ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-loro-navy text-white'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    {msg.content}
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
            
            <div className="flex items-center">
              <textarea
                className="flex-1 border rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-loro-navy resize-none"
                placeholder="Posez votre question..."
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <Button
                className="rounded-l-none"
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="mb-4">
              <h3 className="font-medium mb-2">Extraction d'email</h3>
              <p className="text-sm text-gray-500 mb-2">
                Collez le contenu d'un email pour extraire automatiquement les informations du lead.
              </p>
              <textarea
                className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-loro-navy resize-none"
                placeholder="Collez le contenu de l'email ici..."
                rows={8}
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
              <Button 
                className="mt-2 w-full"
                onClick={extractEmailData}
                disabled={isLoading || !emailContent.trim()}
              >
                {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                Extraire les données
              </Button>
            </div>
            
            {extractedData && (
              <div className="border rounded-md p-3 mt-2 bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium mb-2 flex items-center justify-between">
                  Données extraites
                  <ChevronDown className="h-4 w-4" />
                </h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(extractedData).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key}:</span>
                      <span className="text-gray-600 dark:text-gray-300">{String(value)}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  className="mt-3 w-full" 
                  variant="default"
                  onClick={createLeadFromData}
                >
                  <MailPlus className="h-4 w-4 mr-2" />
                  Créer un lead
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="property" className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="mb-4">
              <h3 className="font-medium mb-2">Extraction de propriété</h3>
              <p className="text-sm text-gray-500 mb-2">
                Entrez l'URL d'une propriété pour extraire automatiquement ses informations.
              </p>
              <input
                type="text"
                className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-loro-navy"
                placeholder="https://www.exemple-immobilier.com/propriete/123"
                value={propertyUrl}
                onChange={(e) => setPropertyUrl(e.target.value)}
              />
              <Button 
                className="mt-2 w-full"
                onClick={extractPropertyData}
                disabled={isLoading || !propertyUrl.trim()}
              >
                {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Home className="h-4 w-4 mr-2" />}
                Extraire les données
              </Button>
            </div>
            
            {extractedData && (
              <div className="border rounded-md p-3 mt-2 bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium mb-2 flex items-center justify-between">
                  Données extraites
                  <ChevronDown className="h-4 w-4" />
                </h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(extractedData).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key}:</span>
                      <span className="text-gray-600 dark:text-gray-300">{String(value)}</span>
                    </div>
                  ))}
                </div>
                <Button className="mt-3 w-full" variant="outline">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Utiliser ces données
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChatGadait;
