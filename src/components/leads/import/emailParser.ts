
/**
 * Parseur d'emails avancé pour extraire les données de leads à partir de différents formats d'emails
 * de portails immobiliers et autres sources.
 */

// Définition des types pour le résultat du parsing
export interface ParsedLeadData {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  portal_name?: string;
  source?: string;
  property_reference?: string;
  desired_location?: string;
  budget?: string;
  property_type?: string;
  living_area?: string;
  bedrooms?: number;
  message?: string;
  integration_source: string;
  // Champs supplémentaires
  external_id?: string;
  property_use?: string;
  financing_method?: string;
  purchase_timeframe?: string;
  views?: string[];
  amenities?: string[];
  raw_content?: string;
  [key: string]: any; // Pour les champs supplémentaires non typés
}

// Formats de portails connus
export enum PortalType {
  FIGARO = 'Le Figaro',
  PROPERSTAR = 'Properstar',
  PROPERTY_CLOUD = 'Property Cloud',
  IDEALISTA = 'Idealista',
  SELOGER = 'SeLoger',
  LUXURY_ESTATE = "L'express Property",
  JAMESEDITION = 'JamesEdition',
  BELLESDEMEURES = 'Belles Demeures',
  GENERIC = 'Generic'
}

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

/**
 * Détecte la source du portail immobilier en fonction du contenu de l'email
 */
function detectPortalSource(emailText: string): PortalType {
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
 * Parser pour les emails de Propriétés Le Figaro
 */
function parseFigaroEmail(emailText: string): Partial<ParsedLeadData> {
  const data: Partial<ParsedLeadData> = {};
  
  // Expressions régulières pour le format Figaro
  const namePatterns = [
    /Nom\s*:\s*([^\r\n]+)/i,
    /Nom et prénom\s*:\s*([^\r\n]+)/i,
    /Name\s*:\s*([^\r\n]+)/i,
    /De\s*:\s*([^\r\n<>]+)/i
  ];
  
  // Extraction du nom avec plusieurs patterns
  for (const pattern of namePatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.name = match[1].trim();
      break;
    }
  }
  
  // Extraction de l'email avec plusieurs patterns
  const emailPatterns = [
    /e-?mail\s*:\s*([^\r\n]+)/i,
    /Email\s*:\s*([^\r\n]+)/i,
    /Adresse e-?mail\s*:\s*([^\r\n]+)/i,
    /courriel\s*:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
  ];
  
  for (const pattern of emailPatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.email = match[1].trim();
      break;
    }
  }
  
  // Extraction du téléphone
  const phonePatterns = [
    /Téléphone\s*:\s*([^\r\n]+)/i,
    /Phone\s*:\s*([^\r\n]+)/i,
    /Tel\s*:\s*([^\r\n]+)/i,
    /Mobile\s*:\s*([^\r\n]+)/i
  ];
  
  for (const pattern of phonePatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.phone = match[1].trim();
      break;
    }
  }
  
  // Extraction du pays
  const countryPatterns = [
    /Pays\s*:\s*([^\r\n]+)/i,
    /Country\s*:\s*([^\r\n]+)/i
  ];
  
  for (const pattern of countryPatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.country = match[1].trim();
      break;
    }
  }
  
  // Extraction du budget
  const budgetPatterns = [
    /Budget\s*:\s*([^\r\n]+)/i,
    /Prix\s*:\s*([^\r\n]+)/i,
    /de ([0-9\s]+) à ([0-9\s]+) €/i,
    /Budget entre ([0-9\s]+) et ([0-9\s]+)/i
  ];
  
  for (const pattern of budgetPatterns) {
    const match = emailText.match(pattern);
    if (match) {
      if (match.length > 2) {
        // Format de budget avec min et max
        data.budget = `${match[1].trim()} - ${match[2].trim()} €`;
      } else if (match[1]) {
        // Format de budget simple
        data.budget = match[1].trim();
      }
      break;
    }
  }
  
  // Extraction de la localisation souhaitée
  const locationPatterns = [
    /Localisation\s*:\s*([^\r\n]+)/i,
    /Ville\s*:\s*([^\r\n]+)/i,
    /Location\s*:\s*([^\r\n]+)/i,
    /à ([^,\r\n]+),/i,
    /Secteur\s*:\s*([^\r\n]+)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.desired_location = match[1].trim();
      break;
    }
  }
  
  // Extraction du type de propriété
  const propertyTypePatterns = [
    /Type de bien\s*:\s*([^\r\n]+)/i,
    /Property type\s*:\s*([^\r\n]+)/i,
    /Type\s*:\s*([^\r\n]+)/i
  ];
  
  for (const pattern of propertyTypePatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.property_type = match[1].trim();
      break;
    }
  }
  
  // Extraction de la surface habitable
  const surfacePatterns = [
    /Surface\s*:\s*([0-9]+)\s*m²/i,
    /Surface habitable\s*:\s*([0-9]+)\s*m²/i,
    /Living area\s*:\s*([0-9]+)\s*m²/i
  ];
  
  for (const pattern of surfacePatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.living_area = `${match[1].trim()} m²`;
      break;
    }
  }
  
  // Extraction du nombre de chambres
  const bedroomPatterns = [
    /Chambres\s*:\s*([0-9]+)/i,
    /Bedrooms\s*:\s*([0-9]+)/i,
    /Nombre de chambres\s*:\s*([0-9]+)/i
  ];
  
  for (const pattern of bedroomPatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.bedrooms = parseInt(match[1].trim(), 10);
      break;
    }
  }
  
  // Extraction de la référence de la propriété
  const refPatterns = [
    /Référence\s*:\s*([^\r\n]+)/i,
    /Reference\s*:\s*([^\r\n]+)/i,
    /Property reference\s*:\s*([^\r\n]+)/i,
    /Votre Référence\s*:\s*([^\r\n]+)/i
  ];
  
  for (const pattern of refPatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.property_reference = match[1].trim();
      break;
    }
  }
  
  // Extraction du message
  const messagePatterns = [
    /Message\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i,
    /Commentaire\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i,
    /Commentaires\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i,
    /Bonjour,[\\s\\S]*?Cordialement/i
  ];
  
  for (const pattern of messagePatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.message = match[1].trim();
      break;
    }
  }
  
  // Extraction des vues
  if (emailText.match(/Vue mer/i)) {
    data.views = ['Mer'];
  } else if (emailText.match(/Vue montagne/i)) {
    data.views = ['Montagne'];
  }
  
  // Extraction des équipements
  const amenities = [];
  if (emailText.match(/piscine/i)) amenities.push('Piscine');
  if (emailText.match(/jardin/i)) amenities.push('Jardin');
  if (emailText.match(/garage/i)) amenities.push('Garage');
  if (emailText.match(/sécurité|security/i)) amenities.push('Sécurité');
  
  if (amenities.length > 0) {
    data.amenities = amenities;
  }
  
  return data;
}

