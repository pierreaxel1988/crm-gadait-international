
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
  | "L'express Property";

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

// Change Amenity type to a string for flexibility
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
  | "rental";

export type Currency =
  | "EUR"
  | "USD"
  | "GBP"
  | "CHF"
  | "AED"
  | "MUR";

// Import and re-export these types
import { LeadStatus } from "@/components/common/StatusBadge";
import { LeadTag } from "@/components/common/TagBadge";
import { TaskType } from "@/components/kanban/KanbanCard";

export type { LeadStatus, LeadTag, TaskType };

export interface LeadDetailed {
  id: string;
  name: string;
  salutation?: 'M.' | 'Mme';  // New field for "Civilité"
  email?: string;
  phone?: string;
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
  taskType?: TaskType;
  notes?: string;
  nextFollowUpDate?: string;
  country?: Country;
  url?: string;
  pipelineType?: PipelineType;
  pipeline_type?: PipelineType;
  
  imported_at?: string;
  integration_source?: string;
  taxResidence?: string;
  actionHistory?: any[];
  livingArea?: string;
  external_id?: string;
}
