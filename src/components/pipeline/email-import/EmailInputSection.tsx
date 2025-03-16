
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { extractLefigaroPropertyDetails } from '@/components/chat/utils/emailParsingUtils';
import { normalizePropertyType } from '@/components/chat/utils/propertyTypeUtils';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';

interface EmailInputSectionProps {
  emailContent: string;
  setEmailContent: (content: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setExtractedData: (data: any) => void;
  setEditableData: (data: any) => void;
}

const EmailInputSection: React.FC<EmailInputSectionProps> = ({
  emailContent,
  setEmailContent,
  isLoading,
  setIsLoading,
  setExtractedData,
  setEditableData
}) => {
  const handleExtractEmail = async () => {
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
      let propertyDetails = {};
      
      if (emailContent.includes('Propriétés Le Figaro')) {
        propertyDetails = extractLefigaroPropertyDetails(emailContent);
      }
      
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
        
        if (propertyDetails && Object.keys(propertyDetails).length > 0) {
          Object.keys(propertyDetails).forEach(key => {
            if (propertyDetails[key] && !jsonData[key]) {
              jsonData[key] = propertyDetails[key];
            }
          });
        }
        
        if (jsonData.propertyType || jsonData.property_type) {
          jsonData.propertyType = normalizePropertyType(jsonData.propertyType || jsonData.property_type);
        }
        
        if (jsonData.country && !jsonData.nationality) {
          jsonData.nationality = deriveNationalityFromCountry(jsonData.country);
        }
        
        setExtractedData(jsonData);
        setEditableData(jsonData);
        
        toast({
          title: "Données extraites",
          description: "Les informations ont été extraites avec succès."
        });
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        setExtractedData({ raw: data.response });
        setEditableData({ raw: data.response });
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

  return (
    <ScrollArea className="flex-1 overflow-auto pr-4">
      <div className="space-y-4">
        <div>
          <Textarea
            placeholder="Collez le contenu de l'email ici..."
            className="min-h-[200px] resize-none"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
          />
          <Button 
            className="mt-2 w-full bg-loro-navy hover:bg-loro-navy/90" 
            onClick={handleExtractEmail}
            disabled={isLoading || !emailContent.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extraction en cours...
              </>
            ) : (
              'Extraire les informations'
            )}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

export default EmailInputSection;
