import { LeadStatus } from "@/components/common/StatusBadge";
import { LeadTag } from "@/components/common/TagBadge";
import { TaskType } from "@/components/kanban/KanbanCard";

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
  | 'United Arab Emirates';

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
  external_id?: string;
  
  // Other properties
  imported_at?: string;
  integration_source?: string;
  taxResidence?: string;
  actionHistory?: any[];
  livingArea?: string;
}
