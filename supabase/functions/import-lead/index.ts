
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for API requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Main server function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = initSupabaseClient();
    const requestData = await req.json();
    
    // Parse and validate lead data
    const leadData = parseLeadData(requestData);
    
    if (!validateLeadData(leadData)) {
      return createErrorResponse("Les champs 'name' et 'email' sont obligatoires", 400);
    }
    
    // Check if lead already exists
    const existingLead = await findExistingLead(supabase, leadData);
    
    // Process lead (create or update)
    const result = await processLead(supabase, leadData, existingLead);
    
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erreur lors du traitement de la requête:", error);
    return createErrorResponse(`Erreur serveur: ${error.message}`, 500);
  }
});

// Initialize Supabase client
function initSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Erreur de configuration: variables d'environnement manquantes");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Create standardized error response
function createErrorResponse(message: string, status: number) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Parse lead data from request
function parseLeadData(requestData: any) {
  // Detect if it's a format from a real estate portal
  const isRealEstatePortal = requestData.portal_name || requestData.portal_reference;
  
  if (isRealEstatePortal) {
    return parseRealEstatePortalData(requestData);
  } else {
    return parseStandardLeadData(requestData);
  }
}

// Parse standard API data format
function parseStandardLeadData(requestData: any) {
  return {
    name: requestData.name,
    email: requestData.email,
    phone: requestData.phone,
    property_reference: requestData.property_reference,
    external_id: requestData.external_id,
    message: requestData.message,
    location: requestData.location,
    integrationSource: requestData.integrationSource || requestData.portal_name || "api",
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

// Validate lead data
function validateLeadData(leadData: any) {
  return leadData.name && leadData.email;
}

// Find existing lead by external_id or email
async function findExistingLead(supabase: any, leadData: any) {
  let existingLead = null;
  
  if (leadData.external_id) {
    const { data: leadByExternalId } = await supabase
      .from('leads')
      .select('id, name, email')
      .eq('external_id', leadData.external_id)
      .maybeSingle();
    
    if (leadByExternalId) {
      existingLead = leadByExternalId;
    }
  }
  
  if (!existingLead && leadData.email) {
    const { data: leadByEmail } = await supabase
      .from('leads')
      .select('id, name, email')
      .eq('email', leadData.email)
      .maybeSingle();
    
    if (leadByEmail) {
      existingLead = leadByEmail;
    }
  }
  
  return existingLead;
}

// Process lead (create new or update existing)
async function processLead(supabase: any, leadData: any, existingLead: any) {
  if (existingLead) {
    return await updateExistingLead(supabase, leadData, existingLead);
  } else {
    return await createNewLead(supabase, leadData);
  }
}

// Update existing lead
async function updateExistingLead(supabase: any, leadData: any, existingLead: any) {
  const { data: updatedLead, error: updateError } = await supabase
    .from('leads')
    .update({
      name: leadData.name || existingLead.name,
      email: leadData.email || existingLead.email,
      phone: leadData.phone || undefined,
      location: leadData.location || undefined,
      status: 'New', // Par défaut, le statut est 'New' pour les leads importés
      source: leadData.source || undefined,
      property_reference: leadData.property_reference || undefined,
      external_id: leadData.external_id || undefined,
      integration_source: leadData.integrationSource || "api",
      notes: leadData.message || undefined,
      desired_location: leadData.desired_location || undefined,
      budget: leadData.budget || undefined,
      property_type: leadData.property_type || undefined,
      living_area: leadData.living_area || undefined,
      bedrooms: leadData.bedrooms || undefined,
      views: leadData.views || undefined,
      amenities: leadData.amenities || undefined,
      purchase_timeframe: leadData.purchase_timeframe || undefined,
      financing_method: leadData.financing_method || undefined,
      property_use: leadData.property_use || undefined,
      country: leadData.country || undefined,
      assigned_to: leadData.assigned_to || undefined,
      imported_at: new Date().toISOString(),
      last_contacted_at: new Date().toISOString(),
      raw_data: leadData.additionalData ? JSON.stringify(leadData.additionalData) : null
    })
    .eq('id', existingLead.id)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }
  
  return {
    success: true,
    message: "Lead mis à jour avec succès",
    data: updatedLead,
    isNew: false
  };
}

// Create new lead
async function createNewLead(supabase: any, leadData: any) {
  const { data: newLead, error: insertError } = await supabase
    .from('leads')
    .insert({
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone || null,
      location: leadData.location || null,
      status: 'New', // Par défaut, le statut est 'New' pour les leads importés
      tags: ['Imported'],
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
      raw_data: leadData.additionalData ? leadData.additionalData : null
    })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }
  
  return {
    success: true,
    message: "Nouveau lead créé avec succès",
    data: newLead,
    isNew: true
  };
}

