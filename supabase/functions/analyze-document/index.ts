
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gérer les requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileContent, fileName, fileType } = await req.json();
    
    if (!fileContent) {
      throw new Error('Aucun contenu de fichier fourni');
    }

    console.log(`Analyse du document: ${fileName} (${fileType})`);
    
    let analysisResult;
    
    // Si c'est une image, utilisons l'API Vision
    if (fileType.startsWith('image/')) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'system',
              content: "Vous êtes un assistant spécialisé dans l'analyse d'images pour l'immobilier de luxe. Extrayez toutes les informations pertinentes concernant la propriété visible dans l'image."
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: "Analysez cette image et extrayez toutes les informations pertinentes pour un agent immobilier de luxe." },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${fileType};base64,${fileContent}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur OpenAI API: ${await response.text()}`);
      }

      const data = await response.json();
      analysisResult = data.choices[0].message.content;
    }
    // Pour les PDFs et autres documents, nous utiliserions d'autres API ou méthodes
    // Mais pour cet exemple, nous allons simplement retourner un message
    else {
      analysisResult = `Analyse de documents de type ${fileType} n'est pas encore implémentée. Ce type de fichier sera bientôt pris en charge.`;
    }
    
    console.log('Analyse réussie');

    return new Response(
      JSON.stringify({ text: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur dans la fonction analyze-document:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
