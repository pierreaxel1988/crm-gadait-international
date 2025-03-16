
import { PropertyDetails } from '../types/chatTypes';
import { normalizePropertyType } from './propertyTypeUtils';
import { deriveNationalityFromCountry } from './nationalityUtils';

/**
 * Extracts property details from Le Figaro emails
 */
export const extractLefigaroPropertyDetails = (emailText: string): PropertyDetails => {
  const details: PropertyDetails = {};
  
  // Extract property reference
  const refMatch = emailText.match(/Votre Référence\s*:\s*([^-\r\n]+)/i);
  if (refMatch && refMatch[1]) {
    details.reference = refMatch[1].trim();
  }
  
  // Extract Le Figaro reference
  const lefigaroRefMatch = emailText.match(/Référence Propriétés Le Figaro\s*:\s*([^\r\n]+)/i);
  if (lefigaroRefMatch && lefigaroRefMatch[1]) {
    details.lefigaroReference = lefigaroRefMatch[1].trim();
  }
  
  // Extract property URL
  const urlMatch = emailText.match(/Annonce concernée\s*:\s*(https?:\/\/[^\s\r\n]+)/i);
  if (urlMatch && urlMatch[1]) {
    details.url = urlMatch[1].trim();
    
    // Extract info from URL
    const urlPath = new URL(details.url).pathname;
    const pathParts = urlPath.split('/');
    
    // Extract property type from URL if available
    if (pathParts.length > 1) {
      const typeLocationPart = pathParts[2] || '';
      const typeMatch = typeLocationPart.match(/^([^-]+)/);
      if (typeMatch && typeMatch[1]) {
        const extractedType = typeMatch[1].replace(/-/g, ' ').trim();
        details.type = normalizePropertyType(extractedType);
      }
    }
    
    // Extract country from URL if available
    if (pathParts.length > 2) {
      const countryPart = pathParts[pathParts.length - 2] || '';
      if (countryPart) {
        details.country = countryPart.replace(/-/g, ' ').trim();
      }
    }
  }
  
  // Extract property details from the listing block
  const propertyDetailsMatch = emailText.match(/Vente\s+([^\n]+)\s+([^\n]+)\s+Prix\s*:\s*([^\n]+)\s+(\d+)\s*m²(\s*-\s*(\d+)\s*pièces)?(\s*-\s*(\d+)\s*chambres)?/i);
  if (propertyDetailsMatch) {
    const extractedType = propertyDetailsMatch[1]?.trim() || '';
    details.type = normalizePropertyType(extractedType) || details.type;
    details.location = propertyDetailsMatch[2]?.trim() || details.location;
    details.price = propertyDetailsMatch[3]?.trim() || details.price;
    details.area = propertyDetailsMatch[4] ? `${propertyDetailsMatch[4].trim()} m²` : details.area;
    
    // Extract bedrooms if available
    if (propertyDetailsMatch[8]) {
      details.bedrooms = parseInt(propertyDetailsMatch[8].trim(), 10);
    }
    
    // Extract rooms if available
    if (propertyDetailsMatch[6]) {
      details.rooms = parseInt(propertyDetailsMatch[6].trim(), 10);
    }
  }
  
  // Extract property description
  const descriptionMatch = emailText.match(/GADAIT International vous (présente|offre)[\s\S]+?(?=\s*---)/i);
  if (descriptionMatch && descriptionMatch[0]) {
    details.description = descriptionMatch[0].trim();
  }
  
  // Extract client information
  const nameMatch = emailText.match(/•\s*Nom\s*:\s*([^\r\n]+)/i);
  if (nameMatch && nameMatch[1]) {
    details.name = nameMatch[1].trim();
  }
  
  const emailMatch = emailText.match(/•\s*Email\s*:\s*([^\r\n]+)/i);
  if (emailMatch && emailMatch[1]) {
    details.email = emailMatch[1].trim();
  }
  
  const phoneMatch = emailText.match(/•\s*Téléphone\s*:\s*([^\r\n]+)/i);
  if (phoneMatch && phoneMatch[1]) {
    details.phone = phoneMatch[1].trim();
  }
  
  const countryMatch = emailText.match(/•\s*Pays\s*:\s*([^\r\n]+)/i);
  if (countryMatch && countryMatch[1]) {
    details.country = countryMatch[1].trim();
    
    // Derive nationality from country
    if (details.country && !details.nationality) {
      details.nationality = deriveNationalityFromCountry(details.country);
    }
  }
  
  // Extract budget
  const budgetMatch = emailText.match(/•\s*de\s*([0-9\s]+)\s*à\s*([0-9\s]+)\s*(\$|€)/i);
  if (budgetMatch) {
    const min = budgetMatch[1].replace(/\s/g, '');
    const max = budgetMatch[2].replace(/\s/g, '');
    const currency = budgetMatch[3];
    details.budget = `${min} - ${max} ${currency}`;
  } else {
    // Try to extract single price value
    const singlePriceMatch = emailText.match(/Prix\s*:\s*([0-9\s]+)\s*(\$|€)/i);
    if (singlePriceMatch) {
      const price = singlePriceMatch[1].replace(/\s/g, '');
      const currency = singlePriceMatch[2];
      details.budget = `${price} ${currency}`;
    }
  }
  
  // Extract location
  const locationMatch = emailText.match(/•\s*([^•\r\n]+)\s*\(([^)]+)\)/i);
  if (locationMatch) {
    details.desiredLocation = locationMatch[1].trim();
    if (!details.country) {
      details.country = locationMatch[2].trim();
      
      // Also derive nationality if we now have a country
      if (!details.nationality) {
        details.nationality = deriveNationalityFromCountry(details.country);
      }
    }
  }
  
  // Extract amenities/options
  const amenitiesMatch = emailText.match(/•\s*Autres options souhaitées par l'internaute:\s*([^\r\n]+)/i);
  if (amenitiesMatch && amenitiesMatch[1]) {
    // Store amenities as an array with a single element for now
    // This will be converted to proper Amenity types later
    details.amenities = [amenitiesMatch[1].trim()];
  }
  
  // Extract views for "Vue mer" and similar
  if (emailText.toLowerCase().includes('vue mer')) {
    details.views = details.views || [];
    if (!details.views.includes('Mer')) {
      details.views.push('Mer');
    }
  }
  
  // Extract property type
  const propertyTypeMatch = emailText.match(/•\s*([^•\r\n:]+?)(?=\s*\n|•\s*de|$)/i);
  if (propertyTypeMatch && propertyTypeMatch[1] && !propertyTypeMatch[1].includes('Propriétés Le Figaro')) {
    const extractedType = propertyTypeMatch[1].trim();
    details.propertyType = normalizePropertyType(extractedType);
  }
  
  return details;
};
