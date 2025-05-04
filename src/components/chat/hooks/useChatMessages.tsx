
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeadDetailed } from '@/types/lead';

export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
};

export const useChatMessages = (leadData?: LeadDetailed) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = useCallback(async () => {
    if (input.trim() === '') return;
    
    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      role: 'user'
    };
    
    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let payload = { 
        message: input,
        type: 'chat'
      };
      
      // If leadData exists, include it in the payload
      if (leadData) {
        payload = { 
          ...payload, 
          leadContext: {
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
            source: leadData.source,
            budget: leadData.budget,
            currency: leadData.currency,
            desiredLocation: leadData.desiredLocation,
            country: leadData.country,
            propertyType: leadData.propertyType,
            assignedTo: leadData.assignedTo,
            status: leadData.status,
            pipelineType: leadData.pipelineType,
            purchaseTimeframe: leadData.purchaseTimeframe,
            bedrooms: leadData.bedrooms,
            bathrooms: leadData.bathrooms
          }
        };
      }
      
      const { data: responseData, error } = await supabase.functions.invoke('chat-gadait', {
        body: payload
      });

      if (error) throw new Error(error.message);
      
      if (responseData) {
        // Add assistant's response to chat
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          content: responseData.response,
          role: 'assistant'
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Je suis désolé, une erreur s'est produite. Veuillez réessayer.",
        role: 'system'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      
      // Scroll to bottom after messages update
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [input, leadData]);

  return { messages, setMessages, input, setInput, isLoading, messagesEndRef, handleSendMessage };
};
