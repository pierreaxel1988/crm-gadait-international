
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configuration CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Configuration Browse AI
const BROWSE_AI_TEAM_ID = "c84929d4-c872-49d9-9f40-789f05d9a406";
const BROWSE_AI_ROBOT_ID = "eba52f1e-266e-4fd1-b34f-3cc2e02ca1ef";
const BROWSE_AI_API_KEY = "c359de7f-64c3-4d74-a815-72fc3bc77790:444d7cb6-a51c-4a7b-a1d4-59a2ce389111";

// Fonction pour extraire le prix et la localisation
function extractPriceAndLocation(priceLocationString: string) {
  if (!priceLocationString) {
    console.log("priceLocationString est vide ou null");
    return { price: null, numericPrice: null, currency: "EUR", location: null };
  }
  
  console.log("Analyse de la chaîne:", priceLocationString);
  
  // Format attendu: "€1,600,000 Tamarin, Mauritius"
  // Capturer la partie prix avec une expression régulière plus précise
  const priceMatch = priceLocationString.match(/[€$£]([\d,]+)/);
  
  // Initialiser les variables
  let price: number | null = null;
  let numericPrice: string | null = null;
  let currency = "EUR"; // Devise par défaut
  let location: string | null = null;
  
  // Extraire le prix si trouvé
  if (priceMatch && priceMatch[1]) {
    numericPrice = priceMatch[1].replace(/,/g, "");
    price = parseFloat(numericPrice);
    
    // Identifier la devise
    const currencySymbol = priceLocationString.charAt(0);
    if (currencySymbol === "£") currency = "GBP";
    else if (currencySymbol === "$") currency = "USD";
    else if (currencySymbol === "€") currency = "EUR";
    
    console.log(`Prix extrait: ${price}, devise: ${currency}`);
  } else {
    console.log("Aucun prix trouvé dans la chaîne");
  }
  
  // Extraire la localisation (tout ce qui suit le prix et un espace)
  if (priceMatch && priceMatch.index !== undefined) {
    // Prendre tout ce qui suit le prix avec symbole monétaire
    const pricePartLength = priceMatch[0].length + priceMatch.index;
    location = priceLocationString.substring(pricePartLength).trim();
    console.log(`Localisation extraite: ${location}`);
  } else {
    // Si pas de prix trouvé, prendre toute la chaîne comme localisation
    location = priceLocationString.trim();
    console.log(`Localisation par défaut: ${location}`);
  }
  
  return { price, numericPrice, currency, location };
}

