import { LeadDetailed, LeadStatus, PropertyType } from '@/types/lead';
import { ActionHistory } from '@/types/actionHistory';
import { TaskType } from '@/components/kanban/KanbanCard';

export const mapToLeadDetailed = (lead: any): LeadDetailed => {
  // Safely extract action_history from lead
  let actionHistory: ActionHistory[] = [];
  try {
    const rawActionHistory = lead.action_history || lead['action_history'] || [];
    actionHistory = Array.isArray(rawActionHistory) ? rawActionHistory : [];
  } catch (error) {
    console.error('Error extracting action_history:', error);
    actionHistory = [];
  }

  // Handle bedrooms conversion from database
  let bedrooms;
  if (Array.isArray(lead.bedrooms)) {
    bedrooms = lead.bedrooms;
  } else if (lead.bedrooms !== null && lead.bedrooms !== undefined) {
    // Convert single value to array for consistency in UI
    bedrooms = [lead.bedrooms];
  }

  return {
    id: lead.id || '',
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    location: lead.location || '',
    status: lead.status || 'New',
    tags: lead.tags || [],
    createdAt: lead.created_at || new Date().toISOString(),
    lastContactedAt: lead.last_contacted_at,
    assignedTo: lead.assigned_to,
    source: lead.source,
    propertyReference: lead.property_reference,
    budget: lead.budget,
    budgetMin: lead.budget_min,
    currency: lead.currency,
    desiredLocation: lead.desired_location,
    propertyType: lead.property_type,
    propertyTypes: lead.property_types,
    bedrooms: bedrooms,
    views: lead.views,
    amenities: lead.amenities || [],
    purchaseTimeframe: lead.purchase_timeframe,
    financingMethod: lead.financing_method,
    propertyUse: lead.property_use,
    nationality: lead.nationality,
    taxResidence: lead.tax_residence,
    taskType: lead.task_type,
    notes: lead.notes || '',
    nextFollowUpDate: lead.next_follow_up_date,
    country: lead.country,
    url: lead.url,
    pipelineType: lead.pipeline_type,
    pipeline_type: lead.pipeline_type,
    imported_at: lead.imported_at,
    integration_source: lead.integration_source,
    actionHistory: actionHistory,
    livingArea: lead.living_area,
    external_id: lead.external_id
  };
};

export const mapToSupabaseFormat = (lead: LeadDetailed): any => {
  // Log lead fields to ensure they're all present
  console.log("Lead mapping to Supabase format - all fields:", lead);
  
  // We won't include actionHistory in the data sent to Supabase
  // since there's no corresponding column in the database
  
  // Handle bedroom data for database storage
  // If it's an array, we need to convert it appropriately for database storage
  let bedroomsForDb = null;
  if (Array.isArray(lead.bedrooms)) {
    // If only one bedroom is selected, store as a single integer
    // Otherwise, we'll need to use JSONB_AGG in SQL to query it properly
    if (lead.bedrooms.length === 1) {
      bedroomsForDb = lead.bedrooms[0];
    } else if (lead.bedrooms.length > 1) {
      // For multiple selections, we need to update through SQL
      // Store the first value for now, we'll handle multiple in updateLead
      bedroomsForDb = lead.bedrooms.length > 0 ? lead.bedrooms[0] : null;
    }
  } else if (lead.bedrooms !== undefined && lead.bedrooms !== null) {
    // Handle non-array value
    bedroomsForDb = lead.bedrooms;
  }
  
  console.log("Bedrooms for database:", bedroomsForDb, "Original:", lead.bedrooms);
  
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    location: lead.location,
    status: lead.status,
    tags: lead.tags || [],
    created_at: lead.createdAt,
    last_contacted_at: lead.lastContactedAt,
    assigned_to: lead.assignedTo,
    source: lead.source,
    property_reference: lead.propertyReference,
    budget: lead.budget,
    budget_min: lead.budgetMin,
    currency: lead.currency || 'EUR',
    desired_location: lead.desiredLocation,
    property_type: lead.propertyType,
    property_types: lead.propertyTypes || [],
    bedrooms: bedroomsForDb,
    views: lead.views || [],
    amenities: lead.amenities || [],
    purchase_timeframe: lead.purchaseTimeframe,
    financing_method: lead.financingMethod,
    property_use: lead.propertyUse,
    nationality: lead.nationality,
    task_type: lead.taskType,
    notes: lead.notes,
    next_follow_up_date: lead.nextFollowUpDate,
    country: lead.country,
    url: lead.url,
    pipeline_type: lead.pipelineType || lead.pipeline_type,
    integration_source: lead.integration_source,
    tax_residence: lead.taxResidence,
    living_area: lead.livingArea,
    external_id: lead.external_id
    // Deliberately omitting action_history as it doesn't exist in the database
  };
};

export const convertToSimpleLead = (lead: LeadDetailed) => {
  return {
    id: lead.id,
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    status: lead.status || 'New',
    source: lead.source || undefined,
    createdAt: lead.createdAt || new Date().toISOString(),
    budget: lead.budget || undefined,
    location: lead.location || undefined,
    tags: lead.tags || []
  };
};

export const createEmptyAction = (): ActionHistory => {
  return {
    id: crypto.randomUUID(),
    actionType: 'Call' as TaskType,
    createdAt: new Date().toISOString(),
    scheduledDate: new Date().toISOString(),
    completedDate: undefined,
    notes: '',
  };
};

// Fix the currencyValue null error with proper null checking
export const formatBudget = (min?: string | null, max?: string | null, currency?: string | null): string | undefined => {
  if (!min && !max) return undefined;
  
  const formatValue = (value: string | null | undefined): string => {
    if (!value) return '';
    
    // Remove non-numeric characters
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) return '';
    
    // Format with commas or spaces for thousands
    const currencyValue = parseInt(numericValue, 10);
    if (currencyValue === null || isNaN(currencyValue)) return '';
    return currencyValue.toLocaleString('fr-FR');
  };
  
  const formattedMin = formatValue(min);
  const formattedMax = formatValue(max);
  const currencySymbol = currency || '€';
  
  if (formattedMin && formattedMax) {
    return `${formattedMin} - ${formattedMax} ${currencySymbol}`;
  } else if (formattedMin) {
    return `${formattedMin} ${currencySymbol}`;
  } else if (formattedMax) {
    return `${formattedMax} ${currencySymbol}`;
  }
  
  return undefined;
};

export const formatLeadName = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return 'Client sans nom';
  return `${firstName || ''} ${lastName || ''}`.trim();
};

export const getInitials = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return 'CL';
  
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  return `${firstInitial}${lastInitial}` || 'CL';
};