/**
 * Parser pour les emails d'Idealista
 */
function parseIdealistaEmail(emailText: string): Partial<ParsedLeadData> {
  const data: Partial<ParsedLeadData> = {};
  
  // Expressions régulières pour le format Idealista
  const nameMatch = emailText.match(/Nombre(?:\s*de contacto)?\s*:\s*([^\r\n]+)/i) || 
                   emailText.match(/Nombre\s*:\s*([^\r\n]+)/i) ||
                   emailText.match(/Name\s*:\s*([^\r\n]+)/i);
  if (nameMatch && nameMatch[1]) {
    data.name = nameMatch[1].trim();
  }
  
  const emailMatch = emailText.match(/Email(?:\s*de contacto)?\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/E-mail\s*:\s*([^\r\n]+)/i);
  if (emailMatch && emailMatch[1]) {
    data.email = emailMatch[1].trim();
  }
  
  const phoneMatch = emailText.match(/Teléfono(?:\s*de contacto)?\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Téléphone\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Phone\s*:\s*([^\r\n]+)/i);
  if (phoneMatch && phoneMatch[1]) {
    data.phone = phoneMatch[1].trim();
  }
  
  // Extraction de la référence de la propriété
  const refMatch = emailText.match(/Referencia(?:\s*del anuncio)?\s*:\s*([^\r\n]+)/i) ||
                  emailText.match(/Reference\s*:\s*([^\r\n]+)/i);
  if (refMatch && refMatch[1]) {
    data.property_reference = refMatch[1].trim();
  }
  
  // Extraction de l'ID externe
  const idMatch = emailText.match(/ID(?:\s*de contacto)?\s*:\s*([^\r\n]+)/i);
  if (idMatch && idMatch[1]) {
    data.external_id = idMatch[1].trim();
  }
  
  // Extraction du message
  const messageMatch = emailText.match(/Mensaje\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i) ||
                      emailText.match(/Message\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i);
  if (messageMatch && messageMatch[1]) {
    data.message = messageMatch[1].trim();
  }
  
  // Extraction du prix/budget
  const priceMatch = emailText.match(/Precio\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Price\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Prix\s*:\s*([^\r\n]+)/i);
  if (priceMatch && priceMatch[1]) {
    data.budget = priceMatch[1].trim();
  }
  
  // Extraction de la localisation
  const locationMatch = emailText.match(/Ubicación\s*:\s*([^\r\n]+)/i) ||
                       emailText.match(/Location\s*:\s*([^\r\n]+)/i);
  if (locationMatch && locationMatch[1]) {
    data.desired_location = locationMatch[1].trim();
  }
  
  // Extraction du type de propriété
  const typeMatch = emailText.match(/Tipo\s*de\s*inmueble\s*:\s*([^\r\n]+)/i) ||
                   emailText.match(/Property\s*type\s*:\s*([^\r\n]+)/i);
  if (typeMatch && typeMatch[1]) {
    data.property_type = typeMatch[1].trim();
  }
  
  return data;
}

