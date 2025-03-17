
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ExtractedData } from '../types/chatTypes';

export const usePropertyExtraction = () => {
  const [propertyUrl, setPropertyUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const extractPropertyData = async () => {
    if (!propertyUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer l'URL d'une propriété."
      });
      return;
    }

    setIsLoading(true);
    try {
      // Essayer d'extraire des informations préliminaires depuis la structure de l'URL
      let initialPropertyData: Record<string, any> = {};
      
      // Extraction spécifique pour Le Figaro
      if (propertyUrl.includes('lefigaro.fr') || propertyUrl.includes('properties.lefigaro.com')) {
        const urlObj = new URL(propertyUrl);
        const pathParts = urlObj.pathname.split('/');
        
        // Extraction basique depuis la structure de l'URL
        if (pathParts.length > 2) {
          // Extraire le type de propriété et la localisation
          const typeLocationPart = pathParts.find(part => 
            part.includes('villa') || part.includes('appartement') || 
            part.includes('maison') || part.includes('penthouse'));
          
          if (typeLocationPart) {
            const propertyType = typeLocationPart.split('-')[0];
            initialPropertyData.propertyType = propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
          }
          
          // Chercher le pays dans l'URL
          const countryPart = pathParts.find(part => 
            part === 'espagne' || part === 'france' || part === 'portugal' || 
            part === 'italie' || part === 'grece');
          
          if (countryPart) {
            const countryMap: Record<string, string> = {
              'espagne': 'Spain',
              'france': 'France',
              'portugal': 'Portugal',
              'italie': 'Italy',
              'grece': 'Greece'
            };
            initialPropertyData.country = countryMap[countryPart] || countryPart.charAt(0).toUpperCase() + countryPart.slice(1);
          }
          
          // Chercher la référence à la fin (généralement un nombre)
          const idPart = pathParts[pathParts.length - 1];
          if (idPart && /^\d+\/?$/.test(idPart)) {
            initialPropertyData.reference = idPart.replace('/', '');
          }
        }
      }

      console.log('Initial data extracted from URL:', initialPropertyData);

      // Appeler la fonction de scraping pour extraire plus de données
      try {
        // D'abord, essayer d'utiliser la fonction d'extraction avec IA
        const { data: aiData, error: aiError } = await supabase.functions.invoke('chat-gadait', {
          body: { 
            type: 'property-extract', 
            content: propertyUrl,
            initialData: initialPropertyData 
          }
        });

        if (!aiError && aiData?.response) {
          try {
            const jsonData = JSON.parse(aiData.response);
            setExtractedData(jsonData);
            
            toast({
              title: "Données extraites",
              description: "Les informations de la propriété ont été extraites avec succès."
            });
            setIsLoading(false);
            return;
          } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            // Continuer avec la méthode de fallback
          }
        }
        
        // Fallback: utiliser la fonction de scraping standard
        const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('scrape-website', {
          body: { url: propertyUrl }
        });

        if (scrapeError) {
          throw new Error(scrapeError.message);
        }

        if (scrapeData && scrapeData.properties && scrapeData.properties.length > 0) {
          const propertyData = scrapeData.properties[0];
          
          // Transformer les données scrapées au format attendu
          const formattedData = {
            title: propertyData.title,
            price: propertyData.price,
            location: propertyData.location,
            description: propertyData.description,
            reference: propertyData.reference,
            propertyType: initialPropertyData.propertyType || extractPropertyTypeFromTitle(propertyData.title),
            country: initialPropertyData.country || extractCountryFromLocation(propertyData.location),
            bedrooms: extractBedroomsFromDescription(propertyData.description),
            ...initialPropertyData
          };
          
          setExtractedData(formattedData);
          
          toast({
            title: "Données extraites",
            description: "Les informations de la propriété ont été extraites avec succès."
          });
        } else {
          setExtractedData({
            title: "Propriété extraite",
            url: propertyUrl,
            ...initialPropertyData
          });
          
          toast({
            variant: "default",
            title: "Extraction limitée",
            description: "Seules des informations basiques ont pu être extraites."
          });
        }
      } catch (error) {
        console.error('Error with scraping functions:', error);
        
        // Si toutes les méthodes échouent, utiliser au moins les données extraites de l'URL
        if (Object.keys(initialPropertyData).length > 0) {
          setExtractedData({
            title: "Propriété extraite",
            url: propertyUrl,
            ...initialPropertyData
          });
          
          toast({
            variant: "default",
            title: "Extraction limitée",
            description: "Seules des informations basiques ont pu être extraites."
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error extracting property data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'extraire les données de la propriété."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions utilitaires pour l'extraction
  const extractPropertyTypeFromTitle = (title: string): string => {
    const propertyTypes = ['villa', 'appartement', 'maison', 'penthouse', 'duplex', 'chalet'];
    for (const type of propertyTypes) {
      if (title.toLowerCase().includes(type)) {
        return type.charAt(0).toUpperCase() + type.slice(1);
      }
    }
    return '';
  };

  const extractCountryFromLocation = (location: string): string => {
    const countries = {
      'espagne': 'Spain',
      'spain': 'Spain',
      'france': 'France',
      'portugal': 'Portugal',
      'italie': 'Italy',
      'italy': 'Italy',
      'grece': 'Greece',
      'greece': 'Greece'
    };
    
    const locationLower = location.toLowerCase();
    for (const [key, value] of Object.entries(countries)) {
      if (locationLower.includes(key)) {
        return value;
      }
    }
    return '';
  };

  const extractBedroomsFromDescription = (description: string): number | undefined => {
    // Rechercher des patterns comme "3 chambres", "3 bedrooms", etc.
    const bedroomMatch = description.match(/(\d+)\s*(chambres?|bedrooms?|habitaciones?)/i);
    if (bedroomMatch && bedroomMatch[1]) {
      return parseInt(bedroomMatch[1], 10);
    }
    return undefined;
  };

  return {
    propertyUrl,
    setPropertyUrl,
    isLoading,
    extractedData,
    extractPropertyData
  };
};
