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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();

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
        status: "New",
        tags: ["Imported"],
      };
      
      createLead(newLead);
      
      toast({
        title: "Lead créé",
        description: `Le lead ${newLead.name} a été créé avec succès.`
      });
      
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
      <div 
        className={`bg-loro-white w-full ${isMobile ? 'max-w-full' : 'max-w-md'} flex flex-col h-full shadow-luxury transition-all duration-300`}
      >
        <div className="flex items-center justify-between p-4 border-b border-loro-sand">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-loro-hazel" />
            <h2 className="font-timesNowSemi text-xl text-loro-navy">Chat Gadait</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-loro-pearl rounded-full h-8 w-8"
          >
            <X className="h-5 w-5 text-loro-navy" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="bg-loro-pearl/50 p-2">
            <TabsList className="grid grid-cols-3 w-full bg-loro-white border border-loro-sand">
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-loro-sand/20 data-[state=active]:text-loro-navy"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="email"
                className="data-[state=active]:bg-loro-sand/20 data-[state=active]:text-loro-navy"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger 
                value="property"
                className="data-[state=active]:bg-loro-sand/20 data-[state=active]:text-loro-navy"
              >
                <Home className="h-4 w-4 mr-2" />
                Propriété
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="chat" className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto mb-4 px-2">
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
                        ? 'bg-loro-hazel text-white'
                        : 'bg-loro-pearl text-loro-navy'
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
            
            <div className="relative border border-loro-sand rounded-md overflow-hidden">
              <Textarea
                className="resize-none pr-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[60px]"
                placeholder="Posez votre question..."
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <Button
                size="icon"
                className={`absolute right-2 bottom-2 rounded-full h-8 w-8 ${input.trim() ? 'bg-loro-hazel hover:bg-loro-hazel/90' : 'bg-loro-sand/50'}`}
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? 
                  <Loader className="h-4 w-4 animate-spin" /> : 
                  <Send className="h-4 w-4" />
                }
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="mb-4">
              <h3 className="font-timesNowSemi text-lg mb-2 text-loro-navy">Extraction d'email</h3>
              <p className="text-sm text-loro-hazel mb-3">
                Collez le contenu d'un email pour extraire automatiquement les informations du lead.
              </p>
              <Textarea
                className="w-full border-loro-sand focus-visible:ring-loro-navy"
                placeholder="Collez le contenu de l'email ici..."
                rows={8}
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
              <div className="flex gap-2 mt-3">
                <Button 
                  className="flex-1 bg-loro-hazel hover:bg-loro-hazel/90 text-white font-medium"
                  onClick={extractEmailData}
                  disabled={isLoading || !emailContent.trim()}
                >
                  {isLoading ? 
                    <Loader className="h-4 w-4 animate-spin mr-2" /> : 
                    <FileText className="h-4 w-4 mr-2" />
                  }
                  Valider et extraire les données
                </Button>
              </div>
            </div>
            
            {extractedData && (
              <div className="border border-loro-sand rounded-md p-4 mt-2 bg-loro-pearl/30">
                <h4 className="font-timesNowSemi text-lg mb-3 flex items-center justify-between text-loro-navy">
                  Données extraites
                  <ChevronDown className="h-4 w-4" />
                </h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(extractedData).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
                      <span className="font-medium text-loro-navy">{key}:</span>
                      <span className="text-loro-hazel">{String(value)}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  className="mt-4 w-full bg-loro-navy hover:bg-loro-navy/90" 
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
              <h3 className="font-timesNowSemi text-lg mb-2 text-loro-navy">Extraction de propriété</h3>
              <p className="text-sm text-loro-hazel mb-3">
                Entrez l'URL d'une propriété pour extraire automatiquement ses informations.
              </p>
              <div className="relative">
                <Input
                  type="text"
                  className="w-full border-loro-sand focus-visible:ring-loro-navy pr-14"
                  placeholder="https://www.exemple-immobilier.com/propriete/123"
                  value={propertyUrl}
                  onChange={(e) => setPropertyUrl(e.target.value)}
                />
                <Button 
                  className="absolute right-0 top-0 h-full px-3 bg-loro-hazel hover:bg-loro-hazel/90"
                  onClick={extractPropertyData}
                  disabled={isLoading || !propertyUrl.trim()}
                >
                  {isLoading ? 
                    <Loader className="h-4 w-4 animate-spin" /> : 
                    <ArrowRight className="h-4 w-4" />
                  }
                </Button>
              </div>
            </div>
            
            {extractedData && (
              <div className="border border-loro-sand rounded-md p-4 mt-2 bg-loro-pearl/30">
                <h4 className="font-timesNowSemi text-lg mb-3 flex items-center justify-between text-loro-navy">
                  Données extraites
                  <ChevronDown className="h-4 w-4" />
                </h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(extractedData).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
                      <span className="font-medium text-loro-navy">{key}:</span>
                      <span className="text-loro-hazel">{String(value)}</span>
                    </div>
                  ))}
                </div>
                <Button className="mt-4 w-full bg-loro-navy hover:bg-loro-navy/90">
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
