
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
      // Affichage d'un toast de chargement
      toast({
        title: "Extraction en cours",
        description: "Analyse de l'annonce immobilière..."
      });
      
      // Utiliser la fonction Supabase pour scraper le site web
      const { data: scrapedData, error: scrapeError } = await supabase.functions.invoke('scrape-website', {
        body: { 
          url: propertyUrl,
          debug: true  // Activer le mode debug pour plus d'informations
        }
      });

      if (scrapeError) {
        throw new Error(`Erreur lors du scraping: ${scrapeError.message}`);
      }

      console.log("Données scrapées complètes:", scrapedData);

      // Extraire les données du premier élément de propriétés s'il existe
      const propertyData = scrapedData && scrapedData.properties && scrapedData.properties.length > 0 
        ? scrapedData.properties[0] 
        : scrapedData;

      console.log("Données de propriété extraites:", propertyData);

      if (propertyData && Object.keys(propertyData).length > 0) {
        // Standardiser les données
        const standardizedData = standardizePropertyData(propertyData, propertyUrl);
        console.log("Données standardisées:", standardizedData);
        setExtractedData(standardizedData);
        
        toast({
          title: "Données extraites avec succès",
          description: "Les informations de l'annonce ont été récupérées."
        });
      } else {
        // En cas d'échec d'extraction, essayons d'obtenir au moins des informations de base de l'URL
        const basicData = extractBasicDataFromUrl(propertyUrl);
        
        toast({
          variant: "default",
          title: "Extraction limitée",
          description: "Extraction de données de base à partir de l'URL."
        });
        
        // Créer un objet de données minimal avec l'URL
        setExtractedData({
          title: "Annonce immobilière",
          url: propertyUrl,
          ...basicData
        });
      }
    } catch (error) {
      console.error("Error extracting property data:", error);
      
      // Même en cas d'erreur, essayons d'extraire des informations de base de l'URL
      const basicData = extractBasicDataFromUrl(propertyUrl);
      
      if (Object.keys(basicData).length > 0) {
        setExtractedData({
          title: "Informations extraites de l'URL",
          url: propertyUrl,
          ...basicData
        });
        
        toast({
          title: "Extraction partielle",
          description: "Seules les informations basiques ont pu être extraites de l'URL."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur d'extraction",
          description: "Impossible d'extraire les données de cette annonce."
        });
        setExtractedData(null);
      }
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
    } else if (url.includes('the-private-collection')) {
      // Données spécifiques pour The Private Collection
      data.source = 'The Private Collection';
      
      // Tenter d'identifier le pays dans l'URL
      const countryMatch = url.match(/\/mauritius\/|\/morocco\/|\/spain\/|\/portugal\/|\/france\//i);
      if (countryMatch) {
        const country = countryMatch[0].replace(/\//g, '');
        data.country = country.charAt(0).toUpperCase() + country.slice(1).toLowerCase();
      } else {
        data.country = "Mauritius"; // Par défaut pour The Private Collection
      }
      
      // Extraire une référence possible de l'URL
      const refMatch = url.match(/\/property\/([a-zA-Z0-9-]+)/);
      if (refMatch && refMatch[1]) {
        data.reference = refMatch[1];
      }
    }
    
    return data;
  };

  // Fonction utilitaire pour standardiser les données de propriété
  const standardizePropertyData = (data: any, url: string) => {
    console.log("Données brutes à standardiser:", data);
    
    const isIdealista = url.includes('idealista');
    const isFigaro = url.includes('lefigaro');
    const isPrivateCollection = url.includes('the-private-collection');
    
    const standardizedData: any = {
      url: url
    };

    // Déterminer le pays
    if (data.country) {
      standardizedData.country = data.country;
    } else if (isIdealista) {
      standardizedData.country = url.includes('.es') ? 'Spain' : 
                              url.includes('.pt') ? 'Portugal' : 
                              url.includes('.it') ? 'Italy' : 'Spain';
    } else if (isFigaro) {
      standardizedData.country = 'France';
    } else if (isPrivateCollection) {
      standardizedData.country = 'Mauritius'; // Par défaut pour The Private Collection
    }

    // Standardisation des propriétés courantes
    standardizedData.title = data.Title || data.title || null;
    standardizedData.propertyType = normalizePropertyType(data.Property_Type || data["Property Type"] || '');
    standardizedData.location = data.Location || data.location || data.city || '';
    standardizedData.price = data.price || data.Price || '';
    standardizedData.bedrooms = data.Number_of_bedrooms || data.Bedrooms || '';
    standardizedData.bathrooms = data.Number_of_bathrooms || data.bathrooms || '';
    standardizedData.area = data.Size_or_area || data.Area || '';
    standardizedData.reference = data.Property_reference || data.reference || '';
    standardizedData.description = data.Description || data.description || '';
    
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
