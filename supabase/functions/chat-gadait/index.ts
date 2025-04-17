
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

Si on te demande de générer des actions à entreprendre, tu dois fournir une liste structurée d'actions avec leurs dates et descriptions détaillées, au format JSON qui respecte strictement la structure demandée.`;

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
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
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
