
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
    const { message, type, content, propertyDetails, initialData, url, leadContext, leadId } = await req.json();
    
    let systemPrompt = "You are Chat Gadait, an AI assistant for a luxury real estate CRM. Be concise and helpful.";
    let userMessage = message;
    
    // Handle different types of requests
    if (type === 'email-extract') {
      systemPrompt = `You are Chat Gadait, an AI assistant for a luxury real estate CRM.
      Extract the following information from the email content:
      - Name: Full name of the sender or the potential client mentioned in the email
      - Email address: The email address of the sender or the potential client
      - Phone number: Any phone number mentioned in the email
      - Property reference: If any property reference code is mentioned (like REF123, etc.)
      - Source/portal: The website or platform mentioned (Le Figaro, Idealista, Property Cloud, etc.)
      - Budget or price mentioned: Any budget range or specific price mentioned
      - Currency: The currency mentioned (EUR, USD, GBP, CHF)
      - Desired location: Any location preferences mentioned (city, area, neighborhood)
      - Property type preferences: Type of property they're looking for (Villa, Apartment, Penthouse, etc.)
      - Country: The country mentioned (if any)
      - Any specific requirements or amenities mentioned: Like pool, garden, ocean view, etc.
      
      Return ONLY a valid JSON object with these fields, no additional text. If information is not available, use empty strings or null values.
      Be sure the response can be parsed with JSON.parse().
      
      If a field has already been extracted and provided in propertyDetails, use that value instead of trying to extract it again.`;
      
      // If we have property details already extracted, include them in the prompt
      if (propertyDetails && Object.keys(propertyDetails).length > 0) {
        systemPrompt += `\n\nSome fields have already been extracted from the email:\n`;
        Object.entries(propertyDetails).forEach(([key, value]) => {
          if (value) {
            systemPrompt += `- ${key}: ${value}\n`;
          }
        });
        systemPrompt += `\nFocus on extracting other fields.`;
      }
      
      userMessage = content;
    } 
    else if (type === 'property-extract' || type === 'extract-property') {
      systemPrompt = `You are Chat Gadait, an AI assistant for a luxury real estate CRM. 
      Extract the following information from this property listing URL:
      - Property reference: The unique identifier for this property
      - Price: The listed price
      - Currency: The currency of the price (EUR, USD, GBP, CHF)
      - Location: Specific location of the property (city, area, etc.)
      - Country: The country where the property is located
      - Size or area: In m² if available
      - Number of bedrooms: If specified
      - Number of bathrooms: If specified
      - Property type: Villa, Apartment, Land, etc.
      - Key features and amenities: Pool, garden, sea view, etc.
      - Description: A brief description of the property if available
      
      Return the information in a structured JSON format without any additional text.`;
      
      // If we have initial data already extracted from the URL, include it in the prompt
      if (initialData && Object.keys(initialData).length > 0) {
        systemPrompt += `\n\nSome information has already been extracted from the URL structure:\n`;
        Object.entries(initialData).forEach(([key, value]) => {
          if (value) {
            systemPrompt += `- ${key}: ${value}\n`;
          }
        });
        systemPrompt += `\nConfirm or enhance this information from the actual page content.`;
      }
      
      userMessage = content || url || "No URL provided";
    }
    else if (type === 'email-draft') {
      systemPrompt = `You are Chat Gadait, an AI assistant for a luxury real estate CRM. 
      Draft a professional, warm email response to the client based on the context provided.
      The tone should be luxurious but approachable, professional but friendly.
      Keep it concise but comprehensive.`;
      userMessage = content;
    }
    else if (type === 'follow-up') {
      systemPrompt = `You are Chat Gadait, an AI assistant for a luxury real estate CRM. 
      Based on the lead information and interaction history provided, suggest appropriate follow-up actions and timing.
      Focus on maintaining engagement while respecting the client's timeline and preferences.
      Provide specific, actionable suggestions.`;
      userMessage = content;
    }
    else if (type === 'assistant') {
      systemPrompt = `Tu es Chat Gadait, un assistant IA spécialisé en immobilier de luxe, conçu pour aider les commerciaux de l'agence immobilière GADAIT International.

Ton objectif est d'être précis, professionnel et efficace dans tes réponses, en te concentrant sur les besoins des clients potentiels et en aidant les commerciaux à gagner du temps dans leur travail quotidien.

Tu peux aider avec :
- La rédaction de messages personnalisés pour des prospects (email, SMS, WhatsApp)
- La génération de résumés de profils clients
- Des suggestions de biens immobiliers adaptés aux critères des clients
- Des conseils pour les négociations et le suivi des dossiers
- Des idées pour relancer des leads inactifs
- Toute autre tâche liée à la vente immobilière de luxe

Utilise un ton professionnel mais chaleureux, en mettant en avant l'expertise GADAIT dans l'immobilier haut de gamme. Tu peux parler français ou anglais selon la langue utilisée par le commercial.

Contexte sur le lead:
${leadContext || "Aucune information disponible sur ce lead."}`;

      userMessage = message;
    }

    console.log("Sending request to OpenAI with type:", type);
    
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
          { role: 'user', content: userMessage }
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

    return new Response(JSON.stringify({ response: aiResponse, data: aiResponse, leadId }), {
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
