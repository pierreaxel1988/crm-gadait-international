
/**
 * Types for email parsing functionality
 */

export enum PortalType {
  FIGARO = "Le Figaro",
  IDEALISTA = "Idealista",
  PROPERSTAR = "Properstar",
  PROPERTY_CLOUD = "Property Cloud",
  SELOGER = "SeLoger",
  LUXURY_ESTATE = "Luxury Estate",
  JAMESEDITION = "JamesEdition",
  BELLESDEMEURES = "Belles Demeures",
  GENERIC = "Format Inconnu"
}

export interface ParsedLeadData {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  property_reference?: string;
  external_id?: string;
  integration_source: string;
  portal_name?: PortalType;
  source?: string;
  property_type?: string;
  raw_content?: string;
  [key: string]: any;
}