/**
 * Parser pour les emails de Properstar
 */
function parseProperstarEmail(emailText: string): Partial<ParsedLeadData> {
  const data: Partial<ParsedLeadData> = {};
  
  // Extraction des informations principales
  const nameMatch = emailText.match(/Name\s*:\s*([^\r\n]+)/i) ||
                   emailText.match(/Contact\s*name\s*:\s*([^\r\n]+)/i);
  if (nameMatch && nameMatch[1]) {
    data.name = nameMatch[1].trim();
  }
  
  const emailMatch = emailText.match(/Email\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Contact\s*email\s*:\s*([^\r\n]+)/i);
  if (emailMatch && emailMatch[1]) {
    data.email = emailMatch[1].trim();
  }
  
  const phoneMatch = emailText.match(/Phone\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Contact\s*phone\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Telephone\s*:\s*([^\r\n]+)/i);
  if (phoneMatch && phoneMatch[1]) {
    data.phone = phoneMatch[1].trim();
  }
  
  // Extraction de la référence
  const refMatch = emailText.match(/Property\s*ID\s*:\s*([^\r\n]+)/i) ||
                  emailText.match(/Listing\s*ID\s*:\s*([^\r\n]+)/i) ||
                  emailText.match(/Reference\s*:\s*([^\r\n]+)/i);
  if (refMatch && refMatch[1]) {
    data.property_reference = refMatch[1].trim();
  }
  
  // Extraction du message
  const messageMatch = emailText.match(/Message\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i) ||
                      emailText.match(/Comments\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i);
  if (messageMatch && messageMatch[1]) {
    data.message = messageMatch[1].trim();
  }
  
  // Extraction du prix/budget
  const priceMatch = emailText.match(/Price\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Property\s*price\s*:\s*([^\r\n]+)/i);
  if (priceMatch && priceMatch[1]) {
    data.budget = priceMatch[1].trim();
  }
  
  // Extraction de la localisation
  const locationMatch = emailText.match(/Location\s*:\s*([^\r\n]+)/i) ||
                       emailText.match(/City\s*:\s*([^\r\n]+)/i) ||
                       emailText.match(/Address\s*:\s*([^\r\n]+)/i);
  if (locationMatch && locationMatch[1]) {
    data.desired_location = locationMatch[1].trim();
  }
  
  // Extraction des détails supplémentaires
  const areaMatch = emailText.match(/Size\s*:\s*([^\r\n]+)\s*m²/i) ||
                   emailText.match(/Area\s*:\s*([^\r\n]+)\s*m²/i) ||
                   emailText.match(/Surface\s*:\s*([^\r\n]+)\s*m²/i);
  if (areaMatch && areaMatch[1]) {
    data.living_area = `${areaMatch[1].trim()} m²`;
  }
  
  const bedroomsMatch = emailText.match(/Bedrooms\s*:\s*([0-9]+)/i) ||
                       emailText.match(/Beds\s*:\s*([0-9]+)/i) ||
                       emailText.match(/Chambres\s*:\s*([0-9]+)/i);
  if (bedroomsMatch && bedroomsMatch[1]) {
    data.bedrooms = parseInt(bedroomsMatch[1].trim(), 10);
  }
  
  return data;
}

