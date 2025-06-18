export type LeadSource = 
  | "Site web" 
  | "Réseaux sociaux" 
  | "Portails immobiliers" 
  | "Network" 
  | "Repeaters" 
  | "Recommandations"
  | "Apporteur d'affaire"
  | "Idealista"
  | "Le Figaro"
  | "Properstar"
  | "Property Cloud"
  | "L'express Property"
  | "James Edition"
  | "Annonce"
  | "Email"
  | "Téléphone"
  | "Autre"
  | "Recommendation";

export type PropertyType = 
  | "Villa" 
  | "Appartement" 
  | "Penthouse" 
  | "Maison"
  | "Duplex"
  | "Chalet"
  | "Terrain" 
  | "Manoir"
  | "Maison de ville"
  | "Château"
  | "Local commercial"
  | "Commercial" 
  | "Hotel" 
  | "Vignoble" 
  | "Autres";

export type Country = string;

export type ViewType = 
  | "Mer" 
  | "Montagne" 
  | "Golf" 
  | "Autres";

export type Amenity = string;

export type PurchaseTimeframe = 
  | "Moins de trois mois" 
  | "Plus de trois mois";
  
export type FinancingMethod = 
  | "Cash" 
  | "Prêt bancaire";

export type PropertyUse = 
  | "Investissement locatif" 
  | "Résidence principale";

export type PipelineType = 
  | "purchase" 
  | "rental"
  | "owners";

export type Currency =
  | "EUR"
  | "USD"
  | "GBP"
  | "CHF"
  | "AED"
  | "MUR";

export type MauritiusRegion = 'North' | 'South' | 'West' | 'East';

export type AssetType = 
  | "Vue mer"
  | "Vue panoramique"
  | "Bord de mer"
  | "Front de mer"
  | "Domaine de chasse"
  | "Écurie"
  | "Bien d'architecte"
  | "Style contemporain"
  | "Monument classé"
  | "Court de tennis"
  | "Pied des pistes"
  | "Proche montagne"
  | "Proche aéroport"
  | "Proche gare"
  | "Proche golf";

export type Equipment = 
  | "Piscine"
  | "Ascenseur"
  | "Garage & Parking"
  | "Climatisation"
  | "Salle de réception"
  | "Dépendances"
  | "Loge gardien"
  | "Spa"
  | "Viager"
  | "Terrasse"
  | "Jardin"
  | "Meublé"
  | "Cheminée"
  | "Maison d'amis"
  | "Bâtiments agricoles"
  | "Chambre de bonne"
  | "Accessible aux handicapés";

export type PropertyState =
  | "Neuf"
  | "Bon état"
  | "À rafraîchir" 
  | "À rénover"
  | "À reconstruire";

import { LeadStatus } from "@/components/common/StatusBadge";
import { LeadTag } from "@/components/common/TagBadge";
import { TaskType } from "@/components/kanban/KanbanCard";

export type { LeadStatus, LeadTag, TaskType };

// Interface mise à jour pour les propriétaires avec tous les champs nécessaires
export interface Owner {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  nationality?: string;
  tax_residence?: string;
  preferred_language?: string;
  assigned_to?: string;
  first_contact_date?: string;
  contact_source?: string;
  last_contact_date?: string;
  relationship_status?: string;
  mandate_type?: string;
  next_action_date?: string;
  specific_needs?: string;
  attention_points?: string;
  relationship_details?: string;
  created_at: string;
  updated_at: string;
  
  // Nouveaux champs pour l'onglet "Infos"
  salutation?: 'M.' | 'Mme';
  source?: LeadSource;
  property_reference?: string;
  url?: string;
  tags?: LeadTag[];
  regions?: MauritiusRegion[];
  last_contacted_at?: string;
  integration_source?: string;
  imported_at?: string;
  external_id?: string;
  
  // Nouveaux champs pour l'onglet "Statut"
  status?: string;
  task_type?: string;
  next_follow_up_date?: string;
  
  // Nouveaux champs pour l'onglet "Notes"
  notes?: string;
  internal_notes?: string;
  
