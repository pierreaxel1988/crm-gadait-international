
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configuration CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Fonction principale
serve(async (req: Request) => {
  // Récupérer les variables d'environnement
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
  
  // Gérer les requêtes CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    console.log("Début de la synchronisation des propriétés...");
    
    // Récupérer les paramètres de la requête
    const params = await req.json().catch(() => ({}));
    const url = params.url || "https://the-private-collection.com/en/search/";
    const country = params.country || null;
    const regions = params.regions || [];
    
    // Initialiser le client Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log(`Synchronisation pour l'URL: ${url}`);
    
    // Stats globales
    const globalStats = {
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
    };
    
    // Effectuer la synchronisation pour l'URL spécifiée
    const syncStats = await syncPropertiesFromUrl(supabase, url);
    
    // Agréger les statistiques
    Object.assign(globalStats, syncStats);
    
    // Enregistrer les statistiques d'importation
    await supabase
      .from("import_statistics")
      .insert({
        source_type: "Custom Scraper - The Private Collection",
        imported_count: globalStats.created,
        updated_count: globalStats.updated,
        error_count: globalStats.failed,
        total_count: globalStats.total,
        import_date: new Date().toISOString(),
      });
      
    console.log("Synchronisation terminée avec succès:", globalStats);
      
    // Retourner la réponse
    return new Response(
      JSON.stringify({
        success: true,
        message: `Synchronisation terminée. ${globalStats.created} propriétés créées, ${globalStats.updated} mises à jour, ${globalStats.failed} échecs sur un total de ${globalStats.total}.`,
        stats: globalStats,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Erreur lors de la synchronisation:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.stack,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

// Fonction pour synchroniser les propriétés d'une URL spécifique
async function syncPropertiesFromUrl(supabase: any, baseUrl: string) {
  const stats = {
    total: 0,
    created: 0,
    updated: 0,
    failed: 0,
  };
  
  try {
    let page = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      console.log(`Scraping de la page ${page} pour ${baseUrl}`);
      
      // Appeler notre propre fonction de scraping
      const scrapeResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/scrape-website`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: baseUrl,
          page,
          debug: true // Activer le mode debug pour voir plus de détails
        }),
      });
      
      if (!scrapeResponse.ok) {
        const errorText = await scrapeResponse.text();
        throw new Error(`Erreur lors du scraping (${scrapeResponse.status}): ${errorText}`);
      }
      
      const scrapeResult = await scrapeResponse.json();
      
      if (!scrapeResult.success || !scrapeResult.properties) {
        throw new Error("Le scraping n'a pas retourné de résultats valides");
      }
      
      const properties = scrapeResult.properties;
      console.log(`${properties.length} propriétés trouvées sur la page ${page}`);
      
      // Traiter chaque propriété
      for (const property of properties) {
        try {
          stats.total++;
          
          // Vérifier si la propriété existe déjà (par URL)
          const { data: existingProperty, error: selectError } = await supabase
            .from("Gadait_Listings_Buy")
            .select("Position")
            .eq("Property Link", property["Property Link"])
            .maybeSingle();
            
          if (selectError) {
            console.error("Erreur lors de la vérification de l'existence de la propriété:", selectError);
            stats.failed++;
            continue;
          }
            
          if (existingProperty) {
            // Mettre à jour la propriété existante (garder Position inchangée)
            const updateProperty = { ...property, Position: existingProperty.Position };
            
            const { error } = await supabase
              .from("Gadait_Listings_Buy")
              .update(updateProperty)
              .eq("Position", existingProperty.Position);
              
            if (error) {
              console.error("Erreur lors de la mise à jour de la propriété:", error);
              stats.failed++;
            } else {
              stats.updated++;
              console.log(`Propriété mise à jour: ${property.Title}`);
            }
          } else {
            // Obtenir le prochain numéro de position disponible
            const { data: maxPositionData } = await supabase
              .from("Gadait_Listings_Buy")
              .select("Position")
              .order("Position", { ascending: false })
              .limit(1);
              
            const nextPosition = maxPositionData && maxPositionData.length > 0
              ? maxPositionData[0].Position + 1
              : 1;
              
            // Créer une nouvelle propriété avec la position calculée
            const newProperty = { ...property, Position: nextPosition };
            
            const { error } = await supabase
              .from("Gadait_Listings_Buy")
              .insert(newProperty);
              
            if (error) {
              console.error("Erreur lors de l'insertion de la propriété:", error);
              stats.failed++;
            } else {
              stats.created++;
              console.log(`Nouvelle propriété créée: ${property.Title}`);
            }
          }
        } catch (error) {
          console.error(`Erreur lors du traitement de la propriété ${property.Title}:`, error);
          stats.failed++;
        }
      }
      
      // Vérifier s'il y a d'autres pages à scraper
      if (scrapeResult.pagination && scrapeResult.pagination.hasNextPage) {
        page++;
      } else {
        hasMorePages = false;
      }
    }
    
    return stats;
  } catch (error) {
    console.error(`Erreur lors de la synchronisation de l'URL ${baseUrl}:`, error);
    throw error;
  }
}
