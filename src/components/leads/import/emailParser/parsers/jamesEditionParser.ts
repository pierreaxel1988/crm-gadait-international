
/**
 * Parser for JamesEdition emails
 */
import { ParsedLeadData } from '../types';

/**
 * Parser pour les emails de JamesEdition
 */
export function parseJamesEditionEmail(emailText: string): Partial<ParsedLeadData> {
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
