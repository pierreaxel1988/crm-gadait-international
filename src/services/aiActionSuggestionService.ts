
import { LeadDetailed } from '@/types/lead';
import { sendAIMessage } from './aiAssistantService';
import { TaskType } from '@/components/kanban/KanbanCard';
import { toast } from '@/hooks/use-toast';
import { addActionToLead } from './leadActions';

export interface AISuggestedAction {
  id: string;
  actionType: TaskType;
  scheduledDate: Date;
  notes: string;
  template?: string;
}

export async function generateLeadActionSuggestions(
  lead: LeadDetailed
): Promise<AISuggestedAction[] | null> {
  try {
    // Formulate a prompt for the AI to generate action suggestions
    const prompt = `
      En tant qu'agent immobilier de luxe chez GADAIT International, génère 3 actions pertinentes 
      à effectuer pour ce lead en fonction de son profil et de son statut actuel. Tiens compte de 
      toutes ses informations et du contexte pour proposer les meilleures actions.
      
      Format de réponse: Réponds UNIQUEMENT avec un tableau JSON valide au format suivant sans aucun texte avant ou après:
      [
        {
          "actionType": "Call", // Doit être l'un des types suivants: "Call", "Visites", "Compromis", "Acte de vente", "Contrat de Location", "Propositions", "Follow up", "Estimation", "Prospection", "Admin"
          "scheduledDate": "2023-05-15T14:30:00", // Date ISO au format YYYY-MM-DDTHH:MM:SS
          "notes": "Description détaillée de l'action à effectuer"
        },
        ...
      ]
    `;

    // Send the prompt to the AI assistant
    const response = await sendAIMessage(lead.id, prompt, lead);
    
    if (!response || !response.content) {
      return null;
    }

    // Extract the JSON array from the response
    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No valid JSON array found in the AI response');
      return null;
    }

    // Parse the JSON string into an array of action suggestions
    const suggestions = JSON.parse(jsonMatch[0]) as Array<{
      actionType: TaskType;
      scheduledDate: string;
      notes: string;
    }>;

    // Convert to proper AISuggestedAction format
    return suggestions.map(suggestion => ({
      id: `suggestion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      actionType: suggestion.actionType,
      scheduledDate: new Date(suggestion.scheduledDate),
      notes: suggestion.notes
    }));
  } catch (error) {
    console.error('Error generating action suggestions:', error);
    return null;
  }
}

export async function implementSuggestedAction(leadId: string, suggestion: AISuggestedAction): Promise<boolean> {
  try {
    // Add the suggested action to the lead
    await addActionToLead(leadId, {
      actionType: suggestion.actionType,
      scheduledDate: suggestion.scheduledDate.toISOString(),
      notes: suggestion.notes
    });
    
    toast({
      title: "Action ajoutée",
      description: `${suggestion.actionType} a été ajouté avec succès`
    });
    
    return true;
  } catch (error) {
    console.error('Error implementing suggested action:', error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible d'ajouter l'action suggérée"
    });
    return false;
  }
}
