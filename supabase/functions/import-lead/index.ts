
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
    
    console.log("Données reçues:", requestData);
    
    // Détecter si c'est un format de portail immobilier
    const isRealEstatePortal = requestData.portal_name || requestData.portal_reference;
    
    let leadData;
    
    if (isRealEstatePortal) {
      // Parser les données spécifiques du portail immobilier
      leadData = parseRealEstatePortalData(requestData);
    } else {
      // Format standard de l'API
      leadData = {
        name: requestData.name,
        email: requestData.email,
        phone: requestData.phone,
        property_reference: requestData.property_reference,
        external_id: requestData.external_id,
        message: requestData.message,
        location: requestData.location,
        integrationSource: requestData.integration_source || requestData.portal_name || "api",
        desired_location: requestData.desired_location,
        budget: requestData.budget,
        property_type: requestData.property_type,
        living_area: requestData.living_area,
        bedrooms: requestData.bedrooms,
        views: requestData.views,
        amenities: requestData.amenities,
        purchase_timeframe: requestData.purchase_timeframe,
        financing_method: requestData.financing_method,
        property_use: requestData.property_use,
        source: requestData.source,
        country: requestData.country,
        assigned_to: requestData.assigned_to,
        ...extractAdditionalData(requestData)
      };
    }

    console.log("Données du lead à importer:", leadData);

    // Validation minimale: au moins un identifiant est requis (nom ou email ou téléphone)
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

    // Validate assigned_to if provided
    if (leadData.assigned_to) {
      // Check if the assigned user exists
      const { data: assignedUser, error: userError } = await supabase
        .from('team_members')
        .select('id')
        .eq('id', leadData.assigned_to)
        .maybeSingle();
      
      if (userError) {
        console.log('Error checking team member:', userError);
      }
      
      if (!assignedUser) {
        console.log('Assigned team member not found, ignoring assignment');
        leadData.assigned_to = null;
      }
    }

    // Vérifier si le lead existe déjà (par email, external_id, téléphone ou référence de propriété)
    let existingLead = null;
    
    // 1. D'abord vérifier par external_id s'il existe
    if (leadData.external_id) {
      const { data: leadByExternalId } = await supabase
        .from('leads')
        .select('id, name, email')
        .eq('external_id', leadData.external_id)
        .maybeSingle();
      
      if (leadByExternalId) {
        existingLead = leadByExternalId;
        console.log("Lead existant trouvé par external_id:", existingLead);
      }
    }
    
    // 2. Ensuite vérifier par email
    if (!existingLead && leadData.email) {
      const { data: leadByEmail } = await supabase
        .from('leads')
        .select('id, name, email')
        .eq('email', leadData.email)
        .maybeSingle();
      
      if (leadByEmail) {
        existingLead = leadByEmail;
        console.log("Lead existant trouvé par email:", existingLead);
      }
    }

    // 3. Ensuite vérifier par téléphone
    if (!existingLead && leadData.phone) {
      const { data: leadByPhone } = await supabase
        .from('leads')
        .select('id, name, email, phone')
        .eq('phone', leadData.phone)
        .maybeSingle();
      
      if (leadByPhone) {
        existingLead = leadByPhone;
        console.log("Lead existant trouvé par téléphone:", existingLead);
      }
    }

    // 4. Enfin, pour Property Cloud, vérifier par référence de propriété
    if (!existingLead && leadData.property_reference && 
        (leadData.source?.toLowerCase().includes('property cloud') || 
         leadData.integrationSource?.toLowerCase().includes('property cloud'))) {
      
      const { data: leadByPropertyRef } = await supabase
        .from('leads')
        .select('id, name, email, phone, property_reference')
        .eq('property_reference', leadData.property_reference)
        .maybeSingle();
      
      if (leadByPropertyRef) {
        existingLead = leadByPropertyRef;
        console.log("Lead existant trouvé par référence de propriété:", existingLead);
      }
    }

    // Préparation des données pour insertion/mise à jour en traitant les valeurs nulles
    const leadDataToUpsert = {
      name: leadData.name || "Sans nom",
      email: leadData.email || null,
      phone: leadData.phone || null,
      location: leadData.location || null,
      status: 'New',
      source: leadData.source || null,
      property_reference: leadData.property_reference || null,
      external_id: leadData.external_id || null,
      integration_source: leadData.integrationSource || "api",
      notes: leadData.message || null,
      desired_location: leadData.desired_location || null,
      budget: leadData.budget || null,
      property_type: leadData.property_type || null,
      living_area: leadData.living_area || null,
      bedrooms: leadData.bedrooms || null,
      views: leadData.views || null,
      amenities: leadData.amenities || null,
      purchase_timeframe: leadData.purchase_timeframe || null,
      financing_method: leadData.financing_method || null,
      property_use: leadData.property_use || null,
      country: leadData.country || null,
      assigned_to: leadData.assigned_to || null,
      imported_at: new Date().toISOString(),
      last_contacted_at: new Date().toISOString(),
      raw_data: leadData.additionalData ? JSON.stringify(leadData.additionalData) : null
    };

    let result;
    
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

