
import React from 'react';
import { Home, Loader, ArrowRight, ChevronDown, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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
        
        <Card className="border-loro-sand p-4">
          <p className="text-sm text-loro-hazel mb-3">
            Entrez l'URL d'une propriété pour extraire automatiquement ses informations.
          </p>
          
          <div className="relative border border-loro-sand rounded-md overflow-hidden">
            <Input
              type="text"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
              placeholder="https://www.exemple-immobilier.com/propriete/123"
              value={propertyUrl}
              onChange={(e) => setPropertyUrl(e.target.value)}
            />
            
            <Button 
              size="icon"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-8 w-8 ${
                propertyUrl.trim() ? 'bg-loro-hazel hover:bg-loro-hazel/90' : 'bg-loro-sand/50'
              } text-white`}
              onClick={extractPropertyData}
              disabled={isLoading || !propertyUrl.trim()}
            >
              {isLoading ? 
                <Loader className="h-4 w-4 animate-spin" /> : 
                <Send className="h-4 w-4" />
              }
            </Button>
          </div>
        </Card>
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
