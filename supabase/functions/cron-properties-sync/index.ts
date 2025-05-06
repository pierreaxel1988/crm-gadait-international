
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
    
    // Appeler la fonction de synchronisation des propriétés
    const response = await fetch(`${SUPABASE_URL}/functions/v1/properties-sync`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de l'appel à properties-sync: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log("Résultat de la synchronisation:", result);
    
    // Enregistrer l'exécution du cron job
    await supabase
      .from("import_statistics")
      .insert({
        source_type: "Cron - Daily Properties Sync",
        imported_count: result.stats?.created || 0,
        updated_count: result.stats?.updated || 0,
        error_count: result.stats?.failed || 0,
        total_count: result.stats?.total || 0,
        import_date: new Date().toISOString(),
      });
    
    console.log("Enregistrement des statistiques terminé");
    
    // Retourner la réponse
    return new Response(
      JSON.stringify({
        success: true,
        message: "Synchronisation quotidienne des propriétés terminée",
        details: result,
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
