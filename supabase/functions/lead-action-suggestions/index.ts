
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead } = await req.json();
    console.log('Received request for lead action suggestions for lead:', lead.id);

    if (!lead) {
      throw new Error("Lead data is required");
    }

    // Construire un contexte riche avec toutes les informations du lead
    const leadContext = `
Profil Client Gadait:
- Nom: ${lead.name || 'Non renseigné'}
- Email: ${lead.email || 'Non renseigné'}
- Téléphone: ${lead.phone || 'Non renseigné'}
- Budget: ${lead.budgetMin || '0'} - ${lead.budget || '0'} ${lead.currency || 'EUR'}
- Localisation recherchée: ${lead.desiredLocation || 'Non renseigné'}
- Types de propriété: ${lead.propertyTypes?.join(', ') || 'Non renseigné'}
- Nombre de chambres: ${Array.isArray(lead.bedrooms) ? lead.bedrooms.join(', ') : lead.bedrooms || 'Non renseigné'}
- Vues souhaitées: ${lead.views?.join(', ') || 'Non renseigné'}
- Délai d'achat: ${lead.purchaseTimeframe || 'Non renseigné'}
- Pays: ${lead.country || 'Non renseigné'}
- Statut: ${lead.status || 'Non renseigné'}
- Langue préférée: ${lead.preferredLanguage || 'français'}
- Notes: ${lead.notes || 'Aucune note'}
- Dernières actions: ${lead.actionHistory?.slice(0, 3).map(a => 
    `${a.actionType} (${a.completedDate ? 'complété' : 'en attente'})${a.notes ? ': ' + a.notes : ''}`
  ).join('; ') || 'Aucune action précédente'}
`;

    const systemPrompt = `Tu es l'assistant IA de GADAIT International, spécialisé dans l'immobilier de luxe. Ta mission est d'analyser le profil client ci-dessous et de proposer 3 ACTIONS concrètes et personnalisées que l'agent immobilier devrait entreprendre pour ce client spécifique.

${leadContext}

Pour chaque action suggérée, fournis:
1. Un type d'action précis (Appel, WhatsApp, Email, Visite virtuelle, Proposition de biens, etc.)
2. Une description courte mais claire de l'action à réaliser
3. Un texte prêt à l'emploi que l'agent peut utiliser tel quel (message WhatsApp, email, script d'appel)

Format de réponse: Fournis uniquement un tableau JSON d'actions, chaque action ayant les propriétés: type, description, et messageTexte. Ton JSON doit être compatible avec JavaScript.

Adapte le ton, la langue et le style aux préférences du client et à son statut dans le parcours d'achat.`;

    // Utiliser GPT-4o Mini avec une température basse pour des réponses précises et structurées
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: "Génère des actions pour ce client" }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API returned an error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Received response from OpenAI');
    
    // Nettoyer la réponse pour s'assurer que c'est du JSON valide
    let suggestions;
    try {
      const content = data.choices[0].message.content;
      suggestions = JSON.parse(content);
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      throw new Error('Invalid JSON response from AI');
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in lead-action-suggestions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
