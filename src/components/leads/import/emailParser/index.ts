
/**
 * Main email parser entry point
 * Refactored to use separate parser modules for each email portal type
 */
import { ParsedLeadData, PortalType } from './types';
import { detectPortalSource, normalizeLeadData } from './utils';
import {
  parseFigaroEmail,
  parseIdealistaEmail,
  parseProperstarEmail,
  parsePropertyCloudEmail,
  parseSeLogerEmail,
  parseLuxuryEstateEmail,
  parseJamesEditionEmail,
  parseBellesDemeuresEmail,
  parseGenericEmail
} from './parsers';

/**
 * Fonction principale pour parser le contenu d'un email
 */
export const parseEmailContent = (emailText: string): ParsedLeadData => {
  // Stocker le contenu brut pour référence
  const rawContent = emailText;
  
  // Structure de base pour les données extraites
  const data: ParsedLeadData = {
    integration_source: 'Email Parser',
    raw_content: rawContent
  };

  // Détecter le portail ou la source
  const portalType = detectPortalSource(emailText);
  data.portal_name = portalType;
  data.source = portalType;

  // Appliquer le parseur spécifique selon le portail détecté
  switch (portalType) {
    case PortalType.FIGARO:
      return { ...data, ...parseFigaroEmail(emailText) };
    case PortalType.IDEALISTA:
      return { ...data, ...parseIdealistaEmail(emailText) };
    case PortalType.PROPERSTAR:
      return { ...data, ...parseProperstarEmail(emailText) };
    case PortalType.PROPERTY_CLOUD:
      return { ...data, ...parsePropertyCloudEmail(emailText) };
    case PortalType.SELOGER:
      return { ...data, ...parseSeLogerEmail(emailText) };
    case PortalType.LUXURY_ESTATE:
      return { ...data, ...parseLuxuryEstateEmail(emailText) };
    case PortalType.JAMESEDITION:
      return { ...data, ...parseJamesEditionEmail(emailText) };
    case PortalType.BELLESDEMEURES:
      return { ...data, ...parseBellesDemeuresEmail(emailText) };
    default:
      // Pour les formats non reconnus, utiliser un parseur générique
      return { ...data, ...parseGenericEmail(emailText) };
  }
};

// Re-export types and utilities for convenience - fixed with 'export type'
export { normalizeLeadData };
export type { ParsedLeadData, PortalType };

