
import { LeadDetailed } from "@/types/lead";

// Important UUIDs for team members
const JADE_ID = "acab847b-7ace-4681-989d-86f78549aa69";
const JEAN_MARC_ID = "af8e053c-8fae-4424-abaa-d79029fd8a11";
const SHARON_ID = "e564a874-2520-4167-bfa8-26d39f119470";

/**
 * Maps a Supabase lead record to our LeadDetailed type
 */
export const mapToLeadDetailed = (supabaseData: any): LeadDetailed => {
  
  const lead: LeadDetailed = {
    id: supabaseData.id,
    name: supabaseData.name || '',
    salutation: supabaseData.salutation,
    email: supabaseData.email || '',
    phone: supabaseData.phone || '',
    phoneCountryCode: supabaseData.phone_country_code,
    phoneCountryCodeDisplay: supabaseData.phone_country_code_display,
    location: supabaseData.location || '',
    status: supabaseData.status,
    tags: supabaseData.tags || [],
    createdAt: supabaseData.created_at,
    lastContactedAt: supabaseData.last_contacted_at,
    assignedTo: supabaseData.assigned_to,
    source: supabaseData.source,
    propertyReference: supabaseData.property_reference || '',
    budget: supabaseData.budget || '',
    budgetMin: supabaseData.budget_min || '',
    currency: supabaseData.currency || 'EUR',
    desiredLocation: supabaseData.desired_location || '',
    propertyType: supabaseData.property_type || '',
    propertyTypes: supabaseData.property_types || [],
    bedrooms: supabaseData.bedrooms,
    views: supabaseData.views || [],
    amenities: supabaseData.amenities || [],
    purchaseTimeframe: supabaseData.purchase_timeframe,
    financingMethod: supabaseData.financing_method,
    propertyUse: supabaseData.property_use,
    nationality: supabaseData.nationality || '',
    preferredLanguage: supabaseData.preferred_language,
    taskType: supabaseData.task_type,
    notes: supabaseData.notes || '',
    internal_notes: supabaseData.internal_notes || '',
    nextFollowUpDate: supabaseData.next_follow_up_date,
    country: supabaseData.country,
    url: supabaseData.url || '',
    pipelineType: supabaseData.pipeline_type || 'purchase',
    pipeline_type: supabaseData.pipeline_type || 'purchase',
    taxResidence: supabaseData.tax_residence,
    regions: supabaseData.regions || [],
    
    // Import related fields
    imported_at: supabaseData.imported_at,
    integration_source: supabaseData.integration_source,
    actionHistory: supabaseData.action_history || [],
    livingArea: supabaseData.living_area,
    external_id: supabaseData.external_id,
    
    // Property details
    landArea: supabaseData.land_area || '',
    constructionYear: supabaseData.construction_year || '',
    renovationNeeded: supabaseData.renovation_needed || '',
    propertyDescription: supabaseData.property_description || '',
    
    // Additional fields  
    parkingSpaces: supabaseData.parking_spaces,
    floors: supabaseData.floors,
    orientation: supabaseData.orientation || [],
    assets: supabaseData.assets || [],
    equipment: supabaseData.equipment || [],
    
    // Owner-specific fields
    desired_price: supabaseData.desired_price || '',
    fees: supabaseData.fees || '',
    relationship_status: supabaseData.relationship_status,
    mandate_type: supabaseData.mandate_type,
    specific_needs: supabaseData.specific_needs || '',
    attention_points: supabaseData.attention_points || '',
    relationship_details: supabaseData.relationship_details || '',
    first_contact_date: supabaseData.first_contact_date,
    last_contact_date: supabaseData.last_contact_date,
    next_action_date: supabaseData.next_action_date,
    contact_source: supabaseData.contact_source,
    
    // Additional luxury real estate fields
    bathrooms: supabaseData.bathrooms,
    propertyState: supabaseData.property_state,
    furnished: supabaseData.furnished || false,
    furniture_included_in_price: supabaseData.furniture_included_in_price || false,
    furniture_price: supabaseData.furniture_price || '',
    
    // Email related
    email_envoye: supabaseData.email_envoye || false,
    
    // Google Drive link
    google_drive_link: supabaseData.google_drive_link || '',
    
    // Map coordinates
    mapCoordinates: supabaseData.map_coordinates || '',
    
    // Residence country field
    residenceCountry: supabaseData.country || '',

    // Renovation needed field
    renovation_needed: supabaseData.renovation_needed || false
  };

  return lead;
};

