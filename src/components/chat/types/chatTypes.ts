
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PropertyDetails {
  reference?: string;
  url?: string;
  type?: string;
  location?: string;
  country?: string;
  price?: string;
  area?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  [key: string]: any; // Allow for arbitrary properties
}

export interface ExtractedData {
  name?: string;
  email?: string;
  phone?: string;
  budget?: string;
  source?: string;
  reference?: string;
  desiredLocation?: string;
  propertyType?: string;
  country?: string;
  livingArea?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  purchaseTimeframe?: string;
  financingMethod?: string;
  propertyUse?: string;
  nationality?: string;
  taxResidence?: string;
  [key: string]: any; // Allow for arbitrary properties
}
