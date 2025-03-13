
/**
 * Parser for Properstar emails
 */
import { ParsedLeadData } from '../types';

/**
 * Parser pour les emails de Properstar
 */
export function parseProperstarEmail(emailText: string): Partial<ParsedLeadData> {
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
