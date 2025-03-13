
/**
 * Parser for Property Cloud emails
 */
import { ParsedLeadData } from '../types';

/**
 * Parser pour les emails de Property Cloud
 */
export function parsePropertyCloudEmail(emailText: string): Partial<ParsedLeadData> {
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