// Fonction pour parser les données spécifiques des portails immobiliers
function parseRealEstatePortalData(data) {
  // Identifier le portail immobilier
  let source = data.portal_name || "";
  
  // Structure de base du lead
  const lead = {
    name: "",
    email: "",
    phone: "",
    message: "",
    source: "",
    property_reference: "",
    external_id: "",
    integrationSource: source,
    additionalData: {},
    assigned_to: data.assigned_to || null
  };
  
  // Copier toutes les données brutes pour référence future
  lead.additionalData = { ...data };
  
  // Vérifier s'il s'agit d'un message WhatsApp ou lié à WhatsApp
  const isWhatsAppRelated = data.message?.toLowerCase().includes('whatsapp') || 
                           (data.message?.toLowerCase().includes('automated message') && 
                            data.message?.toLowerCase().includes('contacted you through'));
  
  // Parser selon le format du portail
  if (source.toLowerCase().includes("figaro") || data.email_from?.includes("lefigaro.fr")) {
    // Format "Propriétés Le Figaro"
    lead.source = "Le Figaro";
    lead.name = data.name || data.nom || "";
    lead.email = data.email || data.email_from || "";
    lead.phone = data.phone || data.telephone || "";
    lead.property_reference = data.reference || data.property_reference || data.votre_reference || "";
    lead.external_id = data.portal_reference || data.reference_portal || "";
    lead.message = data.message || data.commentaire || data.description || "";
    
    // Extraction des données supplémentaires
    if (data.property_price) {
      lead.budget = data.property_price;
    } else if (data.budget_min && data.budget_max) {
      lead.budget = `${data.budget_min} - ${data.budget_max} €`;
    }
    
    if (data.property_location || data.property_city) {
      lead.desired_location = data.property_location || data.property_city;
    }
    
    if (data.property_type) {
      lead.property_type = mapPropertyType(data.property_type);
    }
    
    if (data.property_area) {
      lead.living_area = `${data.property_area} m²`;
    }
    
    if (data.property_bedrooms) {
      lead.bedrooms = parseInt(data.property_bedrooms, 10) || null;
    }
    
    if (data.country) {
      lead.country = mapCountry(data.country);
    }
  } else if (source.toLowerCase().includes("idealista")) {
    // Format "Idealista"
    lead.source = "Idealista";
    lead.name = data.name || data.nombreContacto || "";
    lead.email = data.email || data.emailContacto || "";
    lead.phone = data.phone || data.telefonoContacto || "";
    lead.property_reference = data.reference || data.referenciaAnuncio || "";
    lead.external_id = data.portal_reference || data.idContacto || "";
    lead.message = data.message || data.mensaje || "";
    
    // Extraction des données supplémentaires (spécifiques à Idealista)
    if (data.precioAnuncio) {
      lead.budget = `${data.precioAnuncio} €`;
    }
    
    if (data.ubicacionAnuncio) {
      lead.desired_location = data.ubicacionAnuncio;
    }
    
    if (data.tipoInmueble) {
      lead.property_type = mapPropertyType(data.tipoInmueble);
    }
  } else if (source.toLowerCase().includes("property cloud") || 
            data.email_from?.includes("property") || 
            data.email_from?.includes("cloud") ||
            data.email_from?.includes("apimo") ||
            data.message?.includes("propertycloud.mu")) {
    // Format "Property Cloud" - incluant les messages par Apimo
    lead.source = isWhatsAppRelated ? "Property Cloud - WhatsApp" : "Property Cloud";
    
    // Extraction du nom - différents formats possibles
    const nameMatch = data.message?.match(/Name\s*:\s*([^\r\n]+)/i) || 
                     data.message?.match(/Nom\s*:\s*([^\r\n]+)/i) ||
                     data.message?.match(/Coordonates\s*:[\s\S]*?Name\s*:\s*([^\r\n]+)/i);
    
    if (nameMatch && nameMatch[1]) {
      lead.name = nameMatch[1].trim();
    } else if (isWhatsAppRelated) {
      lead.name = "Contact via WhatsApp";
    } else {
      lead.name = data.name || "";
    }
    
    // Extraction de l'email - différents formats possibles
    const emailMatch = data.message?.match(/e-?mail\s*:\s*([^\r\n]+)/i) ||
                      data.message?.match(/Coordonates\s*:[\s\S]*?e-?mail\s*:\s*([^\r\n]+)/i);
    
    if (emailMatch && emailMatch[1]) {
      lead.email = emailMatch[1].trim();
    } else {
      // Recherche générique d'adresse email
      const genericEmailMatch = data.message?.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (genericEmailMatch) {
        lead.email = genericEmailMatch[0];
      } else {
        lead.email = data.email || "";
      }
    }
    
    // Extraction du téléphone - différents formats possibles
    const phoneMatch = data.message?.match(/Phone\s*:\s*([^\r\n]+)/i) || 
                      data.message?.match(/Téléphone\s*:\s*([^\r\n]+)/i) ||
                      data.message?.match(/Tel\s*:\s*([^\r\n]+)/i) ||
                      data.message?.match(/Coordonates\s*:[\s\S]*?Phone\s*:\s*([^\r\n]+)/i);
    
    if (phoneMatch && phoneMatch[1]) {
      lead.phone = phoneMatch[1].trim();
    } else {
      lead.phone = data.phone || "";
    }
    
    // Extraction du langage
    const langMatch = data.message?.match(/Language\s*:\s*([^\r\n]+)/i);
    if (langMatch && langMatch[1]) {
      lead.additionalData.language = langMatch[1].trim();
    }
    
    // Extraction de la référence de propriété - formats spécifiques
    
    // Format pour les emails Apimo/Property Cloud: "Criterias : Property : 85581152 - Tamarin - 2350000.00 USD"
    const criteriasPropMatch = data.message?.match(/Criterias\s*:[\s\S]*?Property\s*:\s*(\d+)([^\r\n]+)/i);
    if (criteriasPropMatch) {
      lead.property_reference = criteriasPropMatch[1].trim();
      
      // Extraction de la location et du prix
      const propInfo = criteriasPropMatch[2].trim();
      const locationPriceMatch = propInfo.match(/\s*-\s*([^-]+)\s*-\s*([^-\r\n]+)/);
      if (locationPriceMatch) {
        lead.desired_location = locationPriceMatch[1].trim();
        lead.budget = locationPriceMatch[2].trim();
      }
    } else {
      // Format standard
      const refMatch = data.message?.match(/Property\s*:\s*(\d+)/i) || 
                      data.message?.match(/Reference\s*:\s*(\d+)/i);
      
      if (refMatch && refMatch[1]) {
        lead.property_reference = refMatch[1].trim();
        
        // Format standard "Property : 12345 - Location - Price"
        const propertyFullLine = data.message?.match(/Property\s*:\s*(\d+)([^\r\n]+)/i);
        if (propertyFullLine && propertyFullLine[2]) {
          const propertyInfo = propertyFullLine[2].trim();
          
          // Extraction de location et prix
          const locationPriceMatch = propertyInfo.match(/\s*[-–]\s*([^-–]+)\s*[-–]\s*([^-–\r\n]+)/);
          if (locationPriceMatch) {
            lead.desired_location = locationPriceMatch[1].trim();
            lead.budget = locationPriceMatch[2].trim();
          }
        }
      }
    }
    
    // Extraction d'URL
    const urlMatch = data.message?.match(/url\s*:\s*(https?:\/\/[^\s\r\n]+)/i) ||
                    data.message?.match(/https?:\/\/[^\s\r\n]+/i);
    
    if (urlMatch) {
      const url = urlMatch[0].includes('://') ? urlMatch[0] : urlMatch[1];
      lead.additionalData.property_url = url.trim();
      
      // Si la référence n'a pas été trouvée avant, essayer de l'extraire de l'URL
      if (!lead.property_reference) {
        const urlRefMatch = url.match(/gad(\d+)/i);
        if (urlRefMatch && urlRefMatch[1]) {
          lead.property_reference = urlRefMatch[1];
        }
      }
    }
    
    // Extraction du message
    if (isWhatsAppRelated) {
      // Pour les messages WhatsApp, format spécifique
      const whatsappMessageMatch = data.message?.match(/Message\s*:\s*([^\r\n]+).*?url:/is) || 
                                  data.message?.match(/Message\s*:\s*([^\r\n]+)/i);
      
      if (whatsappMessageMatch && whatsappMessageMatch[1]) {
        lead.message = whatsappMessageMatch[1].trim();
      }
    } else {
      // Format standard pour les autres emails
      const messageMatch = data.message?.match(/Message\s*:\s*([\s\S]+?)(?=Date|$)/i);
      if (messageMatch && messageMatch[1]) {
        lead.message = messageMatch[1].trim();
      } else {
        lead.message = data.message || "";
      }
    }
  } else {
    // Format générique pour les autres portails
    lead.name = data.name || data.full_name || data.contact_name || "";
    lead.email = data.email || data.contact_email || "";
    lead.phone = data.phone || data.contact_phone || data.telephone || "";
    lead.message = data.message || data.comments || data.description || "";
    lead.property_reference = data.property_reference || data.reference || "";
    lead.external_id = data.external_id || data.portal_reference || "";
    
    // Essayer de détecter la source
    if (source === "") {
      if (data.email_from) {
        if (data.email_from.includes("properstar")) lead.source = "Properstar";
        else if (data.email_from.includes("luxuryestate")) lead.source = "L'express Property";
        else if (data.email_from.includes("propertycloud")) lead.source = "Property Cloud";
        else if (data.email_from.includes("apimo")) lead.source = "Property Cloud";
        else lead.source = "Portails immobiliers";
      } else {
        lead.source = "Portails immobiliers";
      }
    } else {
      lead.source = mapPortalSource(source);
    }
    
    // Extraction des données supplémentaires
    if (data.price || data.property_price) {
      lead.budget = `${data.price || data.property_price} €`;
    }
    
    if (data.location || data.city || data.property_location) {
      lead.desired_location = data.location || data.city || data.property_location;
    }
    
    if (data.property_type) {
      lead.property_type = mapPropertyType(data.property_type);
    }
    
    if (data.area || data.surface || data.property_area) {
      lead.living_area = `${data.area || data.surface || data.property_area} m²`;
    }
    
    if (data.bedrooms || data.property_bedrooms) {
      lead.bedrooms = parseInt(data.bedrooms || data.property_bedrooms, 10) || null;
    }
  }
  
  // Vérifications finales et fallbacks
  // Si on n'a pas de nom mais qu'on a un email, utiliser la partie locale de l'email
  if (!lead.name && lead.email) {
    const emailLocalPart = lead.email.split('@')[0];
    lead.name = emailLocalPart
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
  
  // S'assurer qu'un nom est toujours présent
  if (!lead.name) {
    if (isWhatsAppRelated) {
      lead.name = "Contact via WhatsApp";
    } else {
      lead.name = "Contact sans nom";
    }
  }
  
  return lead;
}

// Fonction pour extraire les données supplémentaires (non mappées) de la requête
function extractAdditionalData(requestData) {
  const mapped = [
    'name', 'email', 'phone', 'property_reference', 'external_id', 'message',
    'location', 'integration_source', 'desired_location', 'budget', 'property_type',
    'living_area', 'bedrooms', 'views', 'amenities', 'purchase_timeframe',
    'financing_method', 'property_use', 'source', 'country', 'assigned_to'
  ];
  
  const additionalData = {};
  
  for (const [key, value] of Object.entries(requestData)) {
    if (!mapped.includes(key)) {
      additionalData[key] = value;
    }
  }
  
  return { additionalData };
}

// Fonction pour mapper les types de propriétés
function mapPropertyType(type) {
  if (!type) return null;
  
  const typeMap = {
    'villa': 'Villa',
    'appartement': 'Appartement',
    'apartment': 'Appartement',
    'penthouse': 'Penthouse',
    'maison': 'Maison',
    'house': 'Maison',
    'duplex': 'Duplex',
    'chalet': 'Chalet',
    'terrain': 'Terrain',
    'land': 'Terrain',
    'manoir': 'Manoir',
    'manor': 'Manoir',
    'town house': 'Maison de ville',
    'maison de ville': 'Maison de ville',
    'château': 'Château',
    'castle': 'Château',
    'commercial': 'Commercial',
    'local commercial': 'Local commercial',
    'hotel': 'Hotel',
    'vineyard': 'Vignoble',
    'vignoble': 'Vignoble'
  };
  
  const lowerType = type.toLowerCase();
  
  for (const [key, value] of Object.entries(typeMap)) {
    if (lowerType.includes(key)) {
      return value;
    }
  }
  
  return "Autres";
}

// Fonction pour mapper les pays
function mapCountry(country) {
  if (!country) return null;
  
  const countryMap = {
    'france': 'France',
    'espagne': 'Spain',
    'spain': 'Spain',
    'suisse': 'Switzerland',
    'switzerland': 'Switzerland',
    'portugal': 'Portugal',
    'royaume-uni': 'United Kingdom',
    'uk': 'United Kingdom',
    'united kingdom': 'United Kingdom',
    'états-unis': 'United States',
    'usa': 'United States',
    'united states': 'United States',
    'émirats arabes unis': 'United Arab Emirates',
    'uae': 'United Arab Emirates',
    'united arab emirates': 'United Arab Emirates',
    'grèce': 'Greece',
    'greece': 'Greece',
    'croatie': 'Croatia',
    'croatia': 'Croatia',
    'maldives': 'Maldives',
    'maurice': 'Mauritius',
    'mauritius': 'Mauritius',
    'seychelles': 'Seychelles'
  };
  
  const lowerCountry = country.toLowerCase();
  
  for (const [key, value] of Object.entries(countryMap)) {
    if (lowerCountry.includes(key)) {
      return value;
    }
  }
  
  return null;
}

// Fonction pour mapper les sources des portails
function mapPortalSource(source) {
  if (!source) return "Portails immobiliers";
  
  const sourceMap = {
    'figaro': 'Le Figaro',
    'idealista': 'Idealista',
    'properstar': 'Properstar',
    'property cloud': 'Property Cloud',
    'luxuryestate': 'L\'express Property',
    'express': 'L\'express Property'
  };
  
  const lowerSource = source.toLowerCase();
  
  for (const [key, value] of Object.entries(sourceMap)) {
    if (lowerSource.includes(key)) {
      return value;
    }
  }
  
  return "Portails immobiliers";
}
