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

        if (!aiError && aiData?.data) {
          const propertyData = typeof aiData.data === 'string' 
            ? JSON.parse(aiData.data) 
            : aiData.data;
          
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
        variant: "default", // Changed from "warning" to "default"
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
        // Clean up and standardize the data
        const standardizedData = standardizePropertyData(scrapedData, isFigaroUrl, isIdealistaUrl);
        setExtractedData(standardizedData);
        
        toast({
          title: "Données extraites avec succès",
          description: "Les informations de l'annonce ont été récupérées."
        });
      } else {
        toast({
          variant: "default", // Changed from "warning" to "default"
          title: "Extraction limitée",
          description: "Nous n'avons pu extraire que des informations limitées de cette annonce."
        });
        
        // Create a minimal data object with just the URL for reference
        setExtractedData({
          title: "Annonce immobilière",
          url: propertyUrl
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

  // Helper function to standardize property data
  const standardizePropertyData = (data: any, isFigaro: boolean, isIdealista: boolean) => {
    const standardizedData: any = {};

    if (isFigaro) {
      // Standardize data from Le Figaro
      standardizedData.propertyType = data.property_type || data.type || null;
      standardizedData.location = data.property_location || data.location || null;
      standardizedData.price = data.property_price || data.price || null;
      standardizedData.bedrooms = data.property_bedrooms || data.bedrooms || null;
      standardizedData.area = data.property_area || data.area || null;
      standardizedData.reference = data.reference || data.property_reference || null;
    } else if (isIdealista) {
      // Standardize data from Idealista
      standardizedData.propertyType = data.tipoInmueble || data.propertyType || null;
      standardizedData.location = data.ubicacionAnuncio || data.location || null;
      standardizedData.price = data.precioAnuncio || data.price || null;
      // Idealista doesn't always provide number of bedrooms directly
      standardizedData.reference = data.referenciaAnuncio || data.reference || null;
    } else {
      // Generic standardization
      standardizedData.propertyType = data.propertyType || data.type || null;
      standardizedData.location = data.location || null;
      standardizedData.price = data.price || null;
      standardizedData.bedrooms = data.bedrooms || null;
      standardizedData.area = data.area || null;
      standardizedData.reference = data.reference || data.property_reference || null;
    }

    // Add more generic fields
    standardizedData.title = data.title || data.name || null;
    standardizedData.description = data.description || data.details || null;
    standardizedData.url = data.url || propertyUrl || null;

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
