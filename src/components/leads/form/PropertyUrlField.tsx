
import React from 'react';
import { ExternalLink, Download, Sparkles, Loader2 } from 'lucide-react';
import FormInput from './FormInput';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface PropertyUrlFieldProps {
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExtract?: (url: string) => void;
  isLoading?: boolean;
}

const PropertyUrlField: React.FC<PropertyUrlFieldProps> = ({ 
  value, 
  onChange, 
  onExtract,
  isLoading = false
}) => {
  const handleExtractClick = () => {
    if (!value) {
      toast({
        variant: "destructive",
        title: "URL manquante",
        description: "Veuillez entrer l'URL d'une annonce immobilière avant d'extraire les données."
      });
      return;
    }
    
    if (value && onExtract) {
      try {
        toast({
          title: "Extraction en cours",
          description: "Notre IA analyse l'annonce immobilière..."
        });
        onExtract(value);
      } catch (error) {
        console.error("Erreur lors de l'extraction:", error);
        toast({
          variant: "destructive",
          title: "Erreur d'extraction",
          description: "Une erreur s'est produite lors de l'extraction des données."
        });
      }
    }
  };

  // Déterminer le nom du portail immobilier en fonction de l'URL
  const getPortalName = (url: string | undefined): string => {
    if (!url) return '';
    
    if (url.includes('idealista.com') || url.includes('idealista.es')) {
      return 'Idealista';
    } else if (url.includes('lefigaro.fr')) {
      return 'Le Figaro';
    } else if (url.includes('properstar.com')) {
      return 'Properstar';
    } else if (url.includes('propertycloud.fr')) {
      return 'Property Cloud';
    } else if (url.includes('lexpress-property.com')) {
      return 'L\'express Property';
    }
    
    return 'Annonce';
  };

  return (
    <div className="relative">
      <FormInput
        label="URL de l'annonce"
        name="url"
        value={value || ''}
        onChange={onChange}
        placeholder="https://exemple-immobilier.com/propriete/123"
        icon={ExternalLink}
      />
      
      <div className="mt-2 flex gap-2 items-center">
        {value && (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-blue-600 hover:underline flex items-center"
          >
            <ExternalLink size={14} className="mr-1" /> 
            Voir l'annonce {getPortalName(value) && `(${getPortalName(value)})`}
          </a>
        )}
        
        {onExtract && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExtractClick} 
                  disabled={isLoading || !value}
                  className="ml-auto text-xs py-1 h-auto bg-loro-navy text-white hover:bg-loro-navy/90 flex items-center gap-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="mr-1 animate-spin" />
                      IA en analyse...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="mr-1" />
                      Extraire avec IA
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notre IA analyse l'annonce pour extraire automatiquement le pays, la localisation, le type de bien, le prix et plus encore</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {value && !onExtract && (
        <div className="mt-2 text-xs text-gray-500">
          Collez l'URL d'une annonce Idealista, Le Figaro ou autre portail immobilier pour analyser la propriété.
        </div>
      )}
    </div>
  );
};

export default PropertyUrlField;
