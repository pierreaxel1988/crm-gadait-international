
/**
 * Generic parser for unrecognized email formats
 */
import { ParsedLeadData } from '../types';

/**
 * Parser générique pour les emails non reconnus
 */
export function parseGenericEmail(emailText: string): Partial<ParsedLeadData> {
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
    /reply\s*to\s*:\s*([^\r\n]+)/i
  ];
  
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
  
  // Recherche d'emails dans le texte si aucun pattern ne correspond
  if (!data.email) {
    const emailMatches = emailText.match(emailRegex);
    if (emailMatches) {
      data.email = emailMatches[0];
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
