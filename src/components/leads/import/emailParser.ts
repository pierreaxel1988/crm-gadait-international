
export const parseEmailContent = (emailText: string) => {
  const data: Record<string, any> = {
    integration_source: 'Email Parser'
  };

  // Détecter la source du portail
  if (emailText.includes('Propriétés Le Figaro')) {
    data.portal_name = 'Le Figaro';
    data.source = 'Le Figaro';
  } else if (emailText.includes('Properstar')) {
    data.portal_name = 'Properstar';
    data.source = 'Properstar';
  } else if (emailText.includes('Property Cloud')) {
    data.portal_name = 'Property Cloud';
    data.source = 'Property Cloud';
  } else if (emailText.includes('Idealista')) {
    data.portal_name = 'Idealista';
    data.source = 'Idealista';
  }

  // Extraction du nom
  const nameMatch = emailText.match(/Name\s*:\s*([^\r\n]+)/i);
  if (nameMatch && nameMatch[1]) {
    data.name = nameMatch[1].trim();
  }

  // Extraction de l'email
  const emailMatch = emailText.match(/e-?mail\s*:\s*([^\r\n]+)/i);
  if (emailMatch && emailMatch[1]) {
    data.email = emailMatch[1].trim();
  }

  // Extraction du téléphone
  const phoneMatch = emailText.match(/Phone\s*:\s*([^\r\n]+)/i);
  if (phoneMatch && phoneMatch[1]) {
    data.phone = phoneMatch[1].trim();
  }

  // Extraction du pays
  const countryMatch = emailText.match(/Country\s*:\s*([^\r\n]+)/i);
  if (countryMatch && countryMatch[1]) {
    data.country = countryMatch[1].trim();
  }

  // Extraction de la référence de la propriété et du prix
  const propertyMatch = emailText.match(/Property\s*:\s*(\d+)\s*-\s*([^-\r\n]+)\s*-\s*([^\r\n]+)/i);
  if (propertyMatch) {
    data.property_reference = propertyMatch[1].trim();
    data.desired_location = propertyMatch[2].trim();
    data.budget = propertyMatch[3].trim();
  }

  // Extraction de l'URL
  const urlMatch = emailText.match(/url\s*:\s*([^\r\n]+)/i);
  if (urlMatch && urlMatch[1]) {
    // Si la référence n'a pas été trouvée avant, utiliser l'URL comme référence
    if (!data.property_reference) {
      data.property_reference = urlMatch[1].trim();
    }
  }

  // Extraction du message
  const messageMatch = emailText.match(/Message\s*:\s*([\s\S]+?)(?=Date|$)/i);
  if (messageMatch && messageMatch[1]) {
    data.message = messageMatch[1].trim();
  }
  return data;
};