/**
 * Parser pour les emails de Property Cloud
 */
function parsePropertyCloudEmail(emailText: string): Partial<ParsedLeadData> {
  const data: Partial<ParsedLeadData> = {};
  
  // Extraction des informations principales
  const nameMatch = emailText.match(/Name\s*:\s*([^\r\n]+)/i) ||
                   emailText.match(/Contact name\s*:\s*([^\r\n]+)/i);
  if (nameMatch && nameMatch[1]) {
    data.name = nameMatch[1].trim();
  }
  
  const emailMatch = emailText.match(/Email\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Contact email\s*:\s*([^\r\n]+)/i);
  if (emailMatch && emailMatch[1]) {
    data.email = emailMatch[1].trim();
  }
  
  const phoneMatch = emailText.match(/Phone\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Contact phone\s*:\s*([^\r\n]+)/i);
  if (phoneMatch && phoneMatch[1]) {
    data.phone = phoneMatch[1].trim();
  }
  
  // Autres extractions similaires à Properstar
  const refMatch = emailText.match(/Property reference\s*:\s*([^\r\n]+)/i) ||
                  emailText.match(/Reference\s*:\s*([^\r\n]+)/i);
  if (refMatch && refMatch[1]) {
    data.property_reference = refMatch[1].trim();
  }
  
  const messageMatch = emailText.match(/Message\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i) ||
                      emailText.match(/Inquiry\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i);
  if (messageMatch && messageMatch[1]) {
    data.message = messageMatch[1].trim();
  }
  
  return data;
}

/**
 * Parser pour les emails de SeLoger
 */
function parseSeLogerEmail(emailText: string): Partial<ParsedLeadData> {
  const data: Partial<ParsedLeadData> = {};
  
  // Extraction des informations de base
  const nameMatch = emailText.match(/Nom\s*:\s*([^\r\n]+)/i) ||
                   emailText.match(/De\s*:\s*([^\r\n<>]+)/i);
  if (nameMatch && nameMatch[1]) {
    data.name = nameMatch[1].trim();
  }
  
  const emailMatch = emailText.match(/Email\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Adresse email\s*:\s*([^\r\n]+)/i);
  if (emailMatch && emailMatch[1]) {
    data.email = emailMatch[1].trim();
  }
  
  const phoneMatch = emailText.match(/Téléphone\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Tél\s*:\s*([^\r\n]+)/i);
  if (phoneMatch && phoneMatch[1]) {
    data.phone = phoneMatch[1].trim();
  }
  
  // Extraction du message
  const messageMatch = emailText.match(/Message\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i) ||
                      emailText.match(/Commentaire\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i);
  if (messageMatch && messageMatch[1]) {
    data.message = messageMatch[1].trim();
  }
  
  // Extraction de la référence
  const refMatch = emailText.match(/Référence annonce\s*:\s*([^\r\n]+)/i) ||
                  emailText.match(/Ref\s*:\s*([^\r\n]+)/i);
  if (refMatch && refMatch[1]) {
    data.property_reference = refMatch[1].trim();
  }
  
  // Extraction du bien
  const propertyMatch = emailText.match(/Type de bien\s*:\s*([^\r\n]+)/i);
  if (propertyMatch && propertyMatch[1]) {
    data.property_type = propertyMatch[1].trim();
  }
  
  // Extraction du prix
  const priceMatch = emailText.match(/Prix\s*:\s*([^\r\n]+)/i);
  if (priceMatch && priceMatch[1]) {
    data.budget = priceMatch[1].trim();
  }
  
  // Extraction de la ville
  const cityMatch = emailText.match(/Ville\s*:\s*([^\r\n]+)/i) ||
                   emailText.match(/Localisation\s*:\s*([^\r\n]+)/i);
  if (cityMatch && cityMatch[1]) {
    data.desired_location = cityMatch[1].trim();
  }
  
  return data;
}

/**
 * Parser pour les emails de LuxuryEstate/L'express Property
 */
