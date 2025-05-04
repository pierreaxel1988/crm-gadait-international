
import { useState, useEffect } from 'react';
import { useChatMessages } from './useChatMessages';
import { usePropertyExtraction } from './usePropertyExtraction';
import { LeadDetailed } from '@/types/lead';
import { Message } from '../types/chatTypes';

export const useChatGadait = (leadData?: LeadDetailed, initialPrompt?: string) => {
  const [activeTab, setActiveTab] = useState('chat');
  
  const chatProps = useChatMessages(leadData);
  const propertyProps = usePropertyExtraction();

  // Generate contextual suggestions based on lead data and current tab
  const getContextualSuggestions = (lead?: LeadDetailed) => {
    if (!lead) {
      // Default suggestions when no lead data is available
      return [
        "Suggère des stratégies de prospection efficaces",
        "Comment qualifier un nouveau lead?",
        "Comment optimiser le suivi des leads?",
        "Rédige un modèle d'email de présentation",
        "Quels sont les éléments clés d'une bonne fiche lead?"
      ];
    }
    
    const suggestions: string[] = [];
    
    // Lead name-based suggestions
    if (lead.name) {
      suggestions.push(`Suggère des actions de suivi pour ${lead.name}`);
      suggestions.push(`Rédige un email de relance pour ${lead.name}`);
    }
    
    // Location-based suggestions
    if (lead.desiredLocation) {
      suggestions.push(`Quelles propriétés recommandes-tu à ${lead.name || 'ce client'} dans ${lead.desiredLocation}?`);
      suggestions.push(`Analyse le marché immobilier à ${lead.desiredLocation}`);
    }
    
    // Budget-based suggestions
    if (lead.budget) {
      suggestions.push(`Analyse les options dans un budget de ${lead.budget} ${lead.currency || '€'}`);
      suggestions.push(`Comment négocier au mieux avec un budget de ${lead.budget} ${lead.currency || '€'}?`);
    }
    
    // Status-based suggestions
    if (lead.status) {
      if (lead.status === 'Qualified') {
        suggestions.push(`Prépare une stratégie de présentation de propriétés pour ce client qualifié`);
      } else if (lead.status === 'New') {
        suggestions.push(`Comment qualifier davantage ce nouveau lead?`);
        suggestions.push(`Quelles questions poser pour mieux cerner les besoins de ${lead.name || 'ce lead'}?`);
      } else if (lead.status === 'Proposal') {
        suggestions.push(`Conseils pour finaliser la négociation en cours`);
        suggestions.push(`Comment sécuriser la vente avec ${lead.name || 'ce client'}?`);
      }
    }

    // Property type-based suggestions
    if (lead.propertyType) {
      suggestions.push(`Quels sont les points forts à mettre en avant pour un bien de type ${lead.propertyType}?`);
    }
    
    // Add some generic but useful suggestions if we don't have enough
    if (suggestions.length < 3) {
      suggestions.push(`Comment améliorer la communication avec ${lead.name || 'ce client'}?`);
      suggestions.push(`Analyse le potentiel d'achat de ce lead`);
      suggestions.push(`Rédige un récapitulatif des besoins de ${lead.name || 'ce client'}`);
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
      const contextualSuggestions = getContextualSuggestions(leadData);
      chatProps.setSuggestedPrompts(contextualSuggestions);
    }
  }, [leadData, activeTab, chatProps.messages.length]);

  // Handle initialPrompt if provided (e.g. "redige moi le prochain message")
  useEffect(() => {
    if (initialPrompt && leadData && chatProps.messages.length <= 1) {
      // Send the initial prompt automatically
      const userMessage: Message = {
        id: `user-initial-${Date.now()}`,
        content: initialPrompt,
        role: 'user',
        timestamp: new Date()
      };

      chatProps.setMessages(prev => [...prev, userMessage]);
      
      // Using a timeout to allow the UI to update before sending the message
      setTimeout(() => {
        // Fix: Remove the parameter here, as handleSendMessage() might not expect an argument
        chatProps.handleSendMessage();
      }, 100);
    }
  }, [initialPrompt, leadData, chatProps.messages.length]);
  
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
