
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
    createdAt: supabaseData.created_at || new Date().toISOString(),
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
    keyFeatures: supabaseData.key_features || [],
    condoFees: supabaseData.condo_fees || '',
    facilities: supabaseData.facilities || [],
    
    // Additional fields  
    parkingSpaces: supabaseData.parking_spaces,
    floors: supabaseData.floors,
    orientation: supabaseData.orientation || [],
    energyClass: supabaseData.energy_class || '',
    yearlyTaxes: supabaseData.yearly_taxes || '',
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
    google_drive_link: supabaseData.google_drive_link || ''
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
    country: leadData.country,
    url: leadData.url,
    pipeline_type: leadData.pipelineType,
    tax_residence: leadData.taxResidence,
    regions: leadData.regions,
    
    // Property details
    living_area: leadData.livingArea,
    land_area: leadData.landArea,
    construction_year: leadData.constructionYear,
    renovation_needed: leadData.renovationNeeded,
    property_description: leadData.propertyDescription,
    key_features: leadData.keyFeatures,
    condo_fees: leadData.condoFees,
    facilities: leadData.facilities,
    
    // Additional fields
    parking_spaces: leadData.parkingSpaces,
    floors: leadData.floors,
    orientation: leadData.orientation,
    energy_class: leadData.energyClass,
    yearly_taxes: leadData.yearlyTaxes,
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
    google_drive_link: leadData.google_drive_link || ''
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

export const transformSupabaseToLead = (supabaseLead: any): LeadDetailed => {
  return {
    id: supabaseLead.id,
    name: supabaseLead.name || '',
    email: supabaseLead.email || '',
    phone: supabaseLead.phone || '',
    createdAt: supabaseLead.created_at || new Date().toISOString(),
    lastContactedAt: supabaseLead.last_contacted_at,
    assignedTo: supabaseLead.assigned_to,
    source: supabaseLead.source,
    propertyReference: supabaseLead.property_reference || '',
    budget: supabaseLead.budget || '',
    budgetMin: supabaseLead.budget_min || '',
    currency: supabaseLead.currency || 'EUR',
    desiredLocation: supabaseLead.desired_location || '',
    propertyType: supabaseLead.property_type || '',
    propertyTypes: supabaseLead.property_types || [],
    bedrooms: supabaseLead.bedrooms,
    views: supabaseLead.views || [],
    amenities: supabaseLead.amenities || [],
    purchaseTimeframe: supabaseLead.purchase_timeframe,
    financingMethod: supabaseLead.financing_method,
    propertyUse: supabaseLead.property_use,
    nationality: supabaseLead.nationality || '',
    preferredLanguage: supabaseLead.preferred_language,
    taskType: supabaseLead.task_type,
    notes: supabaseLead.notes || '',
    internal_notes: supabaseLead.internal_notes || '',
    nextFollowUpDate: supabaseLead.next_follow_up_date,
    country: supabaseLead.country,
    url: supabaseLead.url || '',
    pipelineType: supabaseLead.pipeline_type || 'purchase',
    pipeline_type: supabaseLead.pipeline_type || 'purchase',
    taxResidence: supabaseLead.tax_residence,
    regions: supabaseLead.regions || [],
    
    // Import related fields
    imported_at: supabaseLead.imported_at,
    integration_source: supabaseLead.integration_source,
    actionHistory: supabaseLead.action_history || [],
    livingArea: supabaseLead.living_area,
    external_id: supabaseLead.external_id,
    
    // Property details
    landArea: supabaseLead.land_area || '',
    constructionYear: supabaseLead.construction_year || '',
    renovationNeeded: supabaseLead.renovation_needed || '',
    propertyDescription: supabaseLead.property_description || '',
    keyFeatures: supabaseLead.key_features || [],
    condoFees: supabaseLead.condo_fees || '',
    facilities: supabaseLead.facilities || [],
    
    // Additional fields  
    parkingSpaces: supabaseLead.parking_spaces,
    floors: supabaseLead.floors,
    orientation: supabaseLead.orientation || [],
    energyClass: supabaseLead.energy_class || '',
    yearlyTaxes: supabaseLead.yearly_taxes || '',
    assets: supabaseLead.assets || [],
    equipment: supabaseLead.equipment || [],
    
    // Owner-specific fields
    desired_price: supabaseLead.desired_price || '',
    fees: supabaseLead.fees || '',
    relationship_status: supabaseLead.relationship_status,
    mandate_type: supabaseLead.mandate_type,
    specific_needs: supabaseLead.specific_needs || '',
    attention_points: supabaseLead.attention_points || '',
    relationship_details: supabaseLead.relationship_details || '',
    first_contact_date: supabaseLead.first_contact_date,
    last_contact_date: supabaseLead.last_contact_date,
    next_action_date: supabaseLead.next_action_date,
    contact_source: supabaseLead.contact_source,
    
    // Additional luxury real estate fields
    bathrooms: supabaseLead.bathrooms,
    propertyState: supabaseLead.property_state,
    furnished: supabaseLead.furnished || false,
    furniture_included_in_price: supabaseLead.furniture_included_in_price || false,
    furniture_price: supabaseLead.furniture_price || '',
    
    // Email related
    email_envoye: supabaseLead.email_envoye || false,
    
    // Google Drive link
    google_drive_link: supabaseLead.google_drive_link || ''
  };
};
