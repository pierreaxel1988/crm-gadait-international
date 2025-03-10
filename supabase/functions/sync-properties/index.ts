
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const DATOCMS_API_TOKEN = "99a90afc639c5900568ce6e9dfb5d3"
const DATOCMS_ENDPOINT = "https://graphql.datocms.com/"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Récupérer les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    // Créer un client Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log(`Fetching properties from DatoCMS`)
    
    // Requête GraphQL pour obtenir les propriétés
    const query = `
      query {
        allProperties {
          id
          title
          description
          price
          location
          country
          propertyType
          bedrooms
          bathrooms
          area
          features
          amenities
          images {
            url
          }
          slug
        }
      }
    `
    
    // Appel à l'API DatoCMS
    const response = await fetch(DATOCMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DATOCMS_API_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    })
    
    const responseData = await response.json()
    
    if (responseData.errors) {
      throw new Error(`DatoCMS API error: ${JSON.stringify(responseData.errors)}`)
    }
    
    const properties = responseData.data.allProperties
    
    let insertCount = 0
    let updateCount = 0
    
    // Traiter et insérer chaque propriété
    for (const prop of properties) {
      // Formater les données pour correspondre à notre schéma
      const propertyData = {
        external_id: prop.id,
        title: prop.title,
        description: prop.description,
        price: prop.price,
        currency: 'EUR',
        location: prop.location,
        country: prop.country,
        property_type: prop.propertyType,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        area: prop.area,
        area_unit: 'm²',
        features: prop.features || [],
        amenities: prop.amenities || [],
        images: prop.images ? prop.images.map(img => img.url) : [],
        url: `https://the-private-collection.com/en/${prop.slug}`
      }
      
      // Vérifier si la propriété existe déjà (par external_id)
      const { data: existingProp } = await supabase
        .from('properties')
        .select('id')
        .eq('external_id', prop.id)
        .single()
      
      if (existingProp) {
        // Mettre à jour la propriété existante
        await supabase
          .from('properties')
          .update(propertyData)
          .eq('external_id', prop.id)
        
        updateCount++
      } else {
        // Insérer une nouvelle propriété
        await supabase
          .from('properties')
          .insert(propertyData)
        
        insertCount++
      }
    }
    
    // Retourner le résultat
    return new Response(
      JSON.stringify({ 
        success: true, 
        count: insertCount + updateCount,
        inserted: insertCount,
        updated: updateCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error("Error syncing properties:", error)
    
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
