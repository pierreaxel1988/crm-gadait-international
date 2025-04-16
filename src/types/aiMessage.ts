
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
    // Placeholder for actual database saving logic
    console.log('Saving AI exchange to database', {
      leadId,
      userMessage,
      assistantResponse,
      userId
    });
  } catch (error) {
    console.error('Error saving AI exchange to database:', error);
  }
}
