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
  | "Chalet"
  | "Maison"
  | "Duplex"
  | "Terrain" 
  | "Manoir"
  | "Maison de ville"
  | "Château"
  | "Local commercial";

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
  residenceCountry?: string;
  
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
  
  // Owner-specific fields - now unified in leads table
  desired_price?: string;
  fees?: string;
  commission_ht?: string;
  relationship_status?: string;
  mandate_type?: string;
  specific_needs?: string;
  attention_points?: string;
  relationship_details?: string;
  first_contact_date?: string;
  last_contact_date?: string;
  next_action_date?: string;
  contact_source?: string;

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
  
  // Nouvel ajout pour compatibilité avec le champ email_envoye de la base de données
  email_envoye?: boolean;
  
  // Nouveau champ Google Drive
  google_drive_link?: string;

  // Nouveau champ pour indiquer si une rénovation est nécessaire (pour les propriétaires)
  renovation_needed?: boolean;

  // Soft delete fields (for admin interface)
  deleted_at?: string | null;
  deleted_by?: string | null;
  deletion_reason?: string | null;
  deleted_by_member?: {
    name: string;
    email: string;
  } | null;
}
