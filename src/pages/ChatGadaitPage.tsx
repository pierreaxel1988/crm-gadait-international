
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatGadait } from '@/components/chat/hooks/useChatGadait';
import EnhancedInput from '@/components/chat/EnhancedInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import TeamMemberSelect from '@/components/leads/TeamMemberSelect';
import { toast } from '@/hooks/use-toast';
import { createLead } from '@/services/leadCore';
import { Country, PropertyType } from '@/types/lead';
import { LeadStatus } from '@/components/common/StatusBadge';
import { LeadTag } from '@/components/common/TagBadge';
import { TaskType } from '@/components/kanban/KanbanCard';
import { supabase } from '@/integrations/supabase/client';

const ChatGadaitPage = () => {
  const navigate = useNavigate();
  const {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSendMessage,
    extractedData,
    extractLeadFromMessage,
    setShowLeadForm,
    showLeadForm,
    selectedAgent,
    setSelectedAgent
  } = useChatGadait();

  const [agentName, setAgentName] = React.useState<string | undefined>();

  // Récupérer le nom du commercial quand selectedAgent change
  React.useEffect(() => {
    const fetchAgentName = async () => {
      if (!selectedAgent) {
        setAgentName(undefined);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('name')
          .eq('id', selectedAgent)
          .single();
          
        if (error) {
          console.error('Error fetching agent name:', error);
          return;
        }
        
        if (data) {
          setAgentName(data.name);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchAgentName();
  }, [selectedAgent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImportLead = () => {
    if (!selectedAgent) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un commercial à qui assigner ce lead."
      });
      return;
    }

    if (!extractedData) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucune donnée de lead n'a été extraite."
      });
      return;
    }

    try {
      // Prepare lead data using all available information from extractedData
      const newLead = {
        name: extractedData.name || "",
        email: extractedData.email || "",
        phone: extractedData.phone || "",
        source: "Le Figaro" as const,
        budget: extractedData.budget || "",
        propertyReference: extractedData.reference || "",
        desiredLocation: extractedData.desiredLocation || "",
        propertyType: (extractedData.propertyType || extractedData.type || "") as PropertyType,
        country: (extractedData.country || "Spain") as Country,
        notes: input || "",
        status: "New" as LeadStatus,
        tags: ["Imported" as LeadTag],
        assignedTo: selectedAgent,
        assignedToName: agentName,
        taskType: "Call" as TaskType,
        // Add bedrooms information if available
        bedrooms: extractedData.bedrooms,
        // Add views information if available
        views: extractedData.views as string[] | undefined,
        // Add amenities if available
        amenities: extractedData.amenities as string[] | undefined
      };
      
      const createdLead = createLead(newLead);
      
      toast({
        title: "Lead importé",
        description: `Le lead ${newLead.name} a été créé avec succès et assigné à ${agentName || 'un commercial'}.`
      });
      
      setShowLeadForm(false);
      setSelectedAgent(undefined);
      
      if (createdLead && createdLead.id) {
        setTimeout(() => {
          navigate(`/leads/${createdLead.id}`);
        }, 500);
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le lead."
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto px-4">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-timesNowSemi text-loro-navy flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Chat Gadait
        </h1>
        <p className="text-zinc-800">Assistant IA pour la gestion des leads et des propriétés</p>
      </div>
      
      <div className="flex-1 flex flex-col bg-loro-white rounded-lg shadow-luxury overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 px-2">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <MessageSquare className="h-12 w-12 mx-auto text-loro-hazel opacity-50" />
                  <h3 className="text-xl font-medium text-loro-navy">Bienvenue sur Chat Gadait</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Comment puis-je vous aider aujourd'hui avec vos leads et propriétés?
                  </p>
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                  <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-loro-hazel text-white' : 'bg-loro-pearl/50 text-loro-navy'} shadow-sm`}>
                    {msg.content}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-loro-pearl">
          {showLeadForm && extractedData && (
            <div className="mb-4 p-3 bg-loro-pearl/30 rounded-md">
              <h3 className="font-medium text-loro-navy mb-2">Données du lead extraites</h3>
              <div className="space-y-2 text-sm mb-3">
                <p><span className="font-medium">Nom:</span> {extractedData.name}</p>
                <p><span className="font-medium">Email:</span> {extractedData.email}</p>
                <p><span className="font-medium">Téléphone:</span> {extractedData.phone}</p>
                <p><span className="font-medium">Budget:</span> {extractedData.budget}</p>
                <p><span className="font-medium">Localisation:</span> {extractedData.desiredLocation}</p>
                <p><span className="font-medium">Type de propriété:</span> {extractedData.propertyType}</p>
                <p><span className="font-medium">Référence:</span> {extractedData.reference}</p>
              </div>
              
              <div className="mb-3">
                <TeamMemberSelect
                  value={selectedAgent}
                  onChange={setSelectedAgent}
                  label="Attribuer à un commercial"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowLeadForm(false)}
                >
                  Annuler
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleImportLead}
                  className="bg-loro-navy hover:bg-loro-navy/90"
                >
                  Importer le lead
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex gap-2 mb-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => extractLeadFromMessage(input)}
              disabled={isLoading || !input}
              className="text-xs"
            >
              Extraire un lead
            </Button>
          </div>
          
          <EnhancedInput 
            input={input} 
            setInput={setInput} 
            placeholder="Demandez n'importe quoi ou collez un email pour extraire un lead..." 
            isLoading={isLoading} 
            handleSend={handleSendMessage} 
            onKeyDown={handleKeyDown} 
          />
        </div>
      </div>
    </div>
  );
};

export default ChatGadaitPage;