/**
 * Maps a LeadDetailed object to Supabase format
 */
export const mapToSupabaseFormat = (leadData: LeadDetailed): any => {
  return {
    id: leadData.id,
    name: leadData.name,
    salutation: leadData.salutation,
    email: leadData.email,
    phone: leadData.phone,
    phone_country_code: leadData.phoneCountryCode,
    phone_country_code_display: leadData.phoneCountryCodeDisplay,
    location: leadData.location,
    status: leadData.status,
    tags: leadData.tags,
    last_contacted_at: leadData.lastContactedAt,
    assigned_to: leadData.assignedTo,
    source: leadData.source,
    property_reference: leadData.propertyReference,
    budget: leadData.budget,
    budget_min: leadData.budgetMin,
    currency: leadData.currency,
    desired_location: leadData.desiredLocation,
    property_type: leadData.propertyType,
    property_types: leadData.propertyTypes,
    bedrooms: leadData.bedrooms,
    views: leadData.views,
    amenities: leadData.amenities,
    purchase_timeframe: leadData.purchaseTimeframe,
    financing_method: leadData.financingMethod,
    property_use: leadData.propertyUse,
    nationality: leadData.nationality,
    preferred_language: leadData.preferredLanguage,
    task_type: leadData.taskType,
    notes: leadData.notes,
    internal_notes: leadData.internal_notes,
    next_follow_up_date: leadData.nextFollowUpDate,
    country: leadData.country || leadData.residenceCountry,
    url: leadData.url,
    pipeline_type: leadData.pipelineType,
    tax_residence: leadData.taxResidence,
    regions: leadData.regions,
    
    // Property details
    living_area: leadData.livingArea,
    land_area: leadData.landArea,
    construction_year: leadData.constructionYear,
    renovation_needed: leadData.renovation_needed,
    property_description: leadData.propertyDescription,
    
    // Additional fields - only include fields that exist in the database
    parking_spaces: leadData.parkingSpaces,
    floors: leadData.floors,
    orientation: leadData.orientation,
    assets: leadData.assets,
    equipment: leadData.equipment,
    
    // Owner-specific fields
    desired_price: leadData.desired_price,
    fees: leadData.fees,
    relationship_status: leadData.relationship_status,
    mandate_type: leadData.mandate_type,
    specific_needs: leadData.specific_needs,
    attention_points: leadData.attention_points,
    relationship_details: leadData.relationship_details,
    first_contact_date: leadData.first_contact_date,
    last_contact_date: leadData.last_contact_date,
    next_action_date: leadData.next_action_date,
    contact_source: leadData.contact_source,
    
    // Additional luxury fields
    bathrooms: leadData.bathrooms,
    property_state: leadData.propertyState,
    furnished: leadData.furnished,
    furniture_included_in_price: leadData.furniture_included_in_price,
    furniture_price: leadData.furniture_price,
    
    // Action history
    action_history: leadData.actionHistory,
    
    // Email related
    email_envoye: leadData.email_envoye,
    
    // Google Drive link
    google_drive_link: leadData.google_drive_link || '',
    
    // Map coordinates
    map_coordinates: leadData.mapCoordinates || ''
  };
};

/**
 * Formats budget for display
 */
export const formatBudget = (budget: string | undefined, currency: string = 'EUR'): string => {
  if (!budget) return '';
  
  // Si le budget contient déjà une devise, le retourner tel quel
  if (budget.includes('€') || budget.includes('$') || budget.includes('£')) {
    return budget;
  }
  
  // Sinon, ajouter la devise appropriée
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';
  return `${budget} ${currencySymbol}`;
};

/**
 * Converts a lead to a simplified format for lists
 */
export const convertToSimpleLead = (lead: LeadDetailed): any => {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    assignedTo: lead.assignedTo,
    createdAt: lead.createdAt,
    tags: lead.tags || [],
    budget: lead.budget,
    location: lead.desiredLocation || lead.location,
    pipelineType: lead.pipelineType || 'purchase'
  };
};