function parseLuxuryEstateEmail(emailText: string): Partial<ParsedLeadData> {
  const data: Partial<ParsedLeadData> = {};
  
  // Extraction des informations de base
  const nameMatch = emailText.match(/Name\s*:\s*([^\r\n]+)/i) ||
                   emailText.match(/From\s*:\s*([^\r\n<>]+)/i);
  if (nameMatch && nameMatch[1]) {
    data.name = nameMatch[1].trim();
  }
  
  const emailMatch = emailText.match(/Email\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Reply to\s*:\s*([^\r\n]+)/i);
  if (emailMatch && emailMatch[1]) {
    data.email = emailMatch[1].trim();
  }
  
  const phoneMatch = emailText.match(/Phone\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Tel\s*:\s*([^\r\n]+)/i);
  if (phoneMatch && phoneMatch[1]) {
    data.phone = phoneMatch[1].trim();
  }
  
  // Extraction du message
  const messageMatch = emailText.match(/Message\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i) ||
                      emailText.match(/Message content\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i);
  if (messageMatch && messageMatch[1]) {
    data.message = messageMatch[1].trim();
  }
  
  // Extraction de la référence
  const refMatch = emailText.match(/Property ID\s*:\s*([^\r\n]+)/i) ||
                  emailText.match(/Reference\s*:\s*([^\r\n]+)/i);
  if (refMatch && refMatch[1]) {
    data.property_reference = refMatch[1].trim();
  }
  
  // Extraction de la localisation
  const locationMatch = emailText.match(/Location\s*:\s*([^\r\n]+)/i) ||
                       emailText.match(/City\s*:\s*([^\r\n]+)/i);
  if (locationMatch && locationMatch[1]) {
    data.desired_location = locationMatch[1].trim();
  }
  
  // Extraction du prix
  const priceMatch = emailText.match(/Price\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Budget\s*:\s*([^\r\n]+)/i);
  if (priceMatch && priceMatch[1]) {
    data.budget = priceMatch[1].trim();
  }
  
  return data;
}

/**
 * Parser pour les emails de JamesEdition
 */
function parseJamesEditionEmail(emailText: string): Partial<ParsedLeadData> {
  const data: Partial<ParsedLeadData> = {};
  
  // Extraction des informations de base
  const nameMatch = emailText.match(/Name\s*:\s*([^\r\n]+)/i) ||
                   emailText.match(/From\s*:\s*([^\r\n<>]+)/i);
  if (nameMatch && nameMatch[1]) {
    data.name = nameMatch[1].trim();
  }
  
  const emailMatch = emailText.match(/Email\s*:\s*([^\r\n]+)/i);
  if (emailMatch && emailMatch[1]) {
    data.email = emailMatch[1].trim();
  }
  
  const phoneMatch = emailText.match(/Phone\s*:\s*([^\r\n]+)/i);
  if (phoneMatch && phoneMatch[1]) {
    data.phone = phoneMatch[1].trim();
  }
  
  // Extraction du message
  const messageMatch = emailText.match(/Message\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i) ||
                      emailText.match(/Comment\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i);
  if (messageMatch && messageMatch[1]) {
    data.message = messageMatch[1].trim();
  }
  
  // Extraction de la référence
  const refMatch = emailText.match(/Listing ID\s*:\s*([^\r\n]+)/i) ||
                  emailText.match(/Reference\s*:\s*([^\r\n]+)/i);
  if (refMatch && refMatch[1]) {
    data.property_reference = refMatch[1].trim();
  }
  
  return data;
}

/**
 * Parser pour les emails de Belles Demeures
 */
