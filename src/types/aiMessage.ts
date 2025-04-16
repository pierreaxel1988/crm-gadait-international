
export interface AIMessage {
  id: string;
  leadId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function saveMessageToHistory(message: AIMessage): void {
  try {
    const conversationHistory = JSON.parse(
      localStorage.getItem(`lead_conversation_${message.leadId}`) || '[]'
    );
    conversationHistory.push(message);
    localStorage.setItem(
      `lead_conversation_${message.leadId}`, 
      JSON.stringify(conversationHistory)
    );
  } catch (error) {
    console.error('Error saving message to history:', error);
  }
}

export function getConversationHistory(leadId: string): AIMessage[] {
  try {
    const conversationHistory = localStorage.getItem(`lead_conversation_${leadId}`);
    return conversationHistory ? JSON.parse(conversationHistory) : [];
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
}

export async function saveAIExchangeToDatabase(
  leadId: string, 
  userMessage: string, 
  assistantResponse: string, 
  userId?: string
): Promise<void> {
  try {
    // Import needed within the function to avoid circular imports
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Generate a conversation ID if it doesn't exist in localStorage
    let conversationId = localStorage.getItem(`lead_conversation_id_${leadId}`);
    
    if (!conversationId) {
      conversationId = `conv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem(`lead_conversation_id_${leadId}`, conversationId);
    }
    
    // Get current sequence count
    const { data: lastMessages } = await supabase
      .from('lead_ai_conversations')
      .select('sequence_order')
      .eq('conversation_id', conversationId)
      .order('sequence_order', { ascending: false })
      .limit(1);
    
    const nextSequence = lastMessages && lastMessages.length > 0 
      ? lastMessages[0].sequence_order + 1 
      : 0;
    
    // Insert user message
    await supabase.from('lead_ai_conversations').insert({
      lead_id: leadId,
      user_id: userId,
      role: 'user',
      content: userMessage,
      conversation_id: conversationId,
      sequence_order: nextSequence
    });
    
    // Insert assistant response
    await supabase.from('lead_ai_conversations').insert({
      lead_id: leadId,
      user_id: userId,
      role: 'assistant',
      content: assistantResponse,
      conversation_id: conversationId,
      sequence_order: nextSequence + 1
    });
    
    console.log('AI exchange saved to database successfully');
  } catch (error) {
    console.error('Error saving AI exchange to database:', error);
  }
}

// Function to get conversation history from database
export async function getConversationHistoryFromDB(
  leadId: string, 
  limit = 50
): Promise<AIMessage[]> {
  try {
    // Import needed within the function to avoid circular imports
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Get conversation ID from localStorage
    const conversationId = localStorage.getItem(`lead_conversation_id_${leadId}`);
    
    if (!conversationId) {
      return [];
    }
    
    // Fetch messages from database
    const { data, error } = await supabase
      .from('lead_ai_conversations')
      .select('*')
      .eq('lead_id', leadId)
      .eq('conversation_id', conversationId)
      .order('sequence_order', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
    
    // Map database records to AIMessage format
    return data.map(record => ({
      id: record.id,
      leadId: record.lead_id,
      role: record.role as 'user' | 'assistant',
      content: record.content,
      timestamp: record.created_at
    }));
  } catch (error) {
    console.error('Error getting conversation history from DB:', error);
    return [];
  }
}
