
import { supabase } from '@/integrations/supabase/client';
import type { LeadDetailed } from '@/types/lead';

interface PropertyMatch {
  id: string;
  title: string;
  price?: number;
  location?: string;
  country?: string;
  property_type?: string;
  bedrooms?: number;
  main_image?: string;
  url: string;
  score: number;
  reasons: string[];
  matchType: 'perfect' | 'excellent' | 'good' | 'potential';
}

interface MatchingCriteria {
  budget?: { min: number; max: number; currency: string };
  location?: string;
  country?: string;
  propertyTypes?: string[];
  bedrooms?: number[];
  views?: string[];
  amenities?: string[];
}

export class AIMatchingEngine {
  private static instance: AIMatchingEngine;
  
  public static getInstance(): AIMatchingEngine {
    if (!AIMatchingEngine.instance) {
      AIMatchingEngine.instance = new AIMatchingEngine();
    }
    return AIMatchingEngine.instance;
  }

  // Analyser un lead et extraire les critères avec l'IA
  async analyzeLead(lead: LeadDetailed): Promise<MatchingCriteria> {
    const criteria: MatchingCriteria = {};

    // Budget analysis
    if (lead.budget || lead.budgetMin) {
      const maxBudget = this.parseBudget(lead.budget);
      const minBudget = this.parseBudget(lead.budgetMin);
      
      if (maxBudget || minBudget) {
        criteria.budget = {
          min: minBudget || 0,
          max: maxBudget || 50000000,
          currency: lead.currency || 'EUR'
        };
      }
    }

    // Location preferences
    if (lead.desiredLocation) {
      criteria.location = lead.desiredLocation;
    }
    if (lead.country) {
      criteria.country = lead.country;
    }

    // Property type preferences
    if (lead.propertyTypes && lead.propertyTypes.length > 0) {
      criteria.propertyTypes = lead.propertyTypes;
    } else if (lead.propertyType) {
      criteria.propertyTypes = [lead.propertyType];
    }

    // Bedroom requirements
    if (lead.bedrooms) {
      if (Array.isArray(lead.bedrooms)) {
        criteria.bedrooms = lead.bedrooms;
      } else {
        criteria.bedrooms = [lead.bedrooms];
      }
    }

    // Views and amenities
    if (lead.views && lead.views.length > 0) {
      criteria.views = lead.views;
    }
    if (lead.amenities && lead.amenities.length > 0) {
      criteria.amenities = lead.amenities;
    }

    return criteria;
  }

  // Trouver les meilleures propriétés pour un lead
  async findMatches(lead: LeadDetailed, limit: number = 10): Promise<PropertyMatch[]> {
    console.log(`🎯 Recherche de matches pour ${lead.name}...`);
    
    try {
      // Analyser les critères du lead
      const criteria = await this.analyzeLead(lead);
      console.log('Critères analysés:', criteria);

      // Récupérer toutes les propriétés disponibles
      const { data: properties, error } = await supabase
        .from('gadait_properties')
        .select('*')
        .eq('is_available', true);

      if (error) {
        console.error('Erreur lors de la récupération des propriétés:', error);
        return [];
      }

      if (!properties || properties.length === 0) {
        console.log('Aucune propriété disponible');
        return [];
      }

      console.log(`Analyse de ${properties.length} propriétés...`);

      // Scorer chaque propriété
      const matches: PropertyMatch[] = [];
      
      for (const property of properties) {
        const match = this.scoreProperty(property, criteria);
        if (match.score > 0.3) { // Seuil minimum de pertinence
          matches.push(match);
        }
      }

      // Trier par score décroissant
      matches.sort((a, b) => b.score - a.score);

      console.log(`🎉 ${matches.length} matches trouvés pour ${lead.name}`);
      
      return matches.slice(0, limit);
    } catch (error) {
      console.error('Erreur dans findMatches:', error);
      return [];
    }
  }

