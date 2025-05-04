
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ExtractedData {
  [key: string]: any;
  nationality?: string;
  preferredLanguage?: string;
}

export interface TeamMember {
  id: string;
  name: string;
}

export interface PropertyDetails {
  reference?: string;
  type?: string;
  location?: string;
  country?: string;
  price?: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  url?: string;
  description?: string;
  nationality?: string;
  propertyType?: string;
  preferredLanguage?: string;
}
