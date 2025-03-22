
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      // Show loading toast
      toast({
        title: "Extraction en cours",
        description: "Récupération des informations de l'annonce..."
      });
      
      // Determine what kind of property URL this is
      const isFigaroUrl = propertyUrl.includes('lefigaro.fr') || propertyUrl.includes('proprietes.lefigaro');
      const isIdealistaUrl = propertyUrl.includes('idealista.com') || propertyUrl.includes('idealista.es');
      
      // First attempt: Try AI extraction via chat-gadait function
      try {
        const { data: aiData, error: aiError } = await supabase.functions.invoke('chat-gadait', {
          body: {
            type: 'extract-property',
            url: propertyUrl
          }
        });

        if (!aiError && (aiData?.data || aiData?.response)) {
          const responseData = aiData?.data || aiData?.response;
          const propertyData = typeof responseData === 'string' 
            ? JSON.parse(responseData) 
            : responseData;
          
          // Amélioration: Extraire l'identifiant Idealista
          if (isIdealistaUrl) {
            const idealistaIdMatch = propertyUrl.match(/idealista\.(?:com|es)\/(\d+)/);
            if (idealistaIdMatch && idealistaIdMatch[1]) {
              propertyData.reference = propertyData.reference || idealistaIdMatch[1];
            }
          }
          
          // Clean up and standardize the data
          const standardizedData = standardizePropertyData(propertyData, isFigaroUrl, isIdealistaUrl);
          setExtractedData(standardizedData);
          setIsLoading(false);
          
          toast({
            title: "Données extraites avec succès",
            description: "Les informations de l'annonce ont été récupérées."
          });
          return;
        }
      } catch (aiExtractError) {
        console.error("AI extraction error:", aiExtractError);
        // Proceed to fallback method
      }

      // Fallback: Try web scraping via scrape-website function
      toast({
        variant: "default",
        title: "Extraction avancée en cours",
        description: "Nous utilisons un système alternatif pour extraire les données..."
      });

      const { data: scrapedData, error: scrapeError } = await supabase.functions.invoke('scrape-website', {
        body: { url: propertyUrl }
      });

      if (scrapeError) {
        throw new Error(`Erreur lors du scraping: ${scrapeError.message}`);
      }

      if (scrapedData && Object.keys(scrapedData).length > 0) {
        // Amélioration: Extraire l'identifiant Idealista
        if (isIdealistaUrl) {
          const idealistaIdMatch = propertyUrl.match(/idealista\.(?:com|es)\/(\d+)/);
          if (idealistaIdMatch && idealistaIdMatch[1]) {
            scrapedData.reference = scrapedData.reference || idealistaIdMatch[1];
          }
        }
        
        // Clean up and standardize the data
        const standardizedData = standardizePropertyData(scrapedData, isFigaroUrl, isIdealistaUrl);
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
        
        // Create a minimal data object with the URL
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
    
    // Extraire l'identifiant de la propriété
    if (url.includes('idealista')) {
      const idealistaIdMatch = url.match(/idealista\.(?:com|es)\/(\d+)/);
      if (idealistaIdMatch && idealistaIdMatch[1]) {
        data.reference = idealistaIdMatch[1];
        data.source = 'Idealista';
      }
      
      // Essayer de détecter le pays pour Idealista
      if (url.includes('.es')) {
        data.country = 'Spain';
      } else if (url.includes('.pt')) {
        data.country = 'Portugal';
      } else if (url.includes('.it')) {
        data.country = 'Italy';
      }
    } else if (url.includes('lefigaro')) {
      const figaroIdMatch = url.match(/\/([a-zA-Z0-9-]+)(?:\?|$)/);
      if (figaroIdMatch && figaroIdMatch[1]) {
        data.reference = figaroIdMatch[1];
        data.source = 'Le Figaro';
      }
      data.country = 'France';
    }
    
    return data;
  };

  // Helper function to standardize property data
  const standardizePropertyData = (data: any, isFigaro: boolean, isIdealista: boolean) => {
    console.log("Raw data to standardize:", data);
    
    const standardizedData: any = {};

    if (isFigaro) {
      // Standardize data from Le Figaro
      standardizedData.propertyType = mapPropertyType(data.property_type || data.type || null);
      standardizedData.location = data.property_location || data.location || null;
      standardizedData.price = data.property_price || data.price || null;
      standardizedData.bedrooms = data.property_bedrooms || data.bedrooms || null;
      standardizedData.area = data.property_area || data.area || null;
      standardizedData.reference = data.reference || data.property_reference || null;
      standardizedData.description = data.description || null;
      standardizedData.country = 'France';
      standardizedData.source = 'Le Figaro';
    } else if (isIdealista) {
      // Standardize data from Idealista
      standardizedData.propertyType = mapPropertyType(data.tipoInmueble || data.propertyType || data.type || null);
      standardizedData.location = data.ubicacionAnuncio || data.location || null;
      standardizedData.price = data.precioAnuncio || data.price || null;
      standardizedData.bedrooms = data.habitaciones || data.bedrooms || null;
      standardizedData.reference = data.referenciaAnuncio || data.reference || null;
      standardizedData.description = data.descripcion || data.description || null;
      standardizedData.area = data.superficie || data.area || null;
      
      // Déterminer le pays pour Idealista
      if (propertyUrl.includes('.es')) {
        standardizedData.country = 'Spain';
      } else if (propertyUrl.includes('.pt')) {
        standardizedData.country = 'Portugal';
      } else if (propertyUrl.includes('.it')) {
        standardizedData.country = 'Italy';
      }
      
      standardizedData.source = 'Idealista';
    } else {
      // Generic standardization
      standardizedData.propertyType = mapPropertyType(data.propertyType || data.type || data['Property type'] || null);
      standardizedData.location = data.location || data.Location || null;
      standardizedData.price = data.price || data.Price || null;
      standardizedData.bedrooms = data.bedrooms || data['Number of bedrooms'] || null;
      standardizedData.area = data.area || data.Size || data['Size or area'] || null;
      standardizedData.reference = data.reference || data['Property reference'] || null;
      standardizedData.country = data.country || data.Country || null;
      standardizedData.description = data.description || data.Description || null;
    }

    // Add more generic fields
    standardizedData.title = data.title || data.name || null;
    standardizedData.url = data.url || propertyUrl || null;

    console.log("Standardized data:", standardizedData);
    return standardizedData;
  };
  
  // Fonction pour mapper les types de propriété
  const mapPropertyType = (type: string | null): string | null => {
    if (!type) return null;
    
    const typeLC = type.toLowerCase();
    
    // Map des types en espagnol/anglais vers français
    const typeMapping: Record<string, string> = {
      'villa': 'Villa',
      'casa': 'Maison',
      'house': 'Maison',
      'apartment': 'Appartement',
      'apartamento': 'Appartement',
      'piso': 'Appartement',
      'penthouse': 'Penthouse',
      'atico': 'Penthouse',
      'land': 'Terrain',
      'terreno': 'Terrain',
      'parcela': 'Terrain',
      'chalet': 'Chalet',
      'mansion': 'Manoir',
      'townhouse': 'Maison de ville',
      'castle': 'Château',
      'château': 'Château',
      'commercial': 'Commercial',
      'local': 'Local commercial',
      'duplex': 'Duplex'
    };
    
    for (const [key, value] of Object.entries(typeMapping)) {
      if (typeLC.includes(key)) {
        return value;
      }
    }
    
    return type; // Retourner le type original si aucune correspondance n'est trouvée
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
