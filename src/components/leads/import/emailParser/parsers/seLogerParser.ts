
/**
 * Parser for SeLoger emails
 */
import { ParsedLeadData } from '../types';

/**
 * Parser pour les emails de SeLoger
 */
export function parseSeLogerEmail(emailText: string): Partial<ParsedLeadData> {
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
