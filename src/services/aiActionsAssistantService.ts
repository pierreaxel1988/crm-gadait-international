
import { AISuggestedAction } from './aiActionSuggestionService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Génère des suggestions d'actions en utilisant l'assistant IA Gadait
 * @param prompt - La demande de l'utilisateur
 * @returns Array of suggested actions
 */
export async function generateAIActionSuggestions(prompt: string): Promise<AISuggestedAction[] | null> {
  try {
    // Format de la demande à l'IA
    const formattedPrompt = `
      En tant qu'assistant IA spécialisé dans l'immobilier de luxe, génère des suggestions 
      d'actions pertinentes basées sur cette demande: "${prompt}"
      
      Format de réponse: Réponds UNIQUEMENT avec un tableau JSON valide au format suivant sans aucun texte avant ou après:
      [
        {
          "actionType": "Call", // Doit être l'un des types suivants: "Call", "Visites", "Compromis", "Acte de vente", "Contrat de Location", "Propositions", "Follow up", "Estimation", "Prospection", "Admin"
          "scheduledDate": "2023-05-15T14:30:00", // Date ISO au format YYYY-MM-DDTHH:MM:SS (dans les 7 prochains jours)
          "notes": "Description détaillée de l'action à effectuer"
        },
        ...
      ]
    `;

    console.log('Envoi de la demande à l\'assistant Gadait IA');
    
    // Appel de la fonction edge chat-gadait
    const { data, error } = await supabase.functions.invoke('chat-gadait', {
      body: {
        message: formattedPrompt,
        type: 'structured',
        leadContext: ''
      }
    });

    if (error) {
      console.error('Erreur assistant IA:', error);
      throw new Error(`Impossible de communiquer avec l'assistant: ${error.message}`);
    }

    console.log('Réponse reçue de l\'assistant:', data);

    // Essayer de parser la réponse JSON
    try {
      let jsonResponse;
      
      if (typeof data.response === 'string') {
        // Essayer d'extraire le JSON si c'est une chaîne contenant du JSON
        const jsonMatch = data.response.match(/\[\s*\{[\s\S]*\}\s*\]/);
        jsonResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(data.response);
      } else {
        jsonResponse = data.response;
      }
      
      if (!Array.isArray(jsonResponse)) {
        console.error('La réponse n\'est pas un tableau:', jsonResponse);
        return null;
      }

      // Valider et transformer les suggestions
      const validSuggestions = jsonResponse.filter(suggestion => 
        suggestion.actionType && 
        suggestion.scheduledDate && 
        suggestion.notes
      );

      if (validSuggestions.length === 0) {
        console.error('Aucune suggestion valide trouvée');
        return null;
      }

      // Transformer en AISuggestedAction
      return validSuggestions.map(suggestion => ({
        id: `suggestion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        actionType: suggestion.actionType,
        scheduledDate: new Date(suggestion.scheduledDate),
        notes: suggestion.notes
      }));
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      console.error('Contenu reçu:', data.response);
      return null;
    }
  } catch (error) {
    console.error('Erreur générale dans generateAIActionSuggestions:', error);
    throw error;
  }
}
