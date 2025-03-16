export const parseEmailContent = (emailText: string) => {
  const data: Record<string, any> = {
    integration_source: 'Email Parser'
  };
  
  const isWhatsAppRelated = emailText.toLowerCase().includes('whatsapp') || 
                           (emailText.toLowerCase().includes('automated message') && 
                            emailText.toLowerCase().includes('contacted you through'));

  const isApimoProperyCloud = (emailText.toLowerCase().includes('apimo') || 
                                emailText.toLowerCase().includes('property cloud')) && 
                               isWhatsAppRelated;
  
  const isLeFigaro = emailText.includes('Propriétés Le Figaro') || 
                     emailText.includes('Annonce concernée :');
  
  if (emailText.includes('Propriétés Le Figaro')) {
    data.portal_name = 'Le Figaro';
    data.source = 'Le Figaro';
    
    const nameMatch = emailText.match(/•\s*Nom\s*:\s*([^\r\n]+)/i);
    if (nameMatch && nameMatch[1]) {
      data.name = nameMatch[1].trim();
    }
    
    const emailMatch = emailText.match(/•\s*Email\s*:\s*([^\r\n]+)/i);
    if (emailMatch && emailMatch[1]) {
      data.email = emailMatch[1].trim();
    }
    
    const phoneMatch = emailText.match(/•\s*Téléphone\s*:\s*([^\r\n]+)/i);
    if (phoneMatch && phoneMatch[1]) {
      data.phone = phoneMatch[1].trim();
    }
    
    const locationMatch = emailText.match(/•\s*([^•\r\n]+)\s*\(([^)]+)\)/i);
    if (locationMatch) {
      data.desired_location = locationMatch[1].trim();
      data.country = locationMatch[2].trim();
    }
    
    const propertyTypeMatch = emailText.match(/•\s*([^•\r\n]+)\s*\n•\s*de/i);
    if (propertyTypeMatch) {
      data.property_type = propertyTypeMatch[1].trim();
    }
    
    const budgetMatch = emailText.match(/•\s*de\s*([0-9\s]+)\s*à\s*([0-9\s]+)\s*€/i);
    if (budgetMatch) {
      data.budget_min = budgetMatch[1].replace(/\s/g, '');
      data.budget_max = budgetMatch[2].replace(/\s/g, '');
      data.budget = `${data.budget_min} - ${data.budget_max} €`;
    }
    
    const optionsMatch = emailText.match(/•\s*Autres options souhaitées par l'internaute:\s*([^\r\n]+)/i);
    if (optionsMatch && optionsMatch[1]) {
      data.amenities = [optionsMatch[1].trim()];
    }
    
    const messageMatch = emailText.match(/Bonjour,\s*([\s\S]*?)Cordialement\./i);
    if (messageMatch && messageMatch[1]) {
      data.message = messageMatch[1].trim();
    }
    
    const refMatch = emailText.match(/Votre Référence\s*:\s*([^-\r\n]+)/i);
    if (refMatch && refMatch[1]) {
      data.property_reference = refMatch[1].trim();
    }
    
    const urlMatch = emailText.match(/Annonce concernée\s*:\s*(https?:\/\/[^\s\r\n]+)/i);
    if (urlMatch && urlMatch[1]) {
      data.property_url = urlMatch[1].trim();
    }
    
    const propertyDetailsMatch = emailText.match(/Prix\s*:\s*([^\r\n]+)[\s\S]*?(\d+)\s*m²\s*-\s*(\d+)\s*pièces\s*-\s*(\d+)\s*chambres/i);
    if (propertyDetailsMatch) {
      if (!data.budget) {
        data.budget = propertyDetailsMatch[1].trim();
      }
      data.living_area = `${propertyDetailsMatch[2].trim()} m²`;
      data.rooms = parseInt(propertyDetailsMatch[3], 10);
      data.bedrooms = parseInt(propertyDetailsMatch[4], 10);
    }
    
    if (emailText.toLowerCase().includes('vue mer')) {
      data.views = data.views || [];
      if (!data.views.includes('Mer')) {
        data.views.push('Mer');
      }
    }
  } else if (emailText.includes('Properstar')) {
    data.portal_name = 'Properstar';
    data.source = 'Properstar';
  } else if (emailText.toLowerCase().includes('property cloud') || 
            emailText.includes('propertycloud.mu') ||
            emailText.includes('www.propertycloud.mu') ||
            emailText.toLowerCase().includes('apimo.pro')) {
    data.portal_name = 'Property Cloud';
    data.source = isWhatsAppRelated ? 'Property Cloud - WhatsApp' : 'Property Cloud';
  } else if (emailText.includes('Idealista')) {
    data.portal_name = 'Idealista';
    data.source = 'Idealista';
  }

  if (!data.name) {
    const nameMatch = emailText.match(/Name\s*:\s*([^\r\n]+)/i) || 
                      emailText.match(/Coordonates\s*:[\s\S]*?Name\s*:\s*([^\r\n]+)/i);
    
    if (nameMatch && nameMatch[1]) {
      data.name = nameMatch[1].trim();
    } else if (isWhatsAppRelated) {
      data.name = "Contact via WhatsApp";
    }
  }

  if (!data.email) {
    const emailMatch = emailText.match(/e-?mail\s*:\s*([^\r\n]+)/i) || 
                      emailText.match(/Coordonates\s*:[\s\S]*?e-?mail\s*:\s*([^\r\n]+)/i);
    
    if (emailMatch && emailMatch[1]) {
      data.email = emailMatch[1].trim();
    } else {
      const genericEmailMatch = emailText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (genericEmailMatch) {
        data.email = genericEmailMatch[0];
      }
    }
  }

  if (!data.phone) {
    const phoneMatch = emailText.match(/Phone\s*:\s*([^\r\n]+)/i) || 
                      emailText.match(/Telephone\s*:\s*([^\r\n]+)/i) ||
                      emailText.match(/Tel\s*:\s*([^\r\n]+)/i) ||
                      emailText.match(/Coordonates\s*:[\s\S]*?Phone\s*:\s*([^\r\n]+)/i);
    
    if (phoneMatch && phoneMatch[1]) {
      data.phone = phoneMatch[1].trim();
    }
  }

  const langMatch = emailText.match(/Language\s*:\s*([^\r\n]+)/i);
  if (langMatch && langMatch[1]) {
    data.language = langMatch[1].trim();
  }

  if (isApimoProperyCloud) {
    const criteriasPropMatch = emailText.match(/Criterias\s*:[\s\S]*?Property\s*:\s*(\d+)([^\r\n]+)/i);
    if (criteriasPropMatch) {
      data.property_reference = criteriasPropMatch[1].trim();
      
      const propInfo = criteriasPropMatch[2].trim();
      const locationPriceMatch = propInfo.match(/\s*-\s*([^-]+)\s*-\s*([^-\r\n]+)/);
      if (locationPriceMatch) {
        data.desired_location = locationPriceMatch[1].trim();
        data.budget = locationPriceMatch[2].trim();
      }
    }
    
    const urlMatch = emailText.match(/url\s*:\s*(https?:\/\/[^\s\r\n]+)/i);
    if (urlMatch && urlMatch[1]) {
      const url = urlMatch[1].trim();
      data.property_url = url;
      
      if (!data.property_reference) {
        const urlRefMatch = url.match(/gad(\d+)/i);
        if (urlRefMatch && urlRefMatch[1]) {
          data.property_reference = urlRefMatch[1];
        }
      }
    }
    
    const messageMatch = emailText.match(/Message\s*:\s*([^\r\n]+).*?url:/is);
    if (messageMatch && messageMatch[1]) {
      data.message = messageMatch[1].trim();
    } else {
      const messageGeneric = emailText.match(/Message\s*:\s*([^\r\n]+)/i);
      if (messageGeneric && messageGeneric[1]) {
        data.message = messageGeneric[1].trim();
      }
    }
  } else if (!isLeFigaro) {
    const countryMatch = emailText.match(/Country\s*:\s*([^\r\n]+)/i);
    if (countryMatch && countryMatch[1]) {
      data.country = countryMatch[1].trim();
    }

    const propertyCloudRefMatch = emailText.match(/Property\s*:\s*(\d+)/i);
    if (propertyCloudRefMatch && propertyCloudRefMatch[1]) {
      data.property_reference = propertyCloudRefMatch[1].trim();
      
      const fullPropertyLine = emailText.match(/Property\s*:\s*(\d+)([^\r\n]+)/i);
      if (fullPropertyLine && fullPropertyLine[2]) {
        const propertyInfo = fullPropertyLine[2].trim();
        
        const locationPriceMatch = propertyInfo.match(/\s*[-–]\s*([^-–]+)\s*[-–]\s*([^-–\r\n]+)/);
        if (locationPriceMatch) {
          data.desired_location = locationPriceMatch[1].trim();
          data.budget = locationPriceMatch[2].trim();
        }
      }
    }
    
    const urlMatch = emailText.match(/url\s*:\s*([^\r\n]+)/i) || 
                    emailText.match(/https?:\/\/[^\s\r\n]+/i);
    if (urlMatch) {
      const url = urlMatch[0].includes('://') ? urlMatch[0] : urlMatch[1];
      data.property_url = url.trim();
      
      if (!data.property_reference) {
        const urlRefMatch = url.match(/gad(\d+)/i);
        if (urlRefMatch && urlRefMatch[1]) {
          data.property_reference = urlRefMatch[1];
        }
      }
    }

    const messageMatch = emailText.match(/Message\s*:\s*([\s\S]+?)(?=\s*Date|$)/i);
    if (messageMatch && messageMatch[1]) {
      data.message = messageMatch[1].trim();
    }
  }
  
  if (!data.email) {
    const genericEmailMatch = emailText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (genericEmailMatch) {
      data.email = genericEmailMatch[0];
    }
  }
  
  if (!data.name && data.email) {
    const emailLocalPart = data.email.split('@')[0];
    data.name = emailLocalPart
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
  
  if (!data.name) {
    if (isWhatsAppRelated) {
      data.name = "Contact via WhatsApp";
    } else {
      data.name = "Contact sans nom";
    }
  }
  
  return data;
};
