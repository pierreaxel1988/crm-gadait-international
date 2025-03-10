
export interface Property {
  id: string;
  external_id: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  location?: string;
  country?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  area_unit?: string;
  features?: string[];
  amenities?: string[];
  images?: string[];
  url?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertySelection {
  id: string;
  name: string;
  lead_id: string;
  created_by?: string;
  properties: string[];
  status: 'draft' | 'sent' | 'viewed';
  link_token: string;
  email_sent_at?: string;
  email_opened_at?: string;
  link_visited_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyFilter {
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  country?: string;
  property_type?: string;
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  features?: string[];
  amenities?: string[];
}
