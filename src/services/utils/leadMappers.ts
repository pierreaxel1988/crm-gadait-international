import { LeadDetailed, LeadStatus, PropertyType } from '@/types/lead';
import { ActionHistory } from '@/types/actionHistory';
import { TaskType } from '@/components/kanban/KanbanCard';

export const mapToLeadDetailed = (lead: any): LeadDetailed => {
  // Parse and validate action history
  let actionHistory: ActionHistory[] = [];
  try {
    if (lead.action_history) {
      // Handle both string and object formats
      if (typeof lead.action_history === 'string') {
        actionHistory = JSON.parse(lead.action_history);
      } else {
        actionHistory = lead.action_history;
      }
    }
    
    // Ensure it's an array
    if (!Array.isArray(actionHistory)) {
      actionHistory = [];
      console.warn('Invalid action history format - reset to empty array');
    }
  } catch (error) {
    console.error('Error parsing action_history:', error);
    actionHistory = [];
  }

  // Handle bedrooms conversion from database
  let bedrooms;
  if (lead.raw_data && lead.raw_data.bedroom_values) {
    // If we have stored bedroom values in raw_data, use those (for multiple selections)
    try {
      bedrooms = JSON.parse(lead.raw_data.bedroom_values);
    } catch (e) {
      console.error('Error parsing bedroom_values:', e);
      bedrooms = lead.bedrooms ? [lead.bedrooms] : [];
    }
  } else if (Array.isArray(lead.bedrooms)) {
    bedrooms = lead.bedrooms;
  } else if (lead.bedrooms !== null && lead.bedrooms !== undefined) {
    // Convert single value to array for consistency in UI
    bedrooms = [lead.bedrooms];
  }

  return {
    id: lead.id || '',
    name: lead.name || '',
    salutation: lead.salutation,
    email: lead.email || '',
    phone: lead.phone || '',
    phoneCountryCode: lead.phone_country_code || '+33',
    phoneCountryCodeDisplay: lead.phone_country_code_display || '🇫🇷',
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
    bedrooms: lead.bedrooms,
    views: lead.views,
    amenities: lead.amenities || [],
    purchaseTimeframe: lead.purchase_timeframe,
    financingMethod: lead.financing_method,
    propertyUse: lead.property_use,
    nationality: lead.nationality,
    taxResidence: lead.tax_residence,
    preferredLanguage: lead.preferred_language,
    taskType: lead.task_type,
    notes: lead.notes || '',
    nextFollowUpDate: lead.next_follow_up_date,
    country: lead.country,
    url: lead.url,
    pipelineType: lead.pipeline_type,
    pipeline_type: lead.pipeline_type,
    imported_at: lead.imported_at,
    integration_source: lead.integration_source,
    actionHistory: lead.action_history || [],
    livingArea: lead.living_area,
    external_id: lead.external_id,
    regions: lead.regions || [],
    facilities: lead.facilities || [],
    keyFeatures: lead.key_features || [],
    propertyDescription: lead.property_description || '',
    renovationNeeded: lead.renovation_needed || '',
    condoFees: lead.condo_fees || '',
    energyClass: lead.energy_class || '',
    equipment: lead.equipment || [],
    floors: lead.floors,
    landArea: lead.land_area || '',
    orientation: lead.orientation || [],
    parkingSpaces: lead.parking_spaces,
    constructionYear: lead.construction_year || '',
    yearlyTaxes: lead.yearly_taxes || '',
    assets: lead.assets || [],
    email_envoye: lead.email_envoye || false // Ajout du champ email_envoye
  };
};

export const mapToSupabaseFormat = (lead: LeadDetailed): any => {
  // Handle bedroom data for database storage
  let bedroomsForDb = null;
  if (Array.isArray(lead.bedrooms)) {
    // If only one bedroom is selected, store as a single integer
    if (lead.bedrooms.length === 1) {
      bedroomsForDb = lead.bedrooms[0];
    } else if (lead.bedrooms.length > 1) {
      // Store the first value for now, we'll handle multiple in updateLead
      bedroomsForDb = lead.bedrooms.length > 0 ? lead.bedrooms[0] : null;
    }
  } else if (lead.bedrooms !== undefined && lead.bedrooms !== null) {
    // Handle non-array value
    bedroomsForDb = lead.bedrooms;
  }
  
  // Ensure action history is properly formatted
  let actionHistoryForDb = [];
  if (Array.isArray(lead.actionHistory)) {
    actionHistoryForDb = lead.actionHistory.map(action => ({
      ...action,
      // Ensure each action has all required fields
      id: action.id || crypto.randomUUID(),
      createdAt: action.createdAt || new Date().toISOString(),
      scheduledDate: action.scheduledDate || new Date().toISOString(),
      actionType: action.actionType || 'Note'
    }));
  }
  
  return {
    id: lead.id,
    name: lead.name,
    salutation: lead.salutation,
    email: lead.email,
    phone: lead.phone,
    phone_country_code: lead.phoneCountryCode,
    phone_country_code_display: lead.phoneCountryCodeDisplay,
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
    preferred_language: lead.preferredLanguage,
    living_area: lead.livingArea,
    external_id: lead.external_id,
    action_history: lead.actionHistory,
    regions: lead.regions || [],
    email_envoye: lead.email_envoye || false // Ajout du champ email_envoye
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
