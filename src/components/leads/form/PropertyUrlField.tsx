
import React from 'react';
import { ExternalLink, Download } from 'lucide-react';
import FormInput from './FormInput';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PropertyUrlFieldProps {
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExtract?: (url: string) => void;
}

const PropertyUrlField: React.FC<PropertyUrlFieldProps> = ({ value, onChange, onExtract }) => {
  const handleExtractClick = () => {
    if (value && onExtract) {
      onExtract(value);
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
      
      {value && (
        <div className="mt-2 flex gap-2">
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-blue-600 hover:underline flex items-center"
          >
            <ExternalLink size={14} className="mr-1" /> 
            Voir l'annonce {getPortalName(value) && `(${getPortalName(value)})`}
          </a>
          
          {onExtract && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExtractClick} 
                    className="ml-auto text-xs py-1 h-auto bg-loro-navy text-white hover:bg-loro-navy/90 flex items-center gap-1"
                  >
                    <Download size={14} />
                    Extraire les données
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Récupère automatiquement les infos de l'annonce et remplit le formulaire</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyUrlField;
