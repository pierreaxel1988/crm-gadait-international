
import { TaskType, ActionHistory } from '@/types/actionHistory';

// Re-export using the correct syntax for isolated modules
export type { TaskType, ActionHistory };

export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposition'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'Inactive';

export type LeadTag = 
  | 'Hot'
  | 'Warm'
  | 'Cold'
  | 'VIP'
  | 'Urgent'
  | 'Needs Follow-up'
  | 'Ready to Buy'
  | 'Long Term'
  | 'Imported'
  | 'Referred';

export type PipelineType = 'Buyer' | 'Renter' | 'Seller' | 'Landlord';

export type PropertyType = 
  | 'Apartment'
  | 'House'
  | 'Villa'
  | 'Land'
  | 'Commercial'
  | 'Building'
  | 'Penthouse'
  | 'Duplex';

export type CountryCode = '+230' | '+33' | '+44' | '+1' | '+49' | '+61' | '+32' | string;

export type ViewType = 
  | 'Mountain'
  | 'Ocean'
  | 'Garden'
  | 'City'
  | 'Lake'
  | 'River'
  | 'Golf';

export type MauritiusRegion = 
  | 'North'
  | 'South'
  | 'East'
  | 'West'
  | 'Central';

export interface Note {
  id: string;
  content: string;
  timestamp: string;
  author: string;
}

export type LeadSource = 
  | 'Website'
  | 'Direct call'
  | 'Email'
  | 'Referral'
  | 'Social media'
  | 'Property portal'
  | 'Walk-in';

export interface LeadDetailed {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: CountryCode;
  phoneCountryCodeDisplay?: string;
  preferredLanguage?: string | null;
  leadSource?: LeadSource;
  lastContactedAt?: string;
  nextFollowUpDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: LeadStatus;
  tags?: LeadTag[];
  pipelineType?: PipelineType;
  assignedTo?: string;
  taskType?: TaskType;
  propertyType?: PropertyType[];
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  location?: string[];
  bedrooms?: number;
  bathrooms?: number;
  searchAreas?: MauritiusRegion[];
  view?: ViewType[];
  landSize?: number;
  buildingSize?: number;
  isOwner?: boolean;
  propertyAddress?: string;
  propertyDescription?: string;
  askingPrice?: number;
  propertyFeatures?: string[];
  actionHistory?: ActionHistory[];
  importSource?: string;
  importDate?: string;
  importId?: string;
  importConfidence?: number;
}
