
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { normalizePropertyType } from '../utils/propertyTypeUtils';

export const usePropertyExtraction = () => {
  const [propertyUrl, setPropertyUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const resetExtraction = () => {
    setExtractedData(null);
  };

  const extractPropertyData = async () => {
    if (!propertyUrl) {
      toast({
        variant: "destructive",
        title: "URL manquante",
        description: "Veuillez entrer l'URL d'une annonce immobilière."
      });
      return;
    }

    setIsLoading(true);
    try {
      // Pour l'instant, extraction de données basiques depuis l'URL
      toast({
        title: "Extraction en cours",
        description: "Analyse de l'annonce immobilière..."
      });
      
      // Extraire des informations de base à partir de l'URL
      const basicData = extractBasicDataFromUrl(propertyUrl);
      
      if (Object.keys(basicData).length > 0) {
        setExtractedData({
          title: "Informations extraites de l'URL",
          url: propertyUrl,
          ...basicData
        });
        
        toast({
          title: "Extraction réussie",
          description: "Les informations de base ont été extraites de l'URL."
        });
      } else {
        // Créer un objet de données minimal avec l'URL
        setExtractedData({
          title: "Annonce immobilière",
          url: propertyUrl
        });
        
        toast({
          title: "URL enregistrée",
          description: "L'URL de l'annonce a été enregistrée."
        });
      }
    } catch (error) {
      console.error("Error extracting property data:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'extraction",
        description: "Impossible d'extraire les données de cette annonce."
      });
      setExtractedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Extraire des informations de base à partir de l'URL
  const extractBasicDataFromUrl = (url: string) => {
    const data: any = {};
    
    // Extraire l'identifiant de la propriété et autres informations
    if (url.includes('idealista')) {
      // Amélioration pour extraire la référence d'Idealista
      let idealistaId = '';
      const idealistaIdMatch = url.match(/idealista\.(?:com|es)\/([^\/]+)/);
      if (idealistaIdMatch && idealistaIdMatch[1]) {
        idealistaId = idealistaIdMatch[1];
      } else {
        // Alternative pour extraire le numéro de l'URL
        const refNumberMatch = url.match(/\/(\d{6,})/);
        if (refNumberMatch && refNumberMatch[1]) {
          idealistaId = refNumberMatch[1];
        }
      }
      
      if (idealistaId) {
        data.reference = idealistaId;
      }
      
      data.source = 'Idealista';
      
      // Essayer de détecter le pays pour Idealista
      if (url.includes('.es')) {
        data.country = 'Spain';
      } else if (url.includes('.pt')) {
        data.country = 'Portugal';
      } else if (url.includes('.it')) {
        data.country = 'Italy';
      }
      
      // Tenter d'extraire la localisation
      const locationMatches = url.match(/marbella|malaga|madrid|barcelona|valencia|sevilla|granada|ibiza/i);
      if (locationMatches && locationMatches[0]) {
        data.location = locationMatches[0].charAt(0).toUpperCase() + locationMatches[0].slice(1);
      }
      
      // Tenter d'extraire le type de propriété
      const typeMatches = url.match(/villa|chalet|casa|piso|apartamento/i);
      if (typeMatches && typeMatches[0]) {
        data.propertyType = typeMatches[0];
      }
    } else if (url.includes('lefigaro')) {
      const figaroIdMatch = url.match(/\/([a-zA-Z0-9-]+)(?:\?|$)/);
      if (figaroIdMatch && figaroIdMatch[1]) {
        data.reference = figaroIdMatch[1];
        data.source = 'Le Figaro';
      }
      data.country = 'France';
      
      // Tenter d'extraire la localisation
      const locationMatches = url.match(/paris|nice|cannes|antibes|lyon|bordeaux/i);
      if (locationMatches && locationMatches[0]) {
        data.location = locationMatches[0].charAt(0).toUpperCase() + locationMatches[0].slice(1);
      }
    } else if (url.includes('gadait-international')) {
      data.source = 'Gadait International';
      data.country = 'Mauritius';
      
      // Tenter d'extraire des informations depuis l'URL Gadait
      const locationMatches = url.match(/riviere-noire|bel-ombre|grand-baie|tamarin/i);
      if (locationMatches && locationMatches[0]) {
        data.location = locationMatches[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      const typeMatches = url.match(/villa|apartment|penthouse|house/i);
      if (typeMatches && typeMatches[0]) {
        data.propertyType = typeMatches[0];
      }
    }
    
    return data;
  };

  // Fonction utilitaire pour standardiser les données de propriété
  const standardizePropertyData = (data: any, url: string) => {
    console.log("Données brutes à standardiser:", data);
    
    const isIdealista = url.includes('idealista');
    const isFigaro = url.includes('lefigaro');
    const isGadait = url.includes('gadait-international');
    
    const standardizedData: any = {
      url: url
    };

    // Déterminer le pays
    if (data.Country) {
      standardizedData.country = data.Country;
    } else if (isIdealista) {
      standardizedData.country = url.includes('.es') ? 'Spain' : 
                              url.includes('.pt') ? 'Portugal' : 
                              url.includes('.it') ? 'Italy' : 'Spain';
    } else if (isFigaro) {
      standardizedData.country = 'France';
    } else if (isGadait) {
      standardizedData.country = 'Mauritius';
    }

    // Standardisation des propriétés courantes
    standardizedData.title = data.title || null;
    standardizedData.propertyType = normalizePropertyType(data.Property_type || '');
    standardizedData.location = data.Location || '';
    standardizedData.price = data.Price || '';
    standardizedData.bedrooms = data.Number_of_bedrooms || '';
    standardizedData.bathrooms = data.Number_of_bathrooms || '';
    standardizedData.area = data.Size_or_area || '';
    standardizedData.reference = data.Property_reference || '';
    standardizedData.description = data.Description || '';
    
    // Devise
    standardizedData.currency = data.Currency || 'EUR';
    
    // Amenities
    if (data.Key_features_and_amenities && Array.isArray(data.Key_features_and_amenities)) {
      standardizedData.amenities = data.Key_features_and_amenities;
    }

    // Nettoyer et s'assurer que l'URL est bien définie
    if (!standardizedData.url) {
      standardizedData.url = url;
    }

    console.log("Données standardisées:", standardizedData);
    return standardizedData;
  };

  return {
    propertyUrl,
    setPropertyUrl,
    isLoading,
    extractedData,
    extractPropertyData,
    resetExtraction
  };
};
