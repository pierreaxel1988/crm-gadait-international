
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
    const { message, type, content } = await req.json();
    
    let systemPrompt = "You are Chat Gadait, an AI assistant for a luxury real estate CRM. Be concise and helpful.";
    let userMessage = message;
    
    // Handle different types of requests
    if (type === 'email-extract') {
      systemPrompt = `You are Chat Gadait, an AI assistant for a luxury real estate CRM. 
      Extract the following information from the email content:
      - Name
      - Email address
      - Phone number
      - Property reference (if any)
      - Source/portal (Le Figaro, Idealista, Property Cloud, etc.)
      - Budget or price mentioned
      - Desired location
      - Property type preferences
      - Any specific requirements or amenities mentioned
      
      Return the information in a structured JSON format without any additional text.`;
      userMessage = content;
    } 
    else if (type === 'property-extract') {
      systemPrompt = `You are Chat Gadait, an AI assistant for a luxury real estate CRM. 
      Extract the following information from this property listing:
      - Property reference
      - Price
      - Location
      - Size (in m²)
      - Number of bedrooms
      - Number of bathrooms
      - Property type
      - Key features and amenities
      
      Return the information in a structured JSON format without any additional text.`;
      userMessage = content;
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

    return new Response(JSON.stringify({ response: aiResponse }), {
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
