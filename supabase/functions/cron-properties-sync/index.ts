
// Cette fonction est conçue pour être appelée par un cron job

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
    console.log("Démarrage de la synchronisation quotidienne des propriétés...");
    
    // Initialiser le client Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Définir les pays et régions à synchroniser
    const countries = [
      { 
        name: "Mauritius",
        regions: [] // Synchroniser tout le pays sans spécifier de région
      },
      // Ajouter d'autres pays selon les besoins
      // { name: "Spain", regions: ["Marbella", "Ibiza"] }
    ];
    
    let totalStats = {
      created: 0,
      updated: 0,
      failed: 0,
      total: 0
    };
    
    // Synchroniser chaque pays
    for (const country of countries) {
      try {
        console.log(`Synchronisation du pays: ${country.name}`);
        
        // Appeler notre fonction de synchronisation des propriétés
        const response = await fetch(`${SUPABASE_URL}/functions/v1/properties-sync`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: country.name,
            regions: country.regions
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur lors de l'appel à properties-sync pour ${country.name}: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log(`Résultat de la synchronisation pour ${country.name}:`, result);
        
        // Agréger les statistiques
        if (result.stats) {
          totalStats.created += result.stats.created || 0;
          totalStats.updated += result.stats.updated || 0;
          totalStats.failed += result.stats.failed || 0;
          totalStats.total += result.stats.total || 0;
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation du pays ${country.name}:`, error);
      }
    }
    
    // Enregistrer l'exécution du cron job
    await supabase
      .from("import_statistics")
      .insert({
        source_type: "Cron - Daily Properties Sync",
        imported_count: totalStats.created || 0,
        updated_count: totalStats.updated || 0,
        error_count: totalStats.failed || 0,
        total_count: totalStats.total || 0,
        import_date: new Date().toISOString(),
      });
    
    console.log("Enregistrement des statistiques terminé");
    
    // Retourner la réponse
    return new Response(
      JSON.stringify({
        success: true,
        message: "Synchronisation quotidienne des propriétés terminée",
        details: totalStats,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Erreur lors de la synchronisation quotidienne:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erreur lors de la synchronisation quotidienne: ${error.message}`,
        error: error.stack,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
