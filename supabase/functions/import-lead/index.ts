
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Récupérer les variables d'environnement
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    // Vérifier que les clés sont disponibles
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Erreur de configuration: variables d'environnement manquantes");
    }

    // Créer un client Supabase avec la clé de service pour les opérations administratives
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extraire les données du lead depuis la requête
    const requestData = await req.json();
    const {
      source,
      name,
      email,
      phone,
      property_reference,
      external_id,
      message,
      location,
      integrationSource,
      // Autres champs optionnels
      desired_location,
      budget,
      property_type,
      living_area,
      bedrooms,
      views,
      amenities,
      purchase_timeframe,
      financing_method,
      property_use,
      ...additionalData
    } = requestData;

    // Valider les données minimales requises
    if (!name || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Les champs 'name' et 'email' sont obligatoires",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Vérifier si le lead existe déjà (par email ou par external_id)
    let existingLead = null;
    
    if (external_id) {
      const { data: leadByExternalId } = await supabase
        .from('leads')
        .select('id, name, email')
        .eq('external_id', external_id)
        .maybeSingle();
      
      if (leadByExternalId) {
        existingLead = leadByExternalId;
      }
    }
    
    if (!existingLead && email) {
      const { data: leadByEmail } = await supabase
        .from('leads')
        .select('id, name, email')
        .eq('email', email)
        .maybeSingle();
      
      if (leadByEmail) {
        existingLead = leadByEmail;
      }
    }

    let result;
    
    if (existingLead) {
      // Mettre à jour le lead existant
      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update({
          name: name || existingLead.name,
          email: email || existingLead.email,
          phone: phone || undefined,
          location: location || undefined,
          status: 'New', // Par défaut, le statut est 'New' pour les leads importés
          source: source || undefined,
          property_reference: property_reference || undefined,
          external_id: external_id || undefined,
          integration_source: integrationSource || "api",
          notes: message || undefined,
          desired_location: desired_location || undefined,
          budget: budget || undefined,
          property_type: property_type || undefined,
          living_area: living_area || undefined,
          bedrooms: bedrooms || undefined,
          views: views || undefined,
          amenities: amenities || undefined,
          purchase_timeframe: purchase_timeframe || undefined,
          financing_method: financing_method || undefined,
          property_use: property_use || undefined,
          imported_at: new Date().toISOString(),
          last_contacted_at: new Date().toISOString(),
          raw_data: additionalData ? JSON.stringify(additionalData) : null
        })
        .eq('id', existingLead.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }
      
      result = {
        success: true,
        message: "Lead mis à jour avec succès",
        data: updatedLead,
        isNew: false
      };
    } else {
      // Créer un nouveau lead
      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert({
          name,
          email,
          phone: phone || null,
          location: location || null,
          status: 'New', // Par défaut, le statut est 'New' pour les leads importés
          tags: ['Imported'],
          source: source || null,
          property_reference: property_reference || null,
          external_id: external_id || null,
          integration_source: integrationSource || "api",
          notes: message || null,
          desired_location: desired_location || null,
          budget: budget || null,
          property_type: property_type || null,
          living_area: living_area || null,
          bedrooms: bedrooms || null,
          views: views || null,
          amenities: amenities || null,
          purchase_timeframe: purchase_timeframe || null,
          financing_method: financing_method || null,
          property_use: property_use || null,
          raw_data: additionalData ? additionalData : null
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
      
      result = {
        success: true,
        message: "Nouveau lead créé avec succès",
        data: newLead,
        isNew: true
      };
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erreur lors du traitement de la requête:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Erreur serveur: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
