
/**
 * Parser for Le Figaro emails
 */
import { ParsedLeadData } from '../types';

/**
 * Parser pour les emails de Propriétés Le Figaro
 */
export function parseFigaroEmail(emailText: string): Partial<ParsedLeadData> {
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
