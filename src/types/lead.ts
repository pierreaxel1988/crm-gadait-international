
import { LeadStatus } from "@/components/common/StatusBadge";
import { LeadTag } from "@/components/common/TagBadge";
import { TaskType } from "@/components/kanban/KanbanCard";
import { ActionHistory } from "@/services/leadService";

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
  | "Croatia"
  | "France"
  | "Greece"
  | "Maldives"
  | "Mauritius"
  | "Portugal"
  | "Seychelles"
  | "Spain"
  | "Switzerland"
  | "United Arab Emirates"
  | "United Kingdom"
  | "United States";

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
  email: string;
  phone?: string;
  location?: string;
  status: LeadStatus;
  tags: LeadTag[];
  assignedTo?: string;
  createdAt: string;
  lastContactedAt?: string;
  source?: LeadSource;
  propertyReference?: string;
  budget?: string;
  desiredLocation?: string;
  propertyType?: PropertyType;
  livingArea?: string;
  bedrooms?: number;
  views?: ViewType[];
  amenities?: Amenity[];
  purchaseTimeframe?: PurchaseTimeframe;
  financingMethod?: FinancingMethod;
  propertyUse?: PropertyUse;
  nationality?: string;
  taxResidence?: string;
  nextFollowUpDate?: string;
  notes?: string;
  taskType?: TaskType;
  country?: Country;
  actionHistory?: ActionHistory[];
  // Nouveaux champs pour l'API d'importation
  integration_source?: string;
  external_id?: string;
  raw_data?: any;
  imported_at?: string;
  // Champ URL pour l'annonce immobilière
  url?: string;
  // Ajout explicite du champ pipelineType
  pipelineType?: PipelineType;
}