  // Scorer une propriété par rapport aux critères
  private scoreProperty(property: any, criteria: MatchingCriteria): PropertyMatch {
    let score = 0;
    const reasons: string[] = [];
    const maxScore = 100;

    // Score budget (30% du score total)
    if (criteria.budget && property.price) {
      const price = typeof property.price === 'string' ? parseFloat(property.price) : property.price;
      if (price >= criteria.budget.min && price <= criteria.budget.max) {
        score += 30;
        reasons.push(`Prix dans le budget (${this.formatPrice(price, criteria.budget.currency)})`);
      } else if (price <= criteria.budget.max * 1.2) {
        score += 15;
        reasons.push(`Prix légèrement au-dessus du budget`);
      }
    }

    // Score localisation (25% du score total)
    if (criteria.country && property.country) {
      if (property.country.toLowerCase().includes(criteria.country.toLowerCase()) ||
          criteria.country.toLowerCase().includes(property.country.toLowerCase())) {
        score += 25;
        reasons.push(`Pays correspondant (${property.country})`);
      }
    }

    if (criteria.location && property.location) {
      if (property.location.toLowerCase().includes(criteria.location.toLowerCase()) ||
          criteria.location.toLowerCase().includes(property.location.toLowerCase())) {
        score += 15;
        reasons.push(`Localisation correspondante (${property.location})`);
      }
    }

    // Score type de propriété (20% du score total)
    if (criteria.propertyTypes && property.property_type) {
      const matches = criteria.propertyTypes.some(type => 
        property.property_type.toLowerCase().includes(type.toLowerCase()) ||
        type.toLowerCase().includes(property.property_type.toLowerCase())
      );
      if (matches) {
        score += 20;
        reasons.push(`Type de propriété correspondant (${property.property_type})`);
      }
    }

    // Score chambres (15% du score total)
    if (criteria.bedrooms && property.bedrooms) {
      if (criteria.bedrooms.includes(property.bedrooms)) {
        score += 15;
        reasons.push(`Nombre de chambres exact (${property.bedrooms})`);
      } else if (criteria.bedrooms.some(bed => Math.abs(bed - property.bedrooms) <= 1)) {
        score += 8;
        reasons.push(`Nombre de chambres proche (${property.bedrooms})`);
      }
    }

    // Score amenities et features (10% du score total)
    if (criteria.amenities && (property.amenities || property.features)) {
      const propertyFeatures = [...(property.amenities || []), ...(property.features || [])];
      const matchingAmenities = criteria.amenities.filter(amenity =>
        propertyFeatures.some(feature => 
          feature.toLowerCase().includes(amenity.toLowerCase()) ||
          amenity.toLowerCase().includes(feature.toLowerCase())
        )
      );
      
      if (matchingAmenities.length > 0) {
        score += Math.min(10, matchingAmenities.length * 3);
        reasons.push(`Commodités correspondantes (${matchingAmenities.join(', ')})`);
      }
    }

    // Déterminer le type de match
    let matchType: 'perfect' | 'excellent' | 'good' | 'potential';
    if (score >= 80) matchType = 'perfect';
    else if (score >= 65) matchType = 'excellent';
    else if (score >= 45) matchType = 'good';
    else matchType = 'potential';

    return {
      id: property.id,
      title: property.title,
      price: property.price,
      location: property.location,
      country: property.country,
      property_type: property.property_type,
      bedrooms: property.bedrooms,
      main_image: property.main_image,
      url: property.url,
      score: score / maxScore, // Normaliser entre 0 et 1
      reasons,
      matchType
    };
  }

  // Utilitaires
  private parseBudget(budget?: string): number | null {
    if (!budget) return null;
    
    // Nettoyer la chaîne et extraire les nombres
    const cleaned = budget.replace(/[^0-9.,]/g, '');
    const number = parseFloat(cleaned.replace(',', '.'));
    
    return isNaN(number) ? null : number;
  }

  private formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(price);
  }

  // Mapper les données de la base vers le format LeadDetailed
  private mapDatabaseLeadToDetailed(dbLead: any): LeadDetailed {
    return {
      id: dbLead.id,
      name: dbLead.name,
      email: dbLead.email,
      phone: dbLead.phone,
      location: dbLead.location,
      status: dbLead.status,
      tags: dbLead.tags || [],
      createdAt: dbLead.created_at,
      lastContactedAt: dbLead.last_contacted_at,
      assignedTo: dbLead.assigned_to,
      source: dbLead.source,
      propertyReference: dbLead.property_reference,
      budget: dbLead.budget,
      budgetMin: dbLead.budget_min,
      currency: dbLead.currency,
      desiredLocation: dbLead.desired_location,
      propertyType: dbLead.property_type,
      propertyTypes: dbLead.property_types || [],
      bedrooms: dbLead.bedrooms,
      views: dbLead.views || [],
      amenities: dbLead.amenities || [],
      purchaseTimeframe: dbLead.purchase_timeframe,
      financingMethod: dbLead.financing_method,
      propertyUse: dbLead.property_use,
      nationality: dbLead.nationality,
      preferredLanguage: dbLead.preferred_language,
      taskType: dbLead.task_type,
      notes: dbLead.notes,
      internal_notes: dbLead.internal_notes,
      nextFollowUpDate: dbLead.next_follow_up_date,
      country: dbLead.country,
      url: dbLead.url,
      pipelineType: dbLead.pipeline_type,
      pipeline_type: dbLead.pipeline_type,
      taxResidence: dbLead.tax_residence,
      regions: dbLead.regions || [],
      residenceCountry: dbLead.residence_country,
      imported_at: dbLead.imported_at,
      integration_source: dbLead.integration_source,
      actionHistory: dbLead.action_history || [],
      livingArea: dbLead.living_area,
      external_id: dbLead.external_id
    };
  }

  // Analyser tous les leads et trouver les meilleurs matches
  async findTopMatches(limit: number = 50): Promise<Array<{
    lead: LeadDetailed;
    matches: PropertyMatch[];
    totalScore: number;
  }>> {
    console.log('🚀 Analyse globale des matches...');
    
    try {
      // Récupérer tous les leads actifs
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .in('status', ['Nouveau', 'Contacté', 'Intéressé', 'En négociation'])
        .not('pipeline_type', 'eq', 'owners')
        .order('created_at', { ascending: false });

      if (error || !leads) {
        console.error('Erreur lors de la récupération des leads:', error);
        return [];
      }

      console.log(`Analyse de ${leads.length} leads actifs...`);

      const results = [];
      
      for (const dbLead of leads) {
        // Mapper les données de la base vers le format LeadDetailed
        const lead = this.mapDatabaseLeadToDetailed(dbLead);
        
        const matches = await this.findMatches(lead, 5);
        if (matches.length > 0) {
          const totalScore = matches.reduce((sum, match) => sum + match.score, 0);
          results.push({
            lead,
            matches,
            totalScore
          });
        }
      }

      // Trier par score total décroissant
      results.sort((a, b) => b.totalScore - a.totalScore);

      console.log(`🎯 ${results.length} leads avec des matches trouvés`);
      
      return results.slice(0, limit);
    } catch (error) {
      console.error('Erreur dans findTopMatches:', error);
      return [];
    }
  }
}

export const aiMatchingEngine = AIMatchingEngine.getInstance();
