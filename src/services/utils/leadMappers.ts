import { Lead, LeadDetailed, LeadStatus, PropertyType } from '@/types/lead';
import { ActionHistory } from '@/types/actionHistory';
import { TaskType } from '@/components/kanban/KanbanCard';

export const mapLeadToDetailed = (lead: Lead): LeadDetailed => {
  return {
    ...lead,
    id: lead.id || '',
    firstName: lead.firstName || '',
    lastName: lead.lastName || '',
    email: lead.email || '',
    phone: lead.phone || '',
    source: lead.source || '',
    status: lead.status || LeadStatus.NEW,
    assignedTo: lead.assignedTo || '',
    createdAt: lead.createdAt || new Date().toISOString(),
    updatedAt: lead.updatedAt || new Date().toISOString(),
    notes: lead.notes || '',
    budget: lead.budget || '',
    nationality: lead.nationality || '',
    language: lead.language || '',
    propertyType: lead.propertyType || PropertyType.APARTMENT,
    bedrooms: lead.bedrooms || '',
    bathrooms: lead.bathrooms || '',
    location: lead.location || '',
    area: lead.area || '',
    amenities: lead.amenities || [],
    taskType: lead.taskType || undefined,
    nextFollowUpDate: lead.nextFollowUpDate || undefined,
    actionHistory: lead.actionHistory || [],
  };
};

export const mapDetailedToLead = (leadDetailed: LeadDetailed): Lead => {
  return {
    id: leadDetailed.id,
    firstName: leadDetailed.firstName,
    lastName: leadDetailed.lastName,
    email: leadDetailed.email,
    phone: leadDetailed.phone,
    source: leadDetailed.source,
    status: leadDetailed.status,
    assignedTo: leadDetailed.assignedTo,
    createdAt: leadDetailed.createdAt,
    updatedAt: leadDetailed.updatedAt,
    notes: leadDetailed.notes,
    budget: leadDetailed.budget,
    nationality: leadDetailed.nationality,
    language: leadDetailed.language,
    propertyType: leadDetailed.propertyType,
    bedrooms: leadDetailed.bedrooms,
    bathrooms: leadDetailed.bathrooms,
    location: leadDetailed.location,
    area: leadDetailed.area,
    amenities: leadDetailed.amenities,
    taskType: leadDetailed.taskType,
    nextFollowUpDate: leadDetailed.nextFollowUpDate,
    actionHistory: leadDetailed.actionHistory,
  };
};

export const createEmptyLead = (): LeadDetailed => {
  return {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: '',
    status: LeadStatus.NEW,
    assignedTo: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: '',
    budget: '',
    nationality: '',
    language: '',
    propertyType: PropertyType.APARTMENT,
    bedrooms: '',
    bathrooms: '',
    location: '',
    area: '',
    amenities: [],
    actionHistory: [],
  };
};

export const createEmptyAction = (): ActionHistory => {
  return {
    id: '',
    actionType: TaskType.CALL,
    createdAt: new Date().toISOString(),
    scheduledDate: new Date().toISOString(),
    completedDate: undefined,
    notes: '',
  };
};

// Fix the currencyValue null error with proper null checking
const formatBudget = (min?: string | null, max?: string | null, currency?: string | null): string | undefined => {
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
