
import { useState, useEffect } from 'react';
import { useChatMessages } from './useChatMessages';
import { usePropertyExtraction } from './usePropertyExtraction';
import { LeadDetailed } from '@/types/lead';

export const useChatGadait = (leadData?: LeadDetailed) => {
  const [activeTab, setActiveTab] = useState('chat');
  
  const chatProps = useChatMessages(leadData);
  const propertyProps = usePropertyExtraction();

  // If we have leadData, send context to Supabase edge function for chat
  useEffect(() => {
    if (leadData && activeTab === 'chat') {
      // Add a welcome message about the lead context
      const welcomeMessage = {
        id: `system-welcome-${Date.now()}`,
        content: `Je suis maintenant connecté au contexte du lead ${leadData.name}. Je peux vous aider avec des suggestions spécifiques pour ce lead.`,
        role: 'system'
      };
      
      chatProps.setMessages(prev => {
        // Only add the welcome message if it doesn't exist yet
        if (prev.length === 0 || !prev.some(msg => msg.content.includes('connecté au contexte'))) {
          return [...prev, welcomeMessage];
        }
        return prev;
      });
    }
  }, [leadData, activeTab]);
  
  return {
    // Chat tab props
    messages: chatProps.messages,
    input: chatProps.input,
    setInput: chatProps.setInput,
    isLoading: chatProps.isLoading || propertyProps.isLoading,
    messagesEndRef: chatProps.messagesEndRef,
    handleSendMessage: chatProps.handleSendMessage,
    
    // Property tab props
    propertyUrl: propertyProps.propertyUrl,
    setPropertyUrl: propertyProps.setPropertyUrl,
    extractPropertyData: propertyProps.extractPropertyData,
    extractedData: activeTab === 'property' ? propertyProps.extractedData : null,
    
    // Tab management
    activeTab,
    setActiveTab,
    
    // Lead context
    leadData
  };
};
