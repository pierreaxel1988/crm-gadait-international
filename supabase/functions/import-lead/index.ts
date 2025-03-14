
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
    let requestData;
    try {
      requestData = await req.json();
      console.log("Données reçues:", requestData);
    } catch (parseError) {
      console.error("Erreur lors du parsing de la requête JSON:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Impossible de parser les données JSON de la requête"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    if (!requestData || typeof requestData !== 'object') {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Les données de la requête sont invalides ou manquantes"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Vérifier si un email complet a été envoyé pour extraction
    let leadData: any = {};
    
    if (requestData.message && 
        (requestData.message.includes("Propriétés Le Figaro") || 
        requestData.message.includes("Un(e) internaute est intéressé(e)") ||
        requestData.message.includes("Property Cloud") ||
        requestData.message.includes("Apimo") ||
        requestData.message.includes("WhatsApp"))) {
      
      console.log("Détection d'un email de portail immobilier, tentative d'extraction...");
      leadData = parseEmailContent(requestData.message);
      
      // Si un assigné est fourni, l'ajouter aux données extraites
      if (requestData.assigned_to) {
        leadData.assigned_to = requestData.assigned_to;
      }
      
      // Ajouter la source d'intégration
      leadData.integration_source = requestData.integration_source || 'Email Parser';
      
      console.log("Données extraites de l'email:", leadData);
    } else {
      // Utilisation directe des données transmises
      leadData = {
        name: requestData.name,
        email: requestData.email,
        phone: requestData.phone,
        property_reference: requestData.property_reference,
        message: requestData.message,
        source: requestData.source || 'Manuel',
        integration_source: requestData.integration_source || 'Manual Import',
        assigned_to: requestData.assigned_to,
        country: requestData.country || null,
        desired_location: requestData.desired_location || null,
        property_type: requestData.property_type || null,
        budget: requestData.budget || null
      };
    }

    // Validation minimale: au moins un identifiant est requis
    if (!leadData.name && !leadData.email && !leadData.phone) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Au moins un des champs 'name', 'email' ou 'phone' est obligatoire"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Vérifier si l'utilisateur assigné existe
    if (leadData.assigned_to) {
      const { data: assignedUser, error: userError } = await supabase
        .from('team_members')
        .select('id')
        .eq('id', leadData.assigned_to)
        .maybeSingle();
      
      if (userError) {
        console.log('Erreur lors de la vérification du membre d\'équipe:', userError);
      }
      
      if (!assignedUser) {
        console.log('Membre d\'équipe assigné non trouvé, assignation ignorée');
        leadData.assigned_to = null;
      }
    }

    // Vérifier si le lead existe déjà (par email ou téléphone)
    let existingLead = null;
    
    // 1. Vérifier par email
    if (leadData.email) {
      const { data: leadByEmail, error: emailError } = await supabase
        .from('leads')
        .select('id, name, email')
        .eq('email', leadData.email)
        .maybeSingle();
      
      if (emailError) {
        console.error("Erreur lors de la recherche par email:", emailError);
      }
      
      if (leadByEmail) {
        existingLead = leadByEmail;
        console.log("Lead existant trouvé par email:", existingLead);
      }
    }

    // 2. Vérifier par téléphone si pas trouvé par email
    if (!existingLead && leadData.phone) {
      const { data: leadByPhone, error: phoneError } = await supabase
        .from('leads')
        .select('id, name, email, phone')
        .eq('phone', leadData.phone)
        .maybeSingle();
      
      if (phoneError) {
        console.error("Erreur lors de la recherche par téléphone:", phoneError);
      }
      
      if (leadByPhone) {
        existingLead = leadByPhone;
        console.log("Lead existant trouvé par téléphone:", existingLead);
      }
    }

    // 3. Si propriété de référence et source Property Cloud, vérifier par référence
    if (!existingLead && leadData.property_reference && 
        (leadData.source?.toLowerCase().includes('property cloud') || 
         leadData.integration_source?.toLowerCase().includes('property cloud'))) {
      
      const { data: leadByPropertyRef, error: refError } = await supabase
        .from('leads')
        .select('id, name, email, phone, property_reference')
        .eq('property_reference', leadData.property_reference)
        .maybeSingle();
      
      if (refError) {
        console.error("Erreur lors de la recherche par référence de propriété:", refError);
      }
      
      if (leadByPropertyRef) {
        existingLead = leadByPropertyRef;
        console.log("Lead existant trouvé par référence de propriété:", existingLead);
      }
    }

    // Préparation des données pour insertion/mise à jour
    const leadDataToUpsert = {
      name: leadData.name || "Sans nom",
      email: leadData.email || null,
      phone: leadData.phone || null,
      status: 'New',
      source: leadData.source || null,
      property_reference: leadData.property_reference || null,
      integration_source: leadData.integration_source || "api",
      notes: leadData.message || null,
      desired_location: leadData.desired_location || null,
      budget: leadData.budget || null,
      property_type: leadData.property_type || null,
      country: leadData.country || null,
      assigned_to: leadData.assigned_to || null,
      imported_at: new Date().toISOString(),
      last_contacted_at: new Date().toISOString()
    };

    let result;
    
    try {
      if (existingLead) {
        // Mettre à jour le lead existant
        console.log("Mise à jour d'un lead existant:", existingLead.id);
        const { data: updatedLead, error: updateError } = await supabase
          .from('leads')
          .update(leadDataToUpsert)
          .eq('id', existingLead.id)
          .select()
          .single();

        if (updateError) {
          console.error("Erreur lors de la mise à jour du lead:", updateError);
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
        console.log("Création d'un nouveau lead");
        const { data: newLead, error: insertError } = await supabase
          .from('leads')
          .insert({
            ...leadDataToUpsert,
            tags: ['Imported']
          })
          .select()
          .single();

        if (insertError) {
          console.error("Erreur lors de la création du lead:", insertError);
          throw insertError;
        }
        
        result = {
          success: true,
          message: "Nouveau lead créé avec succès",
          data: newLead,
          isNew: true
        };
      }
    } catch (dbError: any) {
      console.error("Erreur base de données:", dbError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erreur base de données: ${dbError.message || 'Erreur inconnue'}`,
          details: dbError
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
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

// Fonction pour parser le contenu des emails de portails immobiliers
function parseEmailContent(emailContent: string) {
  const data: Record<string, any> = {
    integration_source: 'Email Parser'
  };
  
  // Détection du format Le Figaro
  if (emailContent.includes('Propriétés Le Figaro')) {
    data.source = 'Le Figaro';
    
    // Extraction des informations de base
    const nameMatch = emailContent.match(/•\s*Nom\s*:\s*([^\r\n]+)/i);
    if (nameMatch && nameMatch[1]) {
      data.name = nameMatch[1].trim();
    }
    
    const emailMatch = emailContent.match(/•\s*Email\s*:\s*([^\r\n]+)/i);
    if (emailMatch && emailMatch[1]) {
      data.email = emailMatch[1].trim();
    }
    
    const phoneMatch = emailContent.match(/•\s*Téléphone\s*:\s*([^\r\n]+)/i);
    if (phoneMatch && phoneMatch[1]) {
      data.phone = phoneMatch[1].trim();
    }
    
    // Extraction de la localisation
    const locationMatch = emailContent.match(/•\s*([^•\r\n]+)\s*\(([^)]+)\)/i);
    if (locationMatch) {
      data.desired_location = locationMatch[1].trim();
      data.country = locationMatch[2].trim();
    }
    
    // Extraction du type de propriété
    const propertyTypeMatch = emailContent.match(/•\s*([^•\r\n]+)\s*\n•\s*de/i);
    if (propertyTypeMatch) {
      data.property_type = propertyTypeMatch[1].trim();
    }
    
    // Extraction du budget
    const budgetMatch = emailContent.match(/•\s*de\s*([0-9\s]+)\s*à\s*([0-9\s]+)\s*€/i);
    if (budgetMatch) {
      data.budget = `${budgetMatch[1].replace(/\s/g, '')} - ${budgetMatch[2].replace(/\s/g, '')} €`;
    }
    
    // Extraction du message
    const messageMatch = emailContent.match(/Bonjour,\s*([\s\S]*?)Cordialement\./i);
    if (messageMatch && messageMatch[1]) {
      data.message = messageMatch[1].trim();
    }
    
    // Extraction des références
    const refMatch = emailContent.match(/Votre Référence\s*:\s*([^-\r\n]+)/i);
    if (refMatch && refMatch[1]) {
      data.property_reference = refMatch[1].trim();
    }
  } 
  // Détection format Property Cloud / WhatsApp / Apimo
  else if (emailContent.toLowerCase().includes('property cloud') || 
          emailContent.includes('whatsapp') || 
          emailContent.toLowerCase().includes('apimo')) {
    
    data.source = emailContent.includes('whatsapp') ? 
      'Property Cloud - WhatsApp' : 'Property Cloud';
    
    // Extraction du nom
    const nameMatch = emailContent.match(/Name\s*:\s*([^\r\n]+)/i);
    if (nameMatch && nameMatch[1]) {
      data.name = nameMatch[1].trim();
    } else {
      data.name = "Contact via WhatsApp";
    }
    
    // Extraction de l'email
    const emailMatch = emailContent.match(/e-?mail\s*:\s*([^\r\n]+)/i);
    if (emailMatch && emailMatch[1]) {
      data.email = emailMatch[1].trim();
    } else {
      // Recherche d'email générique dans le texte
      const genericEmailMatch = emailContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (genericEmailMatch) {
        data.email = genericEmailMatch[0];
      }
    }
    
    // Extraction du téléphone
    const phoneMatch = emailContent.match(/Phone\s*:\s*([^\r\n]+)/i) || 
                      emailContent.match(/Tel\s*:\s*([^\r\n]+)/i);
    if (phoneMatch && phoneMatch[1]) {
      data.phone = phoneMatch[1].trim();
    }
    
    // Extraction de la référence de propriété
    const propRefMatch = emailContent.match(/Property\s*:\s*(\d+)/i);
    if (propRefMatch && propRefMatch[1]) {
      data.property_reference = propRefMatch[1].trim();
    }
    
    // Extraction du message
    const messageMatch = emailContent.match(/Message\s*:\s*([^\r\n]+)/i);
    if (messageMatch && messageMatch[1]) {
      data.message = messageMatch[1].trim();
    }
  } 
  // Format générique - tentative d'extraction basique
  else {
    // Extraction d'informations basiques si possible
    const emailAddressMatch = emailContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailAddressMatch) {
      data.email = emailAddressMatch[0];
      // Nom par défaut depuis l'email
      const emailLocalPart = data.email.split('@')[0];
      data.name = emailLocalPart
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    } else {
      data.name = "Contact sans nom";
    }
    
    data.message = emailContent.slice(0, 500); // Limiter la longueur
    data.source = "Email";
  }
  
  return data;
}
