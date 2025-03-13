
/**
 * Utility functions for email parsing
 */
import { PortalType, ParsedLeadData } from './types';

/**
 * Détecte la source du portail immobilier en fonction du contenu de l'email
 */
export function detectPortalSource(emailText: string): PortalType {
  const normalizedText = emailText.toLowerCase();
  
  if (normalizedText.includes('propriétés le figaro') || normalizedText.includes('lefigaro.fr')) {
    return PortalType.FIGARO;
  } else if (normalizedText.includes('properstar') || normalizedText.includes('mail.properstar.com')) {
    return PortalType.PROPERSTAR;
  } else if (normalizedText.includes('property cloud') || normalizedText.includes('propertycloud')) {
    return PortalType.PROPERTY_CLOUD;
  } else if (normalizedText.includes('idealista') || normalizedText.includes('mail.idealista.com')) {
    return PortalType.IDEALISTA;
  } else if (normalizedText.includes('seloger') || normalizedText.includes('mail.seloger.com')) {
    return PortalType.SELOGER;
  } else if (normalizedText.includes('luxury estate') || normalizedText.includes('luxuryestate') || normalizedText.includes('express property')) {
    return PortalType.LUXURY_ESTATE;
  } else if (normalizedText.includes('jamesedition') || normalizedText.includes('mail.jamesedition.com')) {
    return PortalType.JAMESEDITION;
  } else if (normalizedText.includes('belles demeures') || normalizedText.includes('bellesdemeures')) {
    return PortalType.BELLESDEMEURES;
  }
  
  return PortalType.GENERIC;
}

/**
 * Normalise les données extraites pour s'assurer qu'elles sont dans le format attendu
 */
export const normalizeLeadData = (data: ParsedLeadData): ParsedLeadData => {
  // Normaliser les formats de budget
  if (data.budget) {
    // Si le budget ne contient pas le symbole €, l'ajouter
    if (!data.budget.includes('€')) {
      data.budget = `${data.budget} €`;
    }
  }
  
  // Normaliser les formats de surface
  if (data.living_area) {
    // Si la surface ne contient pas m², l'ajouter
    if (!data.living_area.includes('m²')) {
      data.living_area = `${data.living_area} m²`;
    }
  }
  
  // Normaliser les formats de téléphone
  if (data.phone) {
    // Supprimer les espaces en trop
    data.phone = data.phone.replace(/\s+/g, ' ').trim();
  }
  
  return data;
};
