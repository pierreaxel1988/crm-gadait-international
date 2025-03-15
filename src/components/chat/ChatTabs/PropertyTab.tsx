
import React from 'react';
import { Home, Loader, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PropertyTabProps {
  propertyUrl: string;
  setPropertyUrl: (url: string) => void;
  extractPropertyData: () => void;
  isLoading: boolean;
  extractedData: any;
}

const PropertyTab: React.FC<PropertyTabProps> = ({
  propertyUrl,
  setPropertyUrl,
  extractPropertyData,
  isLoading,
  extractedData
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <div className="mb-4">
        <h3 className="font-timesNowSemi text-lg mb-2 text-loro-navy">Extraction de propriété</h3>
        <p className="text-sm text-loro-hazel mb-3">
          Entrez l'URL d'une propriété pour extraire automatiquement ses informations.
        </p>
        <div className="relative">
          <Input
            type="text"
            className="w-full border-loro-sand focus-visible:ring-loro-navy pr-14"
            placeholder="https://www.exemple-immobilier.com/propriete/123"
            value={propertyUrl}
            onChange={(e) => setPropertyUrl(e.target.value)}
          />
          <Button 
            className="absolute right-0 top-0 h-full px-3 bg-loro-hazel hover:bg-loro-hazel/90"
            onClick={extractPropertyData}
            disabled={isLoading || !propertyUrl.trim()}
          >
            {isLoading ? 
              <Loader className="h-4 w-4 animate-spin" /> : 
              <ArrowRight className="h-4 w-4" />
            }
          </Button>
        </div>
      </div>
      
      {extractedData && (
        <div className="border border-loro-sand rounded-md p-4 mt-2 bg-loro-pearl/30">
          <h4 className="font-timesNowSemi text-lg mb-3 flex items-center justify-between text-loro-navy">
            Données extraites
            <ChevronDown className="h-4 w-4" />
          </h4>
          <div className="space-y-2 text-sm">
            {Object.entries(extractedData).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
                <span className="font-medium text-loro-navy">{key}:</span>
                <span className="text-loro-hazel">{String(value)}</span>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full bg-loro-navy hover:bg-loro-navy/90">
            <ArrowRight className="h-4 w-4 mr-2" />
            Utiliser ces données
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertyTab;