// Fonction pour créer une nouvelle tâche Browse AI
async function createNewBrowseAITask() {
  console.log("Création d'une nouvelle tâche Browse AI...");
  
  const url = `https://api.browse.ai/v2/robots/${BROWSE_AI_ROBOT_ID}/tasks`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${BROWSE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        originUrl: "https://the-private-collection.com/en/search/buy/Mauritius/",
        mauritius_listings_limit: "337"
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Browse AI (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Nouvelle tâche créée avec l'ID: ${data.task?.id || 'inconnu'}`);
    
    return data.task;
  } catch (error) {
    console.error("Erreur lors de la création d'une tâche Browse AI:", error);
    throw error;
  }
}

// Fonction pour récupérer les données depuis Browse AI
async function fetchPropertiesFromBrowseAI() {
  console.log("Récupération des données depuis Browse AI...");
  
  const url = `https://api.browse.ai/v2/robots/${BROWSE_AI_ROBOT_ID}/tasks`;
  const params = new URLSearchParams({
    originUrl: "https://the-private-collection.com/en/search/buy/Mauritius/",
    mauritius_listings_limit: "337",
  });
  
  try {
    const response = await fetch(`${url}?${params}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${BROWSE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Browse AI (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`${data.tasks?.length || 0} tâches récupérées depuis Browse AI`);
    
    // Récupérer la dernière tâche réussie
    const successfulTasks = data.tasks?.filter((task: any) => task.state === "processed") || [];
    if (successfulTasks.length === 0) {
      console.log("Aucune tâche réussie trouvée, création d'une nouvelle tâche...");
      // Si aucune tâche réussie n'est trouvée, créer une nouvelle tâche
      const newTask = await createNewBrowseAITask();
      
      // Attendre un peu et vérifier si nous avons des données de moniteur Daily disponibles
      // Cette partie est facultative car la nouvelle tâche peut prendre du temps à s'exécuter
      console.log("Recherche de données de moniteur Daily disponibles...");
      const monitorUrl = `https://api.browse.ai/v2/robots/${BROWSE_AI_ROBOT_ID}/monitors`;
      const monitorResponse = await fetch(monitorUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${BROWSE_AI_API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      
      if (monitorResponse.ok) {
        const monitorData = await monitorResponse.json();
        console.log("Données moniteur reçues:", JSON.stringify(monitorData, null, 2));
        
        // Vérifier que monitors.items est un tableau avant d'utiliser find
        const monitors = monitorData.monitors?.items || [];
        if (Array.isArray(monitors)) {
          console.log(`${monitors.length} moniteurs trouvés`);
          
          // Trouver le moniteur "Daily Property Monitor" s'il existe
          const dailyMonitor = monitors.find((monitor: any) => 
            monitor.name === "Daily Property Monitor" || 
            monitor.name.toLowerCase().includes("daily") ||
            monitor.name.toLowerCase().includes("property")
          );
          
          if (dailyMonitor) {
            console.log(`Moniteur trouvé: ${dailyMonitor.name}, récupération de la dernière exécution...`);
            
            // Récupérer les tâches du moniteur
            const monitorTasksUrl = `https://api.browse.ai/v2/robots/${BROWSE_AI_ROBOT_ID}/monitors/${dailyMonitor.id}/tasks`;
            const monitorTasksResponse = await fetch(monitorTasksUrl, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${BROWSE_AI_API_KEY}`,
                "Content-Type": "application/json",
              },
            });
            
            if (monitorTasksResponse.ok) {
              const monitorTasksData = await monitorTasksResponse.json();
              const successfulMonitorTasks = monitorTasksData.tasks?.filter((task: any) => task.state === "processed") || [];
              
              if (successfulMonitorTasks.length > 0) {
                console.log(`${successfulMonitorTasks.length} tâches réussies trouvées dans le moniteur`);
                return successfulMonitorTasks[0];
              }
            } else {
              console.log("Erreur lors de la récupération des tâches du moniteur:", await monitorTasksResponse.text());
            }
          } else {
            console.log("Aucun moniteur Daily Property Monitor trouvé");
          }
        } else {
          console.log("Le moniteur n'a pas de tableau items:", monitorData);
        }
      } else {
        console.log("Erreur lors de la récupération des moniteurs:", await monitorResponse.text());
      }
      
      // Si nous n'avons pas trouvé de moniteur avec des tâches réussies, utiliser la tâche manuelle créée
      return newTask;
    }
    
    const latestTask = successfulTasks[0];
    console.log(`Dernière tâche réussie trouvée: ${latestTask.id} (${latestTask.state})`);
    return latestTask;
  } catch (error) {
    console.error("Erreur lors de la récupération des données Browse AI:", error);
    throw error;
  }
}

// Fonction pour récupérer le détail d'une tâche Browse AI
async function fetchTaskResult(taskId: string) {
  console.log(`Récupération du détail de la tâche ${taskId}...`);
  
  const url = `https://api.browse.ai/v2/robots/${BROWSE_AI_ROBOT_ID}/tasks/${taskId}`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${BROWSE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Browse AI (${response.status}) pour la tâche ${taskId}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Détails de la tâche ${taskId} récupérés avec succès`);
    return data.task;
  } catch (error) {
    console.error(`Erreur lors de la récupération du détail de la tâche ${taskId}:`, error);
    throw error;
  }
}

// Détermine le type de propriété (vente ou location)
function determinePropertyType(title: string, propertyType: string, priceInfo: string): 'sale' | 'rental' {
  // Par défaut, considérer comme une vente
  let type: 'sale' | 'rental' = 'sale';
  
  // Vérifier dans le titre
  const titleLower = title?.toLowerCase() || '';
  const propertyTypeLower = propertyType?.toLowerCase() || '';
  const priceInfoLower = priceInfo?.toLowerCase() || '';
  
  // Mots-clés qui pourraient indiquer une location
  const rentalKeywords = ['rent', 'rental', 'location', 'to let', 'for let', 'monthly', 'per month', '/month', '/mo'];
  
  // Vérifier si l'un des mots-clés de location est présent
  for (const keyword of rentalKeywords) {
    if (titleLower.includes(keyword) || propertyTypeLower.includes(keyword) || priceInfoLower.includes(keyword)) {
      type = 'rental';
      break;
    }
  }
  
  console.log(`Type de propriété déterminé: ${type} pour "${title}"`);
  return type;
}

// Fonction améliorée pour traiter et importer les propriétés
async function processAndImportProperties(taskResult: any, supabase: any) {
  console.log("Traitement et importation des propriétés...");
  
  // Vérifier si les données sont disponibles
  if (!taskResult.capturedLists || !taskResult.capturedLists.properties) {
    console.error("Structure des données invalide:", taskResult);
    throw new Error("Aucune propriété trouvée dans les résultats de la tâche");
  }
  
  const properties = taskResult.capturedLists.properties;
  console.log(`${properties.length} propriétés trouvées dans les résultats`);
  
  const stats = {
    total: properties.length,
    created: 0,
    updated: 0,
    failed: 0,
  };
  
  // Debug: afficher les 2 premières propriétés pour vérifier la structure
  if (properties.length > 0) {
    console.log("Exemple de propriété 1:", JSON.stringify(properties[0], null, 2));
    if (properties.length > 1) {
      console.log("Exemple de propriété 2:", JSON.stringify(properties[1], null, 2));
    }
  }
  
  // Traiter chaque propriété
  for (const property of properties) {
    try {
      console.log(`Traitement de la propriété: ${property.title || 'Sans titre'}`);
      
      // Vérifier les données essentielles
      if (!property.property_url) {
        console.warn("URL manquante pour une propriété, ignorée");
        stats.failed++;
        continue;
      }
      
      // Extraire le prix et la localisation avec la fonction améliorée
      const { price, numericPrice, currency, location } = extractPriceAndLocation(property.price_and_location || "");
      
      // Déterminer si c'est une vente ou une location
      const propertyType = determinePropertyType(property.title, property.property_type, property.price_and_location || "");
      
      // Préparer les données de la propriété avec champs séparés
      const propertyData = {
        external_id: property.property_url, // Utiliser l'URL comme ID externe
        title: property.title || "Propriété sans titre",
        property_type: property.property_type || "Non spécifié",
        bedrooms: parseInt(property.bedrooms) || null,
        area: parseFloat((property.surface || "").replace(/[^\d.]/g, "")) || null,
        area_unit: (property.surface || "").includes("m²") ? "m²" : "ft²",
        price: price, // Prix en tant que nombre
        currency, // Devise séparée
        location, // Localisation séparée
        country: "Mauritius",
        url: property.property_url,
        images: property.images?.split(",").map((url: string) => url.trim()) || [],
        description: property.description || property.title || "",
        updated_at: new Date().toISOString(),
        listing_type: propertyType, // 'sale' ou 'rental'
      };
      
      console.log(`Données préparées pour ${propertyData.title}:`, JSON.stringify({
        external_id: propertyData.external_id.substring(0, 30) + "...",
        title: propertyData.title,
        price: propertyData.price,
        currency: propertyData.currency,
        bedrooms: propertyData.bedrooms,
        area: propertyData.area,
        listing_type: propertyData.listing_type
      }, null, 2));
      
      // Vérifier si la propriété existe déjà
      const { data: existingProperty, error: selectError } = await supabase
        .from("properties")
        .select("id, external_id, updated_at")
        .eq("external_id", property.property_url)
        .maybeSingle();
        
      if (selectError) {
        console.error("Erreur lors de la vérification de l'existence de la propriété:", selectError);
        throw selectError;
      }
        
      if (existingProperty) {
        // Mettre à jour la propriété existante
        console.log(`Mise à jour de la propriété existante: ${existingProperty.id}`);
        const { error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", existingProperty.id);
          
        if (error) {
          console.error("Erreur lors de la mise à jour de la propriété:", error);
          throw error;
        }
        stats.updated++;
        console.log(`Propriété mise à jour avec succès: ${property.title}`);
      } else {
        // Créer une nouvelle propriété
        console.log(`Création d'une nouvelle propriété: ${property.title}`);
        const { error } = await supabase
          .from("properties")
          .insert(propertyData);
          
        if (error) {
          console.error("Erreur lors de l'insertion de la propriété:", error);
          throw error;
        }
        stats.created++;
        console.log(`Nouvelle propriété créée avec succès: ${property.title}`);
      }
    } catch (error) {
      console.error(`Erreur lors du traitement de la propriété:`, error);
      stats.failed++;
    }
  }
  
  console.log("Stats finales:", stats);
  return stats;
}

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
    
    // Initialiser le client Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Récupérer les données depuis Browse AI, avec création d'une nouvelle tâche si nécessaire
    const latestTask = await fetchPropertiesFromBrowseAI();
    
    if (!latestTask || !latestTask.id) {
      throw new Error("Impossible d'obtenir une tâche valide de Browse AI");
    }
    
    // Récupérer le détail de la tâche
    const taskResult = await fetchTaskResult(latestTask.id);
    
    // Vérifier que le résultat de la tâche est valide
    if (!taskResult) {
      throw new Error(`Aucun résultat trouvé pour la tâche ${latestTask.id}`);
    }
    
    console.log("Résultat de la tâche récupéré, traitement des propriétés...");
    
    // Traiter et importer les propriétés avec la fonction améliorée
    const stats = await processAndImportProperties(taskResult, supabase);
    
    // Enregistrer les statistiques d'importation
    await supabase
      .from("import_statistics")
      .insert({
        source_type: "Browse AI - Maurice Properties",
        imported_count: stats.created,
        updated_count: stats.updated,
        error_count: stats.failed,
        total_count: stats.total,
        import_date: new Date().toISOString(),
      });
      
    console.log("Synchronisation terminée avec succès:", stats);
      
    // Retourner la réponse
    return new Response(
      JSON.stringify({
        success: true,
        message: `Synchronisation terminée. ${stats.created} propriétés créées, ${stats.updated} mises à jour, ${stats.failed} échecs sur un total de ${stats.total}.`,
        stats,
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
