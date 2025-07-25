
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { determineCountryIntelligently } from './cityToCountryUtils.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour extraire les URLs YouTube depuis différents champs
const extractYouTubeUrls = (property: any): string[] => {
  const youtubeUrls: string[] = [];
  const youtubePattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
  
  // Chercher dans le champ virtualTour
  if (property.virtualTour) {
    const matches = property.virtualTour.match(youtubePattern);
    if (matches) {
      youtubeUrls.push(...matches);
    }
  }
  
  // Chercher dans la description
  if (property.description) {
    const matches = property.description.match(youtubePattern);
    if (matches) {
      youtubeUrls.push(...matches);
    }
  }
  
  // Supprimer les doublons
  return [...new Set(youtubeUrls)];
};

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

    console.log("🚀 Démarrage de la synchronisation DatoCMS complète...");

    // Fonction pour récupérer toutes les propriétés avec pagination
    const getAllProperties = async () => {
      let allProperties: any[] = [];
      let hasMore = true;
      let offset = 0;
      const limit = 100; // DatoCMS limite généralement à 100 par requête

      while (hasMore) {
        console.log(`📥 Récupération des propriétés ${offset} à ${offset + limit}...`);
        
        const query = `
          query GetProperties($offset: IntType!, $limit: IntType!) {
            allProperties(first: $limit, skip: $offset) {
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
                title
              }
              map {
                latitude
                longitude
              }
              city {
                id
                name
                country {
                  id
                  name
                  code
                }
              }
              currency {
                id
                name
                code
              }
              propertyType {
                id
                name
              }
              propertyStatus {
                id
                name
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
              }
              websiteHide
              portalsHide
              ownerName
              ownerEmail
              ownerPhone
            }
          }
        `;

        const response = await fetch('https://graphql.datocms.com/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${datoCmsToken}`,
          },
          body: JSON.stringify({ 
            query,
            variables: { offset, limit }
          }),
        });

        if (!response.ok) {
          throw new Error(`Erreur API DatoCMS: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.errors) {
          console.error('Erreurs GraphQL:', data.errors);
          throw new Error(`Erreurs GraphQL: ${data.errors.map((e: any) => e.message).join(', ')}`);
        }

        const properties = data.data.allProperties;
        console.log(`✅ Récupéré ${properties.length} propriétés dans cette page`);
        
        allProperties = allProperties.concat(properties);
        
        // Si on récupère moins que la limite, on a atteint la fin
        if (properties.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      }

      return allProperties;
    };

    const datoCmsProperties = await getAllProperties();
    console.log(`🎯 TOTAL: ${datoCmsProperties.length} propriétés récupérées depuis DatoCMS`);

    // Convertir les propriétés DatoCMS vers le format Supabase
    const convertedProperties = datoCmsProperties
      .filter((prop: any) => !prop.websiteHide) // Exclure les propriétés cachées
      .map((prop: any) => convertDatoCmsProperty(prop));

    console.log(`📋 ${convertedProperties.length} propriétés à synchroniser après filtrage`);

    // Log détaillé des références et slugs pour diagnostic
    console.log("=== 🔍 DIAGNOSTIC DES RÉFÉRENCES ET SLUGS ===");
    const referenceSample = convertedProperties.slice(0, 3);
    referenceSample.forEach((prop: any, index: number) => {
      console.log(`Propriété ${index + 1}:`);
      console.log(`  - Titre: ${prop.title}`);
      console.log(`  - external_id: "${prop.external_id}"`);
      console.log(`  - slug: "${prop.slug}"`);
      console.log(`  - Est auto-généré: ${prop.external_id?.startsWith('datocms-') ? 'OUI' : 'NON'}`);
      console.log(`  - Vidéos: ${prop.video_urls?.length || 0} trouvées`);
    });
    console.log("=== 🔍 FIN DIAGNOSTIC ===");

    // Nettoyer les doublons avant synchronisation
    console.log("🧹 Nettoyage des doublons en cours...");
    await cleanupDuplicateProperties();

    // Stocker les propriétés dans la base de données avec mise à jour forcée
    console.log("💾 Début de la mise à jour de toutes les propriétés...");
    const storedCount = await storePropertiesInDatabase(convertedProperties, true);

    console.log("✅ Synchronisation terminée avec succès !");

    return new Response(
      JSON.stringify({
        success: true,
        message: `✅ Synchronisation DatoCMS complète réussie: ${storedCount} propriétés mises à jour avec leurs slugs`,
        details: {
          totalFromDatoCms: datoCmsProperties.length,
          filtered: convertedProperties.length,
          storedCount,
          slugsUpdated: true
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation DatoCMS:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `❌ Erreur synchronisation DatoCMS: ${error.message}`,
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
    (datoCmsProp.slug ? `https://gadait-international.com/properties/${datoCmsProp.slug}` : '');

  // Extraire les images de la galerie
  const images = datoCmsProp.gallery?.map((img: any) => img.url) || [];
  const mainImage = images[0] || '';

  // Extraire les amenities comme features
  const features = datoCmsProp.amenities?.map((amenity: any) => amenity.name) || [];

  // Extraire les URLs YouTube
  const videoUrls = extractYouTubeUrls(datoCmsProp);

  // Déterminer le prix et la devise
  let price = datoCmsProp.price;
  let currency = datoCmsProp.currency?.code || 'EUR';
  
  // Si le prix est caché, le mettre à null
  if (datoCmsProp.hidePrice) {
    price = null;
  }

  // Récupérer les informations de localisation depuis DatoCMS
  const cityName = datoCmsProp.city?.name || '';
  const countryFromDatoCms = datoCmsProp.city?.country?.name || '';
  
  // Construire la localisation complète
  const fullAddress = [datoCmsProp.address, datoCmsProp.postalCode, cityName]
    .filter(Boolean)
    .join(', ');

  // Utiliser la nouvelle logique intelligente pour déterminer le pays
  const country = determineCountryIntelligently(
    countryFromDatoCms,
    cityName,
    datoCmsProp.title
  );

  // Récupérer la référence DatoCMS
  const datoCmsReference = datoCmsProp.reference;
  
  // Déterminer l'external_id final
  let finalExternalId;
  if (datoCmsReference && datoCmsReference.trim() !== '') {
    finalExternalId = datoCmsReference.trim();
  } else {
    finalExternalId = `datocms-${datoCmsProp.id}`;
  }

  return {
    external_id: finalExternalId,
    title: datoCmsProp.title || 'Propriété sans titre',
    description: datoCmsProp.description || '',
    price,
    currency,
    location: fullAddress || cityName,
    country,
    property_type: datoCmsProp.propertyType?.name || 'Propriété',
    bedrooms: datoCmsProp.bedrooms,
    bathrooms: datoCmsProp.bathrooms,
    area: datoCmsProp.surface,
    area_unit: "m²",
    main_image: mainImage,
    images,
    features,
    amenities: features,
    url: propertyUrl,
    slug: datoCmsProp.slug || null, // 🔥 CRUCIAL: Slug depuis DatoCMS
    video_urls: videoUrls,
    is_available: datoCmsProp.propertyStatus?.name !== 'Sold' && datoCmsProp.propertyStatus?.name !== 'Rented',
    is_featured: datoCmsProp.priceFrom || false,
    // Coordonnées GPS depuis DatoCMS
    latitude: datoCmsProp.map?.latitude || null,
    longitude: datoCmsProp.map?.longitude || null,
    // Métadonnées additionnelles
    created_at: datoCmsProp._createdAt,
    updated_at: datoCmsProp._updatedAt,
  };
}

async function storePropertiesInDatabase(properties: any[], forceUpdate: boolean = false): Promise<number> {
  if (properties.length === 0) {
    return 0;
  }
  
  console.log(`💾 Tentative de stockage de ${properties.length} propriétés en base (mise à jour forcée: ${forceUpdate})`);
  
  let storedCount = 0;
  let updatedCount = 0;
  let insertedCount = 0;
  
  // Traiter par batch de 50 pour éviter les timeouts
  const batchSize = 50;
  for (let i = 0; i < properties.length; i += batchSize) {
    const batch = properties.slice(i, i + batchSize);
    console.log(`🔄 Traitement du batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(properties.length/batchSize)} (${batch.length} propriétés)`);
    
    for (const property of batch) {
      try {
        // Vérifier si la propriété existe déjà
        const { data: existing } = await supabase
          .from('gadait_properties')
          .select('id, updated_at, slug')
          .eq('external_id', property.external_id)
          .single();
        
        if (existing) {
          // Vérifier si une mise à jour est nécessaire
          const existingUpdatedAt = new Date(existing.updated_at);
          const newUpdatedAt = new Date(property.updated_at);
          const slugNeedsUpdate = !existing.slug && property.slug; // Mise à jour nécessaire si slug manquant
          
          if (forceUpdate || newUpdatedAt > existingUpdatedAt || slugNeedsUpdate) {
            // Mettre à jour la propriété existante
            const { error: updateError } = await supabase
              .from('gadait_properties')
              .update({
                ...property,
                scraped_at: new Date().toISOString()
              })
              .eq('external_id', property.external_id);
            
            if (updateError) {
              console.error(`❌ Erreur lors de la mise à jour de la propriété ${property.external_id}:`, updateError);
            } else {
              console.log(`🔄 Propriété mise à jour: ${property.title} ${property.slug ? `(slug: ${property.slug})` : ''}`);
              updatedCount++;
              storedCount++;
            }
          } else {
            console.log(`⏭️  Propriété déjà à jour: ${property.title}`);
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
            console.error(`❌ Erreur lors de l'insertion de la propriété ${property.external_id}:`, insertError);
          } else {
            console.log(`✅ Nouvelle propriété insérée: ${property.title} ${property.slug ? `(slug: ${property.slug})` : ''}`);
            insertedCount++;
            storedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Erreur lors du traitement de la propriété ${property.external_id}:`, error);
      }
    }
  }
  
  console.log(`📊 Résultats: ${storedCount} propriétés traitées (${updatedCount} mises à jour, ${insertedCount} nouvelles)`);
  return storedCount;
}

// Fonction améliorée pour nettoyer les doublons
async function cleanupDuplicateProperties(): Promise<void> {
  console.log('🧹 Nettoyage des doublons en cours...');
  
  try {
    // Récupérer toutes les propriétés avec des external_id auto-générés
    const { data: autoGeneratedProps, error: fetchError } = await supabase
      .from('gadait_properties')
      .select('id, external_id, title, url, slug')
      .like('external_id', 'datocms-%');
    
    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des propriétés auto-générées:', fetchError);
      return;
    }
    
    if (!autoGeneratedProps || autoGeneratedProps.length === 0) {
      console.log('✅ Aucune propriété avec ID auto-généré trouvée');
      return;
    }
    
    console.log(`🔍 ${autoGeneratedProps.length} propriétés avec ID auto-généré trouvées`);
    
    let deletedCount = 0;
    
    // Pour chaque propriété auto-générée, vérifier s'il existe une version avec une vraie référence
    for (const autoProp of autoGeneratedProps) {
      try {
        // Chercher une propriété avec le même titre et une vraie référence DatoCMS
        const { data: realProps, error: searchError } = await supabase
          .from('gadait_properties')
          .select('id, external_id, title, slug')
          .eq('title', autoProp.title)
          .not('external_id', 'like', 'datocms-%');
        
        if (searchError) {
          console.error(`❌ Erreur lors de la recherche pour ${autoProp.title}:`, searchError);
          continue;
        }
        
        // S'il existe une version avec une vraie référence, supprimer la version auto-générée
        if (realProps && realProps.length > 0) {
          const { error: deleteError } = await supabase
            .from('gadait_properties')
            .delete()
            .eq('id', autoProp.id);
          
          if (deleteError) {
            console.error(`❌ Erreur lors de la suppression de ${autoProp.external_id}:`, deleteError);
          } else {
            console.log(`🗑️ Supprimé doublon: "${autoProp.title}" (ID auto: ${autoProp.external_id})`);
            deletedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Erreur lors du traitement de ${autoProp.external_id}:`, error);
      }
    }
    
    console.log(`✅ Nettoyage terminé: ${deletedCount} doublons supprimés`);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des doublons:', error);
  }
}
