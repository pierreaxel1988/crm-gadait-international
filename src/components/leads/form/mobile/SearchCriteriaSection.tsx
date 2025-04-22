
import React, { useState } from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, PurchaseTimeframe, FinancingMethod, PropertyUse, Country, MauritiusRegion } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import MultiSelectButtons from '../MultiSelectButtons';
import FormSection from '../FormSection';
import PropertyDetailsSection from '../sections/PropertyDetailsSection';
import PurchaseDetailsSection from '../sections/PurchaseDetailsSection';
import BuyerInfoSection from '../sections/BuyerInfoSection';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';

interface SearchCriteriaSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
  propertyTypes: PropertyType[];
  viewTypes: ViewType[];
  amenities: Amenity[];
  purchaseTimeframes: PurchaseTimeframe[];
  financingMethods: FinancingMethod[];
  propertyUses: PropertyUse[];
  onExtractUrl?: (url: string) => void;
  extractLoading?: boolean;
  countries: Country[];
}

const MAURITIUS_REGIONS: MauritiusRegion[] = ['North', 'South', 'West', 'East'];

const SearchCriteriaSection = ({
  lead,
  onDataChange,
  propertyTypes,
  viewTypes,
  amenities,
  purchaseTimeframes,
  financingMethods,
  propertyUses,
  onExtractUrl,
  extractLoading = false,
  countries,
}: SearchCriteriaSectionProps) => {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const generateDescription = async () => {
    try {
      setIsGeneratingDescription(true);
      
      const { data, error } = await supabase.functions.invoke('generate-property-description', {
        body: { propertyData: lead }
      });

      if (error) throw error;

      onDataChange({ 
        propertyDescription: data.description 
      });
      
      toast({
        title: "Description générée avec succès",
        description: "La description a été mise à jour avec la version générée par l'IA."
      });
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer la description. Veuillez réessayer."
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleCountryChangeWithNationality = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    const nationality = deriveNationalityFromCountry(selectedCountry);
    
    if (nationality) {
      onDataChange({ nationality: nationality });
    }
    onDataChange({ country: selectedCountry });
  };

  return (
    <FormSection title="Critères de Recherche">
      <ScrollArea className="h-[calc(100vh-350px)] pr-4">
        <div className="space-y-6">
          <Tabs defaultValue="property" className="w-full">
            <TabsList className="w-full mb-4 grid grid-cols-3">
              <TabsTrigger value="property">Propriété</TabsTrigger>
              <TabsTrigger value="purchase">Achat</TabsTrigger>
              <TabsTrigger value="buyer">Acheteur</TabsTrigger>
            </TabsList>
            
            <TabsContent value="property" className="space-y-6">
              <PropertyDetailsSection
                lead={lead}
                onDataChange={onDataChange}
                propertyTypes={propertyTypes}
                viewTypes={viewTypes}
                amenities={amenities}
                onExtractUrl={onExtractUrl}
                extractLoading={extractLoading}
                countries={countries}
                handleCountryChange={handleCountryChangeWithNationality}
              />
              {lead.country === 'Mauritius' && (
                <div className="space-y-2">
                  <Label className="text-sm">Régions souhaitées</Label>
                  <MultiSelectButtons 
                    options={MAURITIUS_REGIONS} 
                    selectedValues={lead.regions || []} 
                    onChange={(region) => onDataChange({ regions: lead.regions?.includes(region as MauritiusRegion) ? lead.regions.filter(r => r !== region) : [...(lead.regions || []), region as MauritiusRegion] })}
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Description du bien</Label>
                <div className="space-y-2">
                  <Textarea
                    name="propertyDescription"
                    value={lead.propertyDescription || ''}
                    onChange={(e) => onDataChange({ propertyDescription: e.target.value })}
                    placeholder="Description détaillée du bien"
                    className="min-h-[150px] w-full font-futura"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full bg-chocolate-light/10 hover:bg-chocolate-light/20 border-chocolate-dark/30" 
                    onClick={generateDescription}
                    disabled={isGeneratingDescription}
                  >
                    {isGeneratingDescription && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isGeneratingDescription ? "Génération en cours..." : "Générer une description avec l'IA"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="purchase" className="space-y-6 py-2">
              <PurchaseDetailsSection
                lead={lead}
                onDataChange={onDataChange}
                purchaseTimeframes={purchaseTimeframes}
                financingMethods={financingMethods}
                propertyUses={propertyUses}
              />
            </TabsContent>
            
            <TabsContent value="buyer" className="space-y-6 py-2">
              <BuyerInfoSection
                lead={lead}
                onDataChange={onDataChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </FormSection>
  );
};

export default SearchCriteriaSection;
