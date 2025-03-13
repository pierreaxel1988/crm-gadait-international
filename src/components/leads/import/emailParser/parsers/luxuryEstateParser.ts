
/**
 * Parser for Luxury Estate / L'express Property emails
 */
import { ParsedLeadData } from '../types';

/**
 * Parser pour les emails de LuxuryEstate/L'express Property
 */
export function parseLuxuryEstateEmail(emailText: string): Partial<ParsedLeadData> {
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
