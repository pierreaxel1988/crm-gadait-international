
import { TaskType } from '@/components/kanban/KanbanCard';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal'
  | 'Visit'
  | 'Offre'
  | 'Deposit'
  | 'Signed'
  | 'Gagné'
  | 'Perdu';

export type PropertyType =
  | 'Villa'
  | 'Apartment'
  | 'House'
  | 'Land'
  | 'Other';

export type PipelineType =
  | 'purchase'
  | 'rental'
  | 'owners';

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

// Types additionnels nécessaires pour la compatibilité
export type LeadSource = 
  | 'Website'
  | 'Referral'
  | 'Social Media'
  | 'Advertisement'
  | 'Direct Contact'
  | 'Other';

export type Country = string;

export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'MUR';

export type ViewType = 
  | 'Sea view'
  | 'Mountain view'
  | 'Garden view'
  | 'City view'
  | 'Pool view';

export type Amenity = 
  | 'Pool'
  | 'Gym'
  | 'Parking'
  | 'Garden'
  | 'Terrace'
  | 'Balcony';

export type PurchaseTimeframe = 
  | 'Immediately'
  | 'Within 3 months'
  | 'Within 6 months'
  | 'Within 1 year'
  | 'No rush';

export type FinancingMethod = 
  | 'Cash'
  | 'Mortgage'
  | 'Mixed'
  | 'Other';

export type PropertyUse = 
  | 'Primary residence'
  | 'Secondary residence'
  | 'Investment'
  | 'Commercial';

export type MauritiusRegion = 
  | 'North'
  | 'South'
  | 'East'
  | 'West'
  | 'Central';

export interface LeadDetailed {
  id: string;
  name: string;
  salutation?: string;
  email: string;
  phone: string;
  phoneCountryCode?: string;
  phoneCountryCodeDisplay?: string;
  location: string;
  status: LeadStatus;
  tags: string[];
  createdAt: string;
  lastContactedAt?: string;
  assignedTo?: string;
  source?: string;
  propertyReference?: string;
  budget?: string;
  budgetMin?: string;
  currency?: string;
  desiredLocation?: string;
  propertyType?: PropertyType;
  propertyTypes?: PropertyType[];
  bedrooms?: number | number[];
  views?: string[];
  amenities?: string[];
  purchaseTimeframe?: string;
  financingMethod?: string;
  propertyUse?: string;
  nationality?: string;
  taxResidence?: string;
  preferredLanguage?: string;
  taskType?: TaskType;
  notes: string;
  nextFollowUpDate?: string;
  country?: string;
  url?: string;
  pipelineType?: PipelineType;
  pipeline_type?: PipelineType;
  imported_at?: string;
  integration_source?: string;
  actionHistory?: ActionHistory[];
  livingArea?: string;
  external_id?: string;
  regions?: string[];
  landArea?: string;
  orientation?: string[];
  email_envoye?: boolean;
  raw_data?: any;
  mapCoordinates?: { lat: number; lng: number };
  
  // Additional property fields for owners pipeline
  constructionYear?: string;
  parkingSpaces?: number;
  floors?: number;
  energyClass?: string;
  yearlyTaxes?: string;
  propertyDescription?: string;
  keyFeatures?: string[];
  equipment?: Equipment[];
  condoFees?: string;
  facilities?: string[];
  renovationNeeded?: string;
  assets?: AssetType[];
  bathrooms?: number;
  propertyState?: PropertyState;
  exposure?: string;
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
}

export interface ActionHistory {
  id: string;
  actionType: TaskType;
  createdAt: string;
  scheduledDate: string;
  completedDate?: string;
  notes: string;
}
