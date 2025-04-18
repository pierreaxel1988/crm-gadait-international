
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
    const { message, leadContext, type } = await req.json();
    console.log('Received request for chat-gadait:');
    console.log('Message:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));
    console.log('Type:', type);
    console.log('Lead context length:', leadContext ? leadContext.length : 0);

    // Check if it's a structured data request (e.g., JSON format for actions)
    const isStructuredDataRequest = message.includes('Format de réponse:') && 
                                   (message.includes('JSON') || message.includes('tableau'));

    const model = isStructuredDataRequest ? 'gpt-4o-mini' : 'gpt-4o-mini';
    const temperature = isStructuredDataRequest ? 0.2 : 0.7;

    const systemPrompt = `Tu es Chat Gadait, un assistant IA spécialisé dans l'immobilier de luxe international.

Contexte client:
${leadContext || "Aucune information disponible"}

Tu dois:
- Être ultra-précis et professionnel
- Adapter ton langage au profil du client
- Proposer des communications raffinées
- Valoriser l'expertise de GADAIT International
- Être concis mais impactant

Objectifs de communication:
- Générer des messages personnalisés
- Proposer des actions concrètes
- Inspirer confiance
- Démontrer une expertise haut de gamme

${isStructuredDataRequest ? 'IMPORTANT: Pour les demandes de génération de structures de données comme des actions ou des tâches, tu dois fournir une réponse exactement dans le format demandé, sans aucun texte avant ou après. Assure-toi que le format JSON est parfaitement valide et respecte la structure demandée.' : ''}`;

    console.log('Using model:', model);
    console.log('Using temperature:', temperature);
    console.log('Is structured data request:', isStructuredDataRequest);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API returned an error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI response received, content length:', data.choices[0].message.content.length);
    
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur dans chat-gadait:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
