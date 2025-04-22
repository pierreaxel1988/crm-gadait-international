
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { propertyData } = await req.json()
    
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = `Générer une description immobilière haut de gamme en français pour la propriété suivante. 
    La description doit être élégante, sophistiquée et mettre en valeur les atouts de la propriété.
    Détails de la propriété:
    ${JSON.stringify(propertyData, null, 2)}
    
    La description doit :
    - Commencer par une accroche captivante
    - Mettre en avant l'emplacement et les vues
    - Décrire l'architecture et les finitions de manière élégante
    - Souligner les équipements luxueux
    - Se terminer par une conclusion qui souligne l'exclusivité
    - Faire environ 300-400 mots
    - Utiliser un vocabulaire haut de gamme mais sans excès
    - Être rédigée dans un style fluide et naturel`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un expert en immobilier de luxe qui rédige des descriptions de propriétés haut de gamme.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    const description = data.choices[0].message.content

    return new Response(
      JSON.stringify({ description }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      },
    )
  }
})
