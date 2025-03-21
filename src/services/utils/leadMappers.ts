
import { LeadDetailed, PipelineType, LeadStatus, LeadTag, TaskType, Country } from "@/types/lead";

/**
 * Maps a Supabase lead record to the LeadDetailed type
 */
export const mapToLeadDetailed = (data: any): LeadDetailed => {
  // Parse bedrooms field if it's a string that looks like JSON
  let parsedBedrooms = data.bedrooms;
  try {
    if (typeof data.bedrooms === 'string' && data.bedrooms.startsWith('[')) {
      parsedBedrooms = JSON.parse(data.bedrooms);
    }
  } catch (e) {
    console.error("Error parsing bedrooms:", e);
    parsedBedrooms = data.bedrooms;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    location: data.location,
    status: data.status as LeadStatus,
    tags: data.tags as LeadTag[],
    createdAt: data.created_at,
    lastContactedAt: data.last_contacted_at,
    assignedTo: data.assigned_to,
    source: data.source,
    propertyReference: data.property_reference,
    budget: data.budget,
    desiredLocation: data.desired_location,
    propertyType: data.property_type,
    bedrooms: parsedBedrooms,
    views: data.views,
    amenities: data.amenities,
    purchaseTimeframe: data.purchase_timeframe,
    financingMethod: data.financing_method,
    propertyUse: data.property_use,
    nationality: data.nationality,
    taskType: data.task_type as TaskType,
    nextFollowUpDate: data.next_follow_up_date,
    notes: data.notes,
    country: data.country as Country,
    url: data.url,
    external_id: data.external_id,
    pipelineType: data.pipeline_type as PipelineType,
    pipeline_type: data.pipeline_type as PipelineType,
    imported_at: data.imported_at,
    integration_source: data.integration_source,
    livingArea: data.living_area,
    taxResidence: data.tax_residence
  };
};

/**
 * Maps a LeadDetailed object to a format suitable for Supabase
 * Ensures bedrooms is converted to JSON before sending to Supabase
 */
export const mapToSupabaseFormat = (leadData: Partial<LeadDetailed>) => {
  // Convert bedrooms array to a JSON compatible format for Supabase
  let formattedBedrooms = undefined;
  
  if (leadData.bedrooms !== undefined) {
    if (Array.isArray(leadData.bedrooms)) {
      formattedBedrooms = JSON.stringify(leadData.bedrooms);
    } else {
      formattedBedrooms = leadData.bedrooms;
    }
  }
  
  return {
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    location: leadData.location,
    status: leadData.status,
    tags: leadData.tags || [],
    assigned_to: leadData.assignedTo,
    source: leadData.source,
    property_reference: leadData.propertyReference,
    budget: leadData.budget,
    desired_location: leadData.desiredLocation,
    property_type: leadData.propertyType,
    bedrooms: formattedBedrooms,
    views: leadData.views,
    amenities: leadData.amenities,
    purchase_timeframe: leadData.purchaseTimeframe,
    financing_method: leadData.financingMethod,
    property_use: leadData.propertyUse,
    nationality: leadData.nationality,
    task_type: leadData.taskType,
    next_follow_up_date: leadData.nextFollowUpDate,
    notes: leadData.notes,
    country: leadData.country,
    external_id: leadData.external_id,
    url: leadData.url,
    pipeline_type: leadData.pipelineType || leadData.pipeline_type || 'purchase',
    living_area: leadData.livingArea,
    tax_residence: leadData.taxResidence
  };
};

/**
 * Converts a LeadDetailed to a simplified lead object
 */
export const convertToSimpleLead = (lead: LeadDetailed) => {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email || '',
    phone: lead.phone || '',
    status: lead.status,
    tags: lead.tags || [],
    assignedTo: lead.assignedTo,
    createdAt: lead.createdAt,
    source: lead.source,
    pipelineType: lead.pipelineType || lead.pipeline_type || 'purchase'
  };
};
