
/**
 * Parser for Idealista emails
 */
import { ParsedLeadData } from '../types';

/**
 * Parser pour les emails d'Idealista
 */
export function parseIdealistaEmail(emailText: string): Partial<ParsedLeadData> {
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