// Parse data from real estate portals
function parseRealEstatePortalData(data: any) {
  // Identify the real estate portal
  let source = data.portal_name || "";
  
  // Basic lead structure
  const lead = {
    name: "",
    email: "",
    phone: "",
    message: "",
    source: "",
    property_reference: "",
    external_id: "",
    integrationSource: source,
    assigned_to: data.assigned_to || null,
    additionalData: {}
  };
  
  // Copy all raw data for future reference
  lead.additionalData = { ...data };
  
  if (source.toLowerCase().includes("figaro") || data.email_from?.includes("lefigaro.fr")) {
    parseFigaroPortalData(data, lead);
  } else if (source.toLowerCase().includes("idealista")) {
    parseIdealistaPortalData(data, lead);
  } else {
    parseGenericPortalData(data, lead);
  }
  
  return lead;
}

// Parse data specific to "Propriétés Le Figaro" portal
function parseFigaroPortalData(data: any, lead: any) {
  lead.source = "Le Figaro";
  lead.name = data.name || data.nom || "";
  lead.email = data.email || data.email_from || "";
  lead.phone = data.phone || data.telephone || "";
  lead.property_reference = data.reference || data.property_reference || data.votre_reference || "";
  lead.external_id = data.portal_reference || data.reference_portal || "";
  lead.message = data.message || data.commentaire || data.description || "";
  
  // Extract additional data
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
}

// Parse data specific to "Idealista" portal
function parseIdealistaPortalData(data: any, lead: any) {
  lead.source = "Idealista";
  lead.name = data.name || data.nombreContacto || "";
  lead.email = data.email || data.emailContacto || "";
  lead.phone = data.phone || data.telefonoContacto || "";
  lead.property_reference = data.reference || data.referenciaAnuncio || "";
  lead.external_id = data.portal_reference || data.idContacto || "";
  lead.message = data.message || data.mensaje || "";
  
  // Extract additional data
  if (data.precioAnuncio) {
    lead.budget = `${data.precioAnuncio} €`;
  }
  
  if (data.ubicacionAnuncio) {
    lead.desired_location = data.ubicacionAnuncio;
  }
  
  if (data.tipoInmueble) {
    lead.property_type = mapPropertyType(data.tipoInmueble);
  }
}

// Parse data from generic/other portals
function parseGenericPortalData(data: any, lead: any) {
  lead.name = data.name || data.full_name || data.contact_name || "";
  lead.email = data.email || data.contact_email || "";
  lead.phone = data.phone || data.contact_phone || data.telephone || "";
  lead.message = data.message || data.comments || data.description || "";
  lead.property_reference = data.property_reference || data.reference || "";
  lead.external_id = data.external_id || data.portal_reference || "";
  
  // Try to detect the source
  if (data.email_from) {
    if (data.email_from.includes("properstar")) lead.source = "Properstar";
    else if (data.email_from.includes("luxuryestate")) lead.source = "L'express Property";
    else if (data.email_from.includes("propertycloud")) lead.source = "Property Cloud";
    else lead.source = "Portails immobiliers";
  } else if (lead.source === "") {
    lead.source = mapPortalSource(data.portal_name || "");
  }
  
  // Extract additional data
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

// Extract additional data (not mapped) from the request
function extractAdditionalData(requestData: any) {
  const mapped = [
    'name', 'email', 'phone', 'property_reference', 'external_id', 'message',
    'location', 'integrationSource', 'desired_location', 'budget', 'property_type',
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

// Map property types
function mapPropertyType(type: string | null) {
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

// Map countries
function mapCountry(country: string | null) {
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

// Map portal sources
function mapPortalSource(source: string) {
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