function parseBellesDemeuresEmail(emailText: string): Partial<ParsedLeadData> {
  const data: Partial<ParsedLeadData> = {};
  
  // Extraction des informations de base
  const nameMatch = emailText.match(/Nom\s*:\s*([^\r\n]+)/i) ||
                   emailText.match(/De\s*:\s*([^\r\n<>]+)/i);
  if (nameMatch && nameMatch[1]) {
    data.name = nameMatch[1].trim();
  }
  
  const emailMatch = emailText.match(/Email\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Adresse email\s*:\s*([^\r\n]+)/i);
  if (emailMatch && emailMatch[1]) {
    data.email = emailMatch[1].trim();
  }
  
  const phoneMatch = emailText.match(/Téléphone\s*:\s*([^\r\n]+)/i) ||
                    emailText.match(/Tél\s*:\s*([^\r\n]+)/i);
  if (phoneMatch && phoneMatch[1]) {
    data.phone = phoneMatch[1].trim();
  }
  
  // Extraction du message
  const messageMatch = emailText.match(/Message\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i) ||
                      emailText.match(/Commentaire\s*:\s*([\s\S]+?)(?=\r?\n[A-Z]|$)/i);
  if (messageMatch && messageMatch[1]) {
    data.message = messageMatch[1].trim();
  }
  
  // Extraction de la référence
  const refMatch = emailText.match(/Référence annonce\s*:\s*([^\r\n]+)/i) ||
                  emailText.match(/Ref\s*:\s*([^\r\n]+)/i);
  if (refMatch && refMatch[1]) {
    data.property_reference = refMatch[1].trim();
  }
  
  return data;
}

/**
 * Parser générique pour les emails non reconnus
 */
function parseGenericEmail(emailText: string): Partial<ParsedLeadData> {
  const data: Partial<ParsedLeadData> = {};
  
  // Recherche des patterns courants
  
  // Nom
  const namePatterns = [
    /name\s*:\s*([^\r\n]+)/i,
    /nom\s*:\s*([^\r\n]+)/i,
    /from\s*:\s*([^<\r\n]+)/i,
    /de\s*:\s*([^<\r\n]+)/i,
    /contact\s*:\s*([^\r\n]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.name = match[1].trim();
      break;
    }
  }
  
  // Email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailPatterns = [
    /email\s*:\s*([^\r\n]+)/i,
    /e-?mail\s*:\s*([^\r\n]+)/i,
    /reply\s*to\s*:\s*([^\r\n]+)/i,
    new RegExp(`contact\\s*:\\s*(${emailRegex.source})`, 'i')
  ];
  
  // Recherche d'emails dans le texte si aucun pattern ne correspond
  if (!data.email) {
    const emailMatches = emailText.match(emailRegex);
    if (emailMatches) {
      data.email = emailMatches[0];
    }
  }
  
  for (const pattern of emailPatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      const email = match[1].trim();
      if (email.match(emailRegex)) {
        data.email = email;
        break;
      }
    }
  }
  
  // Téléphone
  const phoneRegex = /(\+[0-9]{1,3})?[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/;
  const phonePatterns = [
    /phone\s*:\s*([^\r\n]+)/i,
    /telephone\s*:\s*([^\r\n]+)/i,
    /téléphone\s*:\s*([^\r\n]+)/i,
    /tel\s*:\s*([^\r\n]+)/i,
    /mobile\s*:\s*([^\r\n]+)/i
  ];
  
  for (const pattern of phonePatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.phone = match[1].trim();
      break;
    }
  }
  
  // Recherche de numéros de téléphone dans le texte si aucun pattern ne correspond
  if (!data.phone) {
    const phoneMatches = emailText.match(phoneRegex);
    if (phoneMatches) {
      data.phone = phoneMatches[0];
    }
  }
  
  // Message
  const messagePatterns = [
    /message\s*:\s*([\s\S]+?)(?=\r?\n\r?\n|$)/i,
    /commentaire\s*:\s*([\s\S]+?)(?=\r?\n\r?\n|$)/i,
    /comments\s*:\s*([\s\S]+?)(?=\r?\n\r?\n|$)/i,
    /inquiry\s*:\s*([\s\S]+?)(?=\r?\n\r?\n|$)/i
  ];
  
  for (const pattern of messagePatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.message = match[1].trim();
      break;
    }
  }
  
  // Recherche de références de propriété
  const refPatterns = [
    /reference\s*:\s*([^\r\n]+)/i,
    /ref\s*:\s*([^\r\n]+)/i,
    /property\s*id\s*:\s*([^\r\n]+)/i,
    /listing\s*id\s*:\s*([^\r\n]+)/i,
    /property\s*reference\s*:\s*([^\r\n]+)/i
  ];
  
  for (const pattern of refPatterns) {
    const match = emailText.match(pattern);
    if (match && match[1]) {
      data.property_reference = match[1].trim();
      break;
    }
  }
  
  return data;
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
