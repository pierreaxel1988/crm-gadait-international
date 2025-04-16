
import { supabase } from '@/integrations/supabase/client';
import { LeadDetailed } from '@/types/lead';

export interface AIMessage {
  id: string;
  leadId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  leadId: string;
  messages: AIMessage[];
}

export async function sendAIMessage(leadId: string, message: string, leadData?: LeadDetailed): Promise<AIMessage> {
  try {
    console.log('Sending message to AI for lead:', leadId);
    
    // Format lead data to provide context to the AI
    const leadContext = leadData ? `
Lead Info:
- Name: ${leadData.name}
- Email: ${leadData.email || 'Non renseigné'}
- Phone: ${leadData.phone || 'Non renseigné'}
- Budget: ${leadData.budget || 'Non renseigné'} ${leadData.currency || 'EUR'}
- Desired Location: ${leadData.desiredLocation || 'Non renseigné'}
- Property Type: ${leadData.propertyTypes?.join(', ') || 'Non renseigné'}
- Purchase Timeframe: ${leadData.purchaseTimeframe || 'Non renseigné'}
- Country: ${leadData.country || 'Non renseigné'}
- Status: ${leadData.status || 'Non renseigné'}
- Pipeline: ${leadData.pipeline || 'Non renseigné'}
- Notes: ${leadData.notes || 'Aucune note'}
    ` : '';

    // Use the chat-gadait edge function to process the request
    const { data, error } = await supabase.functions.invoke('chat-gadait', {
      body: {
        message,
        leadContext,
        type: 'assistant',
        leadId
      }
    });

    if (error) {
      console.error('Error calling AI assistant:', error);
      throw new Error(`Erreur lors de la communication avec l'assistant IA: ${error.message}`);
    }

    // Create message objects
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      leadId,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    const assistantMessage: AIMessage = {
      id: crypto.randomUUID(),
      leadId,
      role: 'assistant',
      content: data.response,
      timestamp: new Date().toISOString()
    };

    // Save conversation to localStorage for persistence
    saveMessageToHistory(userMessage);
    saveMessageToHistory(assistantMessage);

    return assistantMessage;
  } catch (error) {
    console.error('Error in AI assistant service:', error);
    throw error;
  }
}

export function getConversationHistory(leadId: string): AIMessage[] {
  try {
    const storageKey = `ai_conversation_${leadId}`;
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    return [];
  } catch (error) {
    console.error('Error retrieving conversation history:', error);
    return [];
  }
}

function saveMessageToHistory(message: AIMessage): void {
  try {
    const storageKey = `ai_conversation_${message.leadId}`;
    const existingMessages = getConversationHistory(message.leadId);
    
    const updatedMessages = [...existingMessages, message];
    localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
  } catch (error) {
    console.error('Error saving message to history:', error);
  }
}
