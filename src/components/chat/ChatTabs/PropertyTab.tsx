
import React from 'react';
import { Home, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import EnhancedInput from '../EnhancedInput';
import { useNavigate } from 'react-router-dom';
import { createLead } from '@/services/leadCore';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from "@/components/common/StatusBadge";
import { LeadTag } from "@/components/common/TagBadge";

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
  const navigate = useNavigate();

  const handleCreateLead = async () => {
    if (!extractedData) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucune donnée extraite disponible."
      });
      return;
    }

    try {
      // Préparer les données du lead à partir des données extraites
      const newLeadData = {
        name: extractedData.title || "Prospect via annonce",
        email: "",
        phone: "",
        location: extractedData.location || "",
        status: "New" as LeadStatus,
        tags: ["Imported"] as string[],
        propertyReference: extractedData.reference || "",
        budget: extractedData.price || "",
        desiredLocation: extractedData.location || "",
        propertyType: extractedData.propertyType || "",
        bedrooms: extractedData.bedrooms ? parseInt(extractedData.bedrooms.toString()) : undefined,
        nationality: "",
        notes: `Intéressé par l'annonce: ${propertyUrl}`,
        url: propertyUrl,
        pipelineType: "purchase" as "purchase" | "rental"
      };

      // Créer le lead
      const createdLead = await createLead(newLeadData);
      
      toast({
        title: "Lead créé",
        description: "Un nouveau lead a été créé avec les informations de l'annonce."
      });

      // Rediriger vers la page d'édition du lead
      navigate(`/leads/${createdLead.id}`);
    } catch (error) {
      console.error('Erreur lors de la création du lead:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le lead."
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          <h3 className="font-timesNowSemi text-lg mb-2 text-loro-navy">Extraction de propriété</h3>
          
          <Card className="border-loro-sand/30 p-4 shadow-sm bg-loro-white">
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
            <div className="border border-loro-sand/30 rounded-md p-4 mt-4 bg-loro-pearl/20 shadow-sm transition-all duration-300 animate-fade-in">
              <h4 className="font-timesNowSemi text-lg mb-3 flex items-center justify-between text-loro-navy">
                Données extraites
                <ChevronDown className="h-4 w-4 text-loro-hazel" />
              </h4>
              <div className="space-y-2 text-sm max-h-[400px] overflow-y-auto">
                {Object.entries(extractedData).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-loro-sand/30 pb-1">
                    <span className="font-medium text-loro-navy">{key}:</span>
                    <span className="text-loro-hazel">{String(value)}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col space-y-2 mt-4">
                <Button 
                  className="w-full bg-loro-hazel hover:bg-loro-hazel/90 text-white transition-all duration-200"
                  onClick={handleCreateLead}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Créer un lead avec ces données
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-loro-hazel text-loro-hazel hover:bg-loro-hazel/10"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Ajouter à un lead existant
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PropertyTab;