  // Nouveaux champs pour l'onglet "Actions"
  action_history?: any[];
  
  // Champs de mobilier
  furnished?: boolean;
  furniture_included_in_price?: boolean;
  furniture_price?: string;
  
  // Champs de prix
  desired_price?: string;
  fees?: string;
  currency?: Currency;
  
  // Champs de localisation
  country?: string;
  location?: string;
  desired_location?: string;
  map_coordinates?: string;
  
  // Champs de propriété
  property_type?: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  living_area?: string;
  land_area?: string;
  construction_year?: string;
  property_state?: PropertyState;
  property_description?: string;
  assets?: AssetType[];
  equipment?: Equipment[];
  
  // Nouveaux champs d'optimisation
  mandate_start_date?: string;
  mandate_end_date?: string;
  mandate_conditions?: string;
  is_furniture_relevant?: boolean;
  price_validation_status?: string;
  last_price_update?: string;
}

export interface LeadDetailed {
  id: string;
  name: string;
  salutation?: 'M.' | 'Mme';
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  phoneCountryCodeDisplay?: string;
  location?: string;
  status: LeadStatus;
  tags?: LeadTag[];
  createdAt: string;
  lastContactedAt?: string;
  assignedTo?: string;
  source?: LeadSource;
  propertyReference?: string;
  budget?: string;
  budgetMin?: string;
  currency?: Currency;
  desiredLocation?: string;
  propertyType?: string;
  propertyTypes?: PropertyType[];
  bedrooms?: number | number[];
  views?: string[];
  amenities?: string[];
  purchaseTimeframe?: string;
  financingMethod?: string;
  propertyUse?: string;
  nationality?: string;
  preferredLanguage?: string;
  taskType?: TaskType;
  notes?: string;
  internal_notes?: string; 
  nextFollowUpDate?: string;
  country?: Country;
  url?: string;
  pipelineType?: PipelineType;
  pipeline_type?: PipelineType;
  taxResidence?: string;
  regions?: MauritiusRegion[];
  
  imported_at?: string;
  integration_source?: string;
  actionHistory?: any[];
  livingArea?: string;
  external_id?: string;
  
  // Property details for owners
  landArea?: string;
  constructionYear?: string;
  renovationNeeded?: string;
  propertyDescription?: string;
  keyFeatures?: string[];
  condoFees?: string;
  facilities?: string[];
  
  // Additional owner-specific fields
  parkingSpaces?: number;
  floors?: number;
  orientation?: string[];
  energyClass?: string;
  yearlyTaxes?: string;
  
  // Add the assets field
  assets?: AssetType[];
  
  // Add the equipment field
  equipment?: Equipment[];
  
  // Nouveaux champs pour les propriétaires
  desired_price?: string;
  fees?: string;

  // Nouveaux champs pour le luxe immobilier
  bathrooms?: number;
  propertyState?: PropertyState;
  hasTerrace?: boolean;
  hasBalcony?: boolean;
  hasGarden?: boolean;
  terrace_size?: string;
  garden_size?: string;
  luxuryAmenities?: string[];
  buildingMaterials?: string[];
  architecturalStyle?: string;
  staffAccommodation?: string;
  receptionCapacity?: string;
  sportFacilities?: string;
  securityFeatures?: string[];
  homeAutomation?: string;
  heatingSystem?: string;
  ecoFeatures?: string[];
  hasAccessibility?: boolean;
  dependencies?: string;
  neighborhood?: string;
  extensionPotential?: string;
  historicalFeatures?: string;
  restrictions?: string;
  includedServices?: string;
  nuisances?: string;
  roofType?: string;
  hasWineStorage?: boolean;
  wineStorageCapacity?: string;
  accessibility?: string;
  exposure?: string;
  mapCoordinates?: string;
  
  // Owner-specific fields from the owners table
  furnished?: boolean;
  furniture_included_in_price?: boolean;
  furniture_price?: string;
  specific_needs?: string;
  attention_points?: string;
  relationship_details?: string;
  
  // Nouvel ajout pour compatibilité avec le champ email_envoye de la base de données
  email_envoye?: boolean;
}
