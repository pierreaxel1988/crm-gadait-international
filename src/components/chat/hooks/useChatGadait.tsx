
import { useState, useEffect } from 'react';
import { useChatMessages } from './useChatMessages';
import { usePropertyExtraction } from './usePropertyExtraction';
import { LeadDetailed } from '@/types/lead';
import { Message } from '../types/chatTypes';

export const useChatGadait = (leadData?: LeadDetailed) => {
  const [activeTab, setActiveTab] = useState('chat');
  
  const chatProps = useChatMessages(leadData);
  const propertyProps = usePropertyExtraction();

  // Generate contextual suggestions based on lead data
  const getContextualSuggestions = (lead?: LeadDetailed) => {
    if (!lead) return [];
    
    const suggestions: string[] = [];
    
    // Basic suggestions that are almost always relevant
    suggestions.push(`Suggère des actions de suivi pour ${lead.name}`);
    suggestions.push(`Rédige un email de relance pour ${lead.name}`);
    
    // Location-based suggestions
    if (lead.desiredLocation) {
      suggestions.push(`Quelles propriétés recommandes-tu à ${lead.location || 'ce client'} dans ${lead.desiredLocation}?`);
    }
    
    // Budget-based suggestions
    if (lead.budget) {
      suggestions.push(`Analyse les options dans un budget de ${lead.budget} ${lead.currency || '€'}`);
    }
    
    // Status-based suggestions
    if (lead.status === 'Qualifié') {
      suggestions.push(`Prépare une stratégie de présentation de propriétés pour ce client qualifié`);
    } else if (lead.status === 'Nouveau') {
      suggestions.push(`Comment qualifier davantage ce nouveau lead?`);
    } else if (lead.status === 'Négociation') {
      suggestions.push(`Conseils pour finaliser la négociation en cours`);
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  // If we have leadData, send context to Supabase edge function for chat
  useEffect(() => {
    if (leadData && activeTab === 'chat' && chatProps.messages.length === 0) {
      // Add a welcome message about the lead context only if there are no messages yet
      const welcomeMessage: Message = {
        id: `system-welcome-${Date.now()}`,
        content: `Je suis maintenant connecté au contexte du lead ${leadData.name}. Je peux vous aider avec des suggestions spécifiques pour ce lead.`,
        role: 'system',
        timestamp: new Date()
      };
      
      chatProps.setMessages(prev => {
        // Only add the welcome message if it doesn't exist yet
        if (prev.length === 0 || !prev.some(msg => msg.content.includes('connecté au contexte'))) {
          return [...prev, welcomeMessage];
        }
        return prev;
      });
      
      // Update suggestions based on lead context
      if (chatProps.setSuggestedPrompts) {
        const contextualSuggestions = getContextualSuggestions(leadData);
        chatProps.setSuggestedPrompts(contextualSuggestions);
      }
    }
  }, [leadData, activeTab, chatProps.messages.length]);
  
  return {
    // Chat tab props
    messages: chatProps.messages,
    input: chatProps.input,
    setInput: chatProps.setInput,
    isLoading: chatProps.isLoading || propertyProps.isLoading,
    messagesEndRef: chatProps.messagesEndRef,
    handleSendMessage: chatProps.handleSendMessage,
    suggestedPrompts: chatProps.suggestedPrompts || getContextualSuggestions(leadData),
    setSuggestedPrompts: chatProps.setSuggestedPrompts,
    
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
