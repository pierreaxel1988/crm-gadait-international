
import React from 'react';
import { Home, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import EnhancedInput from '../EnhancedInput';

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
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          <h3 className="font-timesNowSemi text-lg mb-2 text-loro-navy">Extraction de propriété</h3>
          
          <Card className="border-loro-sand p-4">
            <p className="text-sm text-loro-hazel mb-3">
              Entrez l'URL d'une propriété pour extraire automatiquement ses informations.
            </p>
            
            <EnhancedInput
              input={propertyUrl}
              setInput={setPropertyUrl}
              placeholder="https://www.exemple-immobilier.com/propriete/123"
              isLoading={isLoading}
              handleSend={extractPropertyData}
            />
          </Card>
          
          {extractedData && (
            <div className="border border-loro-sand rounded-md p-4 mt-2 bg-loro-pearl/30">
              <h4 className="font-timesNowSemi text-lg mb-3 flex items-center justify-between text-loro-navy">
                Données extraites
                <ChevronDown className="h-4 w-4" />
              </h4>
              <div className="space-y-2 text-sm max-h-[400px] overflow-y-auto">
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
      </ScrollArea>
    </div>
  );
};

export default PropertyTab;
