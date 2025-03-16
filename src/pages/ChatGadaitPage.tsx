
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useChatGadait } from '@/components/chat/hooks/useChatGadait';
import EnhancedInput from '@/components/chat/EnhancedInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useLeadExtraction } from '@/hooks/useLeadExtraction';
import ChatGadaitHeader from '@/components/chat/ChatGadaitHeader';
import ExtractedLeadForm from '@/components/chat/ExtractedLeadForm';

const ChatGadaitPage: React.FC = () => {
  const {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSendMessage,
  } = useChatGadait();

  const {
    showLeadForm,
    setShowLeadForm,
    selectedAgent,
    setSelectedAgent,
    extractedData,
    extractLeadFromMessage,
    handleImportLead
  } = useLeadExtraction();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto px-4">
      <ChatGadaitHeader 
        title="Chat Gadait" 
        subtitle="Assistant IA pour la gestion des leads et des propriétés" 
      />
      
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
            <ExtractedLeadForm
              extractedData={extractedData}
              selectedAgent={selectedAgent}
              setSelectedAgent={setSelectedAgent}
              onCancel={() => setShowLeadForm(false)}
              onImport={handleImportLead}
            />
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
