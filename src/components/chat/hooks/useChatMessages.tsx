
import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeadDetailed } from '@/types/lead';
import { Message } from '../types/chatTypes';

export const useChatMessages = (leadData?: LeadDetailed) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages from Supabase when leadData changes
  useEffect(() => {
    if (leadData?.id) {
      fetchMessages(leadData.id);
    } else {
      // Reset messages if no lead selected
      setMessages([]);
    }
  }, [leadData?.id]);

  // Function to fetch messages from Supabase
  const fetchMessages = async (leadId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lead_chat_messages')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat messages:', error);
        return;
      }

      if (data && data.length > 0) {
        // Transform the data to match our Message interface
        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as 'user' | 'assistant' | 'system',
          timestamp: new Date(msg.created_at)
        }));
        setMessages(formattedMessages);
        
        // Scroll to bottom after loading messages
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save a message to Supabase
  const saveMessage = async (message: Message, leadId?: string) => {
    if (!leadId) return;
    
    try {
      const { error } = await supabase
        .from('lead_chat_messages')
        .insert({
          id: message.id,
          lead_id: leadId,
          role: message.role,
          content: message.content,
          created_at: message.timestamp.toISOString(),
        });

      if (error) {
        console.error('Error saving message to Supabase:', error);
      }
    } catch (error) {
      console.error('Error in saveMessage:', error);
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (input.trim() === '') return;
    
    const now = new Date();
    
    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      role: 'user',
      timestamp: now
    };
    
    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Save user message to Supabase if we have a lead
    if (leadData?.id) {
      await saveMessage(userMessage, leadData.id);
    }

    try {
      let payload: { 
        message: string; 
        type: string;
        leadContext?: any;
      } = { 
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
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Save assistant message to Supabase if we have a lead
        if (leadData?.id) {
          await saveMessage(assistantMessage, leadData.id);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Je suis désolé, une erreur s'est produite. Veuillez réessayer.",
        role: 'system',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      // Save error message to Supabase if we have a lead
      if (leadData?.id) {
        await saveMessage(errorMessage, leadData.id);
      }
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
