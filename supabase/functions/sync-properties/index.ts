
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
    const apiUrl = Deno.env.get('PRIVATE_COLLECTION_API_URL') || ''
    const apiKey = Deno.env.get('PRIVATE_COLLECTION_API_KEY') || ''
    
    if (!apiUrl || !apiKey) {
      return new Response(
        JSON.stringify({ 
          error: "Configuration API manquante. Veuillez configurer PRIVATE_COLLECTION_API_URL et PRIVATE_COLLECTION_API_KEY." 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }
    
    // Créer un client Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Simulons pour l'instant une API fictive (à remplacer par l'API réelle)
    // Dans un cas réel, on ferait un appel à l'API the-private-collection.com
    console.log(`Fetching properties from API: ${apiUrl}`)
    
    // Note: Cette partie serait remplacée par un vrai appel API
    // const response = await fetch(`${apiUrl}/properties`, {
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //   },
    // })
    // const properties = await response.json()
    
    // Pour simulation, utilisez ces propriétés fictives
    const mockProperties = [
      {
        external_id: "prop-001",
        title: "Villa de luxe avec vue sur mer",
        description: "Magnifique villa avec vue panoramique sur la mer",
        price: 3500000,
        currency: "EUR",
        location: "Cannes",
        country: "France",
        property_type: "Villa",
        bedrooms: 5,
        bathrooms: 4,
        area: 350,
        area_unit: "m²",
        features: ["Piscine", "Jardin", "Terrasse"],
        amenities: ["Climatisation", "Garage", "Sécurité"],
        images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
        url: "https://the-private-collection.com/properties/villa-luxe-cannes"
      },
      {
        external_id: "prop-002",
        title: "Penthouse moderne au centre-ville",
        description: "Penthouse avec terrasse sur le toit",
        price: 2200000,
        currency: "EUR",
        location: "Nice",
        country: "France",
        property_type: "Penthouse",
        bedrooms: 3,
        bathrooms: 2,
        area: 180,
        area_unit: "m²",
        features: ["Terrasse", "Vue panoramique"],
        amenities: ["Climatisation", "Ascenseur privé"],
        images: ["https://example.com/image3.jpg", "https://example.com/image4.jpg"],
        url: "https://the-private-collection.com/properties/penthouse-nice"
      },
      {
        external_id: "prop-003",
        title: "Appartement haut de gamme",
        description: "Appartement luxueux avec finitions premium",
        price: 1800000,
        currency: "EUR",
        location: "Paris",
        country: "France",
        property_type: "Appartement",
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        area_unit: "m²",
        features: ["Balcon", "Parquet ancien"],
        amenities: ["Conciergerie", "Parking"],
        images: ["https://example.com/image5.jpg", "https://example.com/image6.jpg"],
        url: "https://the-private-collection.com/properties/appartement-paris"
      }
    ]
    
    let insertCount = 0
    let updateCount = 0
    
    // Traiter et insérer chaque propriété
    for (const prop of mockProperties) {
      // Vérifier si la propriété existe déjà (par external_id)
      const { data: existingProp } = await supabase
        .from('properties')
        .select('id')
        .eq('external_id', prop.external_id)
        .single()
      
      if (existingProp) {
        // Mettre à jour la propriété existante
        await supabase
          .from('properties')
          .update(prop)
          .eq('external_id', prop.external_id)
        
        updateCount++
      } else {
        // Insérer une nouvelle propriété
        await supabase
          .from('properties')
          .insert(prop)
        
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
