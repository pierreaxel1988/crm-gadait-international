
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, lead } = await req.json();
    
    // Format the system message with lead information for context
    const systemPrompt = `Tu es GADAIT Assistant, l'assistant IA de GADAIT International, une société de luxe immobilier.
    
    Voici les informations du client que tu dois utiliser pour personnaliser tes réponses:
    - Nom: ${lead.nom || "Client"}
    - Budget: ${lead.budget_min || ""} à ${lead.budget_max || ""} ${lead.devise || "EUR"}
    - Type de bien recherché: ${lead.type_bien || "Non spécifié"}
    - Vue souhaitée: ${lead.vue_souhaitee || "Non spécifié"}
    - Nombre de chambres: ${lead.nb_chambres || "Non spécifié"}
    - Localisation: ${lead.localisation || "Non spécifié"}
    - Notes générales: ${lead.notes_generales || "Aucune note"}
    - Agent en charge: ${lead.agent || "Non assigné"}
    - Langue préférée: ${lead.langue || "français"}
    
    Sois concis, professionnel et chaleureux. Personnalise toujours tes réponses en fonction des informations du client.
    
    Pour les messages WhatsApp ou emails, structure bien ton message avec:
    1. Une salutation personnalisée
    2. Le corps du message pertinent et concis
    3. Une signature professionnelle au nom de GADAIT International ou de l'agent en charge

    Si on te demande un résumé du client, sois précis et concis.`;
    
    console.log("Sending request to OpenAI");
    
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
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      throw new Error(data.error.message || "Error from OpenAI API");
    }
    
    const aiResponse = data.choices[0].message.content;
    console.log("Received response from OpenAI");

    return new Response(JSON.stringify({ result: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-gadait function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
