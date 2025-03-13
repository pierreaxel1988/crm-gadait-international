
/**
 * Type definitions for email parsing functionality
 */

// Définition des types pour le résultat du parsing
export interface ParsedLeadData {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  portal_name?: string;
  source?: string;
  property_reference?: string;
  desired_location?: string;
  budget?: string;
  property_type?: string;
  living_area?: string;
  bedrooms?: number;
  message?: string;
  integration_source: string;
  // Champs supplémentaires
  external_id?: string;
  property_use?: string;
  financing_method?: string;
  purchase_timeframe?: string;
  views?: string[];
  amenities?: string[];
  raw_content?: string;
  [key: string]: any; // Pour les champs supplémentaires non typés
}

// Formats de portails connus
export enum PortalType {
  FIGARO = 'Le Figaro',
  PROPERSTAR = 'Properstar',
  PROPERTY_CLOUD = 'Property Cloud',
  IDEALISTA = 'Idealista',
  SELOGER = 'SeLoger',
  LUXURY_ESTATE = "L'express Property",
  JAMESEDITION = 'JamesEdition',
  BELLESDEMEURES = 'Belles Demeures',
  GENERIC = 'Generic'
}
