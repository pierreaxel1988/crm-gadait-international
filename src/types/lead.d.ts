
export type LeadStatus =
  | 'New'              // Premier contact / Nouveaux
  | 'Contacted'        // Rendez-vous programmé / Contactés
  | 'Qualified'        // Visite effectuée / Qualifiés
  | 'Proposal'         // Mandat en négociation / Propositions
  | 'Visit'            // Bien en commercialisation / Visites en cours
  | 'Offre'            // Offre reçue (for both purchase and rental)
  | 'Deposit'          // Compromis signé / Dépôt reçu
  | 'Signed'           // Mandat signé / Signature finale
  | 'Gagné'            // Vente finalisée / Conclus
  | 'Perdu';           // Perdu/Annulé / Perdu

export type PipelineType = 'purchase' | 'rental' | 'owners';

export type PropertyType = 
  | 'apartment'
  | 'house'
  | 'villa'
  | 'land'
  | 'commercial'
  | 'office'
  | 'warehouse'
  | 'parking'
  | 'other';

export type PurchaseTimeframe =
  | 'immediate'
  | '1-3_months'
  | '3-6_months'
  | '6-12_months'
  | 'no_rush';

export type Currency = 'EUR' | 'USD' | 'CHF' | 'MUR' | 'GBP';

export type MauritiusRegion =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'central';

export interface LeadAction {
  id: string;
  leadId: string;
  actionType: string;
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
