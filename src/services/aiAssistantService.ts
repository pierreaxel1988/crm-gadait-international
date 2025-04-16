
import { supabase } from '@/integrations/supabase/client';
import { LeadDetailed } from '@/types/lead';
import type { 
  AIMessage
} from '@/types/aiMessage';
import { 
  saveMessageToHistory, 
  getConversationHistory, 
  saveAIExchangeToDatabase,
  getConversationHistoryFromDB
} from '@/types/aiMessage';

export { saveMessageToHistory, getConversationHistory, getConversationHistoryFromDB };
export type { AIMessage };

export async function sendAIMessage(leadId: string, message: string, leadData?: LeadDetailed): Promise<AIMessage> {
  try {
    console.log('Sending message to AI for lead:', leadId);
    
    // Format contextuel détaillé pour l'assistant
    const leadContext = leadData ? `
Profil Client Gadait:
- Nom: ${leadData.name}
- Email: ${leadData.email || 'Non renseigné'}
- Téléphone: ${leadData.phone || 'Non renseigné'}
- Budget: ${leadData.budget || 'Non renseigné'} ${leadData.currency || 'EUR'}
- Localisation recherchée: ${leadData.desiredLocation || 'Non renseigné'}
- Types de propriété: ${leadData.propertyTypes?.join(', ') || 'Non renseigné'}
- Délai d'achat: ${leadData.purchaseTimeframe || 'Non renseigné'}
- Pays: ${leadData.country || 'Non renseigné'}
- Statut: ${leadData.status || 'Non renseigné'}
- Notes: ${leadData.notes || 'Aucune note'}
    ` : '';

    const authData = await supabase.auth.getSession();
    const userId = authData.data.session?.user?.id;

    // Appel de la fonction edge chat-gadait
    const { data, error } = await supabase.functions.invoke('chat-gadait', {
      body: {
        message,
        leadContext,
        type: 'assistant',
        leadId
      }
    });

    if (error) {
      console.error('Erreur assistant IA:', error);
      throw new Error(`Impossible de communiquer avec l'assistant: ${error.message}`);
    }

    // Création des messages utilisateur et assistant
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

    // Sauvegarde de l'historique local (pour la compatibilité)
    saveMessageToHistory(userMessage);
    saveMessageToHistory(assistantMessage);

    // Sauvegarde dans la base de données
    await saveAIExchangeToDatabase(leadId, message, data.response, userId);

    return assistantMessage;
  } catch (error) {
    console.error('Erreur du service assistant IA:', error);
    throw error;
  }
}
