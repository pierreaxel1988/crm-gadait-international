
import React from 'react';
import { ExternalLink } from 'lucide-react';
import FormInput from './FormInput';
import { Button } from '@/components/ui/button';

interface PropertyUrlFieldProps {
  url?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExtract?: (url: string) => void;
}

const PropertyUrlField: React.FC<PropertyUrlFieldProps> = ({ url, onChange, onExtract }) => {
  const handleExtractClick = () => {
    if (url && onExtract) {
      onExtract(url);
    }
  };

  return (
    <div className="relative">
      <FormInput
        label="URL de l'annonce"
        name="url"
        value={url || ''}
        onChange={onChange}
        placeholder="https://exemple-immobilier.com/propriete/123"
        icon={ExternalLink}
      />
      
      {url && (
        <div className="mt-2 flex gap-2">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-blue-600 hover:underline flex items-center"
          >
            <ExternalLink size={14} className="mr-1" /> 
            Voir l'annonce
          </a>
          
          {onExtract && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleExtractClick} 
              className="ml-auto text-xs py-1 h-auto bg-loro-navy text-white hover:bg-loro-navy/90"
            >
              Extraire les données
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyUrlField;
