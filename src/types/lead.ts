
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

export type Country = 
  | 'France' 
  | 'Spain' 
  | 'Portugal' 
  | 'Greece' 
  | 'Switzerland' 
  | 'United Kingdom' 
  | 'United States' 
  | 'Croatia' 
  | 'Mauritius' 
  | 'Seychelles' 
  | 'Maldives' 
  | 'United Arab Emirates'
  | string; // Adding string to make it more flexible

export type ViewType = 
  | "Mer" 
  | "Montagne" 
  | "Golf" 
  | "Autres";

export type Amenity = 
  | "Piscine" 
  | "Jardin" 
  | "Garage" 
  | "Sécurité";

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

// Import these from their respective modules to re-export them
import type { LeadStatus } from "@/components/common/StatusBadge";
import type { LeadTag } from "@/components/common/TagBadge";
import type { TaskType } from "@/components/kanban/KanbanCard";

// Re-export these types so they can be imported from lead.ts
export type { LeadStatus, LeadTag, TaskType };

export interface LeadDetailed {
  id: string;
  name: string;
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
  desiredLocation?: string;
  propertyType?: string;
  bedrooms?: number;
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
  pipeline_type?: PipelineType; // Adding this to match the database field name
  
  // Other properties
  imported_at?: string;
  integration_source?: string;
  taxResidence?: string;
  actionHistory?: any[];
  livingArea?: string;
  external_id?: string;
}
