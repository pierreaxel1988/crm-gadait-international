
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const datoCmsToken = Deno.env.get('DATOCMS_API_TOKEN');
    
    if (!datoCmsToken) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Token API DatoCMS manquant. Veuillez configurer DATOCMS_API_TOKEN dans les secrets Supabase.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Démarrage de la synchronisation DatoCMS...");

    // GraphQL query pour récupérer les propriétés depuis DatoCMS
    const query = `
      query GetAllProperties {
        allProperties {
          id
          _updatedAt
          _createdAt
          title
          description
          price
          priceFrom
          hidePrice
          surface
          land
          bedrooms
          bathrooms
          rooms
          floors
          constructionYear
          address
          postalCode
          reference
          slug
          partnerUrl
          virtualTour
          gallery {
            id
            url
            alt
            title
            width
            height
          }
          floorPlans {
            id
            url
            alt
            title
          }
          documents {
            id
            url
            title
            filename
          }
          map {
            latitude
            longitude
          }
          city {
            id
            name
            slug
          }
          currency {
            id
            name
            code
            symbol
          }
          propertyType {
            id
            name
            slug
          }
          propertyStatus {
            id
            name
            slug
          }
          agent {
            id
            name
            email
            phone
          }
          amenities {
            id
            name
            slug
          }
          websiteHide
          portalsHide
          ownerName
          ownerEmail
          ownerPhone
        }
      }
    `;

    // Appel à l'API DatoCMS
    const response = await fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${datoCmsToken}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API DatoCMS: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('Erreurs GraphQL:', data.errors);
      throw new Error(`Erreurs GraphQL: ${data.errors.map((e: any) => e.message).join(', ')}`);
    }

    const datoCmsProperties = data.data.allProperties;
    console.log(`${datoCmsProperties.length} propriétés récupérées depuis DatoCMS`);

    // Convertir les propriétés DatoCMS vers le format Supabase
    const convertedProperties = datoCmsProperties
      .filter((prop: any) => !prop.websiteHide) // Exclure les propriétés cachées
      .map((prop: any) => convertDatoCmsProperty(prop));

    console.log(`${convertedProperties.length} propriétés à synchroniser après filtrage`);

    // Stocker les propriétés dans la base de données
    const storedCount = await storePropertiesInDatabase(convertedProperties);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synchronisation DatoCMS réussie: ${storedCount} propriétés traitées`,
        properties: convertedProperties,
        totalFromDatoCms: datoCmsProperties.length,
        filtered: convertedProperties.length,
        storedCount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Erreur lors de la synchronisation DatoCMS:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erreur synchronisation DatoCMS: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function convertDatoCmsProperty(datoCmsProp: any) {
  // Construire l'URL de la propriété
  const propertyUrl = datoCmsProp.partnerUrl || 
    (datoCmsProp.slug ? `https://votre-site.com/properties/${datoCmsProp.slug}` : '');

  // Extraire les images de la galerie
  const images = datoCmsProp.gallery?.map((img: any) => img.url) || [];
  const mainImage = images[0] || '';

  // Extraire les caractéristiques depuis les amenities
  const features = datoCmsProp.amenities?.map((amenity: any) => amenity.name) || [];

  // Déterminer le prix et la devise
  let price = datoCmsProp.price;
  let currency = datoCmsProp.currency?.code || 'EUR';
  
  // Si le prix est caché, le mettre à null
  if (datoCmsProp.hidePrice) {
    price = null;
  }

  // Construire la localisation
  const location = datoCmsProp.city?.name || '';
  const fullAddress = [datoCmsProp.address, datoCmsProp.postalCode, location]
    .filter(Boolean)
    .join(', ');

  return {
    external_id: `datocms-${datoCmsProp.id}`,
    title: datoCmsProp.title || 'Propriété sans titre',
    description: datoCmsProp.description || '',
    price,
    currency,
    location: fullAddress || location,
    country: "France", // À adapter selon vos données
    property_type: datoCmsProp.propertyType?.name || 'Propriété',
    bedrooms: datoCmsProp.bedrooms,
    bathrooms: datoCmsProp.bathrooms,
    area: datoCmsProp.surface,
    area_unit: "m²",
    main_image: mainImage,
    images,
    features,
    amenities: [], // Peut être enrichi selon vos besoins
    url: propertyUrl,
    is_available: datoCmsProp.propertyStatus?.slug !== 'sold' && datoCmsProp.propertyStatus?.slug !== 'rented',
    is_featured: datoCmsProp.priceFrom || false, // Utiliser priceFrom comme indicateur de mise en avant
    // Métadonnées additionnelles
    created_at: datoCmsProp._createdAt,
    updated_at: datoCmsProp._updatedAt,
  };
}

async function storePropertiesInDatabase(properties: any[]): Promise<number> {
  if (properties.length === 0) {
    return 0;
  }
  
  console.log(`Tentative de stockage de ${properties.length} propriétés en base`);
  
  let storedCount = 0;
  
  for (const property of properties) {
    try {
      // Vérifier si la propriété existe déjà
      const { data: existing } = await supabase
        .from('gadait_properties')
        .select('id, updated_at')
        .eq('external_id', property.external_id)
        .single();
      
      if (existing) {
        // Vérifier si la propriété a été mise à jour
        const existingUpdatedAt = new Date(existing.updated_at);
        const newUpdatedAt = new Date(property.updated_at);
        
        if (newUpdatedAt > existingUpdatedAt) {
          // Mettre à jour la propriété existante
          const { error: updateError } = await supabase
            .from('gadait_properties')
            .update({
              ...property,
              scraped_at: new Date().toISOString()
            })
            .eq('external_id', property.external_id);
          
          if (updateError) {
            console.error(`Erreur lors de la mise à jour de la propriété ${property.external_id}:`, updateError);
          } else {
            console.log(`Propriété mise à jour: ${property.title}`);
            storedCount++;
          }
        } else {
          console.log(`Propriété ${property.title} déjà à jour`);
        }
      } else {
        // Insérer une nouvelle propriété
        const { error: insertError } = await supabase
          .from('gadait_properties')
          .insert({
            ...property,
            scraped_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error(`Erreur lors de l'insertion de la propriété ${property.external_id}:`, insertError);
        } else {
          console.log(`Nouvelle propriété insérée: ${property.title}`);
          storedCount++;
        }
      }
    } catch (error) {
      console.error(`Erreur lors du traitement de la propriété ${property.external_id}:`, error);
    }
  }
  
  console.log(`${storedCount} propriétés traitées avec succès`);
  return storedCount;
}
