
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
      // Try to pre-extract info from the URL structure
      let initialPropertyData = {};
      if (propertyUrl.includes('lefigaro.com') || propertyUrl.includes('properties.lefigaro.com')) {
        const urlObj = new URL(propertyUrl);
        const pathParts = urlObj.pathname.split('/');
        
        // Basic extraction from URL structure
        if (pathParts.length > 2) {
          const typeLocationPart = pathParts[2] || '';
          const parts = typeLocationPart.split('-');
          
          if (parts.length > 0) {
            initialPropertyData = {
              ...initialPropertyData,
              propertyType: parts[0].replace(/-/g, ' ').trim()
            };
          }
          
          // Look for country in URL
          const countryPart = pathParts[pathParts.length - 2] || '';
          if (countryPart) {
            initialPropertyData = {
              ...initialPropertyData,
              country: countryPart.replace(/-/g, ' ').trim()
            };
          }
          
          // Look for ID at the end
          const idPart = pathParts[pathParts.length - 1] || '';
          if (idPart && /^\d+$/.test(idPart)) {
            initialPropertyData = {
              ...initialPropertyData,
              propertyReference: idPart
            };
          }
        }
      }

      const { data, error } = await supabase.functions.invoke('chat-gadait', {
        body: { 
          type: 'property-extract', 
          content: propertyUrl,
          initialData: initialPropertyData 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      try {
        const jsonData = JSON.parse(data.response);
        setExtractedData(jsonData);
        
        toast({
          title: "Données extraites",
          description: "Les informations de la propriété ont été extraites avec succès."
        });
      } catch (parseError) {
        setExtractedData({ raw: data.response });
        toast({
          variant: "destructive",
          title: "Format incorrect",
          description: "Les données n'ont pas pu être traitées correctement."
        });
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

  return {
    propertyUrl,
    setPropertyUrl,
    isLoading,
    extractedData,
    extractPropertyData
  };
};
