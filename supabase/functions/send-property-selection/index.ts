
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Récupérer les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    // Vérifier le corps de la requête
    const { selectionId, email } = await req.json()
    
    if (!selectionId || !email) {
      return new Response(
        JSON.stringify({ error: "selectionId et email sont requis" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
    
    // Créer un client Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Récupérer la sélection
    const { data: selection, error: selectionError } = await supabase
      .from('property_selections')
      .select('*, leads!inner(*)')
      .eq('id', selectionId)
      .single()
    
    if (selectionError || !selection) {
      return new Response(
        JSON.stringify({ error: "Sélection introuvable" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }
    
    // Récupérer les propriétés de la sélection
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .in('id', selection.properties)
    
    if (propertiesError) {
      return new Response(
        JSON.stringify({ error: "Impossible de récupérer les propriétés" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }
    
    // Générer l'URL du lien unique
    const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://votre-site.com'
    const selectionUrl = `${baseUrl}/selections/${selection.link_token}`
    
    // Dans un cas réel, on enverrait un véritable e-mail via un service comme SendGrid, Mailchimp, etc.
    console.log(`Envoi d'un e-mail à ${email} avec la sélection ${selectionId}`)
    console.log(`URL de la sélection: ${selectionUrl}`)
    console.log(`Propriétés sélectionnées: ${properties.length}`)
    
    // Mettre à jour la sélection pour indiquer qu'elle a été envoyée
    await supabase
      .from('property_selections')
      .update({
        status: 'sent',
        email_sent_at: new Date().toISOString()
      })
      .eq('id', selectionId)
    
    // Retourner un résultat positif
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Sélection envoyée avec succès",
        selectionUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error("Error sending property selection:", error)
    
    return new Response(
      JSON.stringify({ 
        error: `Une erreur est survenue: ${error.message}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
