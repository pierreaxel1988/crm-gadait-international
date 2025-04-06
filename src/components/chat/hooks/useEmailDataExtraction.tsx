
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ExtractedData, PropertyDetails } from '../types/chatTypes';
import { extractLefigaroPropertyDetails } from '../utils/emailParsingUtils';
import { normalizePropertyType } from '../utils/propertyTypeUtils';
import { deriveNationalityFromCountry } from '../utils/nationalityUtils';

export const useEmailDataExtraction = () => {
  const [emailContent, setEmailContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  
  const extractEmailData = async () => {
    if (!emailContent.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez coller le contenu d'un email."
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, pre-process the email to extract property details if it's a Le Figaro email
      let propertyDetails: PropertyDetails = {};
      
      // Check if it's a Le Figaro email
      if (emailContent.includes('Propriétés Le Figaro')) {
        propertyDetails = extractLefigaroPropertyDetails(emailContent);
      }
      
      // Try to extract preferred language from email content
      const languagePattern = /langue\s*:?\s*([^\r\n]+)/i;
      const languageMatch = emailContent.match(languagePattern);
      if (languageMatch && languageMatch[1]) {
        propertyDetails.preferredLanguage = languageMatch[1].trim();
      }
      
      // Now proceed with the AI extraction, adding the property details we've extracted
      const { data, error } = await supabase.functions.invoke('chat-gadait', {
        body: { 
          type: 'email-extract', 
          content: emailContent,
          propertyDetails
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      try {
        const jsonData = JSON.parse(data.response);
        
        // Merge any property details we extracted with the AI response
        if (propertyDetails && Object.keys(propertyDetails).length > 0) {
          Object.keys(propertyDetails).forEach(key => {
            if (propertyDetails[key] && !jsonData[key]) {
              jsonData[key] = propertyDetails[key];
            }
          });
        }
        
        // Make sure property type is properly normalized to match our enum values
        if (jsonData.propertyType || jsonData.property_type) {
          jsonData.propertyType = normalizePropertyType(jsonData.propertyType || jsonData.property_type);
        }
        
        // Add nationality based on country if available
        if (jsonData.country && !jsonData.nationality) {
          jsonData.nationality = deriveNationalityFromCountry(jsonData.country);
        }
        
        // Normalize language information
        if (jsonData.language || jsonData.langue) {
          jsonData.preferredLanguage = jsonData.language || jsonData.langue;
        }
        
        setExtractedData(jsonData);
        
        toast({
          title: "Données extraites",
          description: "Les informations ont été extraites avec succès."
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
      console.error('Error extracting email data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'extraire les données de l'email."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetEmailExtraction = () => {
    setEmailContent("");
    setExtractedData(null);
  };
  
  return {
    emailContent,
    setEmailContent,
    isLoading,
    extractedData,
    extractEmailData,
    resetEmailExtraction
  };
};
