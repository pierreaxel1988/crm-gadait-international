import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadDetailed, PropertyType, ViewType, Amenity, Country, PurchaseTimeframe, FinancingMethod, PropertyUse, LeadSource, Currency } from '@/types/lead';
import GeneralInfoSection from './form/GeneralInfoSection';
import SearchCriteriaSection from './form/SearchCriteriaSection';
import StatusSection from './form/StatusSection';
import { usePropertyExtraction } from '../chat/hooks/usePropertyExtraction';
import { toast } from '@/hooks/use-toast';
import { LOCATIONS_BY_COUNTRY } from '@/utils/locationsByCountry';

interface LeadFormProps {
  lead?: LeadDetailed;
  onSubmit: (data: LeadDetailed) => void;
  onCancel: () => void;
  activeTab?: string;
  adminAssignedAgent?: string | undefined;
}

const PROPERTY_TYPES: PropertyType[] = [
  'Villa', 'Appartement', 'Penthouse', 'Maison', 'Duplex', 
  'Terrain', 'Chalet', 'Manoir', 'Maison de ville', 'Château',
  'Local commercial', 'Commercial', 'Hotel', 'Vignoble', 'Autres'
];

const VIEW_TYPES: ViewType[] = ['Mer', 'Montagne', 'Golf', 'Autres'];
const AMENITIES: Amenity[] = ['Piscine', 'Jardin', 'Garage', 'Sécurité'];
const PURCHASE_TIMEFRAMES: PurchaseTimeframe[] = ['Moins de trois mois', 'Plus de trois mois'];
const FINANCING_METHODS: FinancingMethod[] = ['Cash', 'Prêt bancaire'];
const PROPERTY_USES: PropertyUse[] = ['Investissement locatif', 'Résidence principale'];
const CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP', 'CHF'];
const COUNTRIES: Country[] = Object.keys(LOCATIONS_BY_COUNTRY) as Country[];
const LEAD_SOURCES: LeadSource[] = [
  'Site web', 'Réseaux sociaux', 'Portails immobiliers', 'Network', 
  'Repeaters', 'Recommandations', 'Apporteur d\'affaire', 'Idealista',
  'Le Figaro', 'Properstar', 'Property Cloud', 'L\'express Property'
];

const LeadForm: React.FC<LeadFormProps> = ({ 
  lead, 
  onSubmit, 
  onCancel, 
  activeTab = 'general',
  adminAssignedAgent 
}) => {
  const [formData, setFormData] = useState<LeadDetailed>({
    id: lead?.id || uuidv4(),
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    location: lead?.location || '',
    status: lead?.status || 'New',
    tags: lead?.tags || [],
    assignedTo: lead?.assignedTo || undefined,
    createdAt: lead?.createdAt || new Date().toISOString(),
    lastContactedAt: lead?.lastContactedAt || undefined,
    source: lead?.source || undefined,
    country: lead?.country || undefined,
    propertyReference: lead?.propertyReference || '',
    budget: lead?.budget || '',
    currency: lead?.currency || 'EUR',
    desiredLocation: lead?.desiredLocation || '',
    propertyType: lead?.propertyType || undefined,
    propertyTypes: lead?.propertyTypes || [],
    bedrooms: lead?.bedrooms || undefined,
    views: lead?.views || [],
    amenities: lead?.amenities || [],
    purchaseTimeframe: lead?.purchaseTimeframe || undefined,
    financingMethod: lead?.financingMethod || undefined,
    propertyUse: lead?.propertyUse || undefined,
    nationality: lead?.nationality || '',
    taskType: lead?.taskType || undefined,
    notes: lead?.notes || '',
    url: lead?.url || '',
    pipelineType: lead?.pipelineType || 'purchase'
  });

  useEffect(() => {
    if (adminAssignedAgent !== undefined) {
      setFormData(prev => ({ ...prev, assignedTo: adminAssignedAgent }));
    }
  }, [adminAssignedAgent]);

  const { 
    propertyUrl, 
    setPropertyUrl, 
    isLoading, 
    extractedData, 
    extractPropertyData 
  } = usePropertyExtraction();
  
  useEffect(() => {
    if (formData.url) {
      setPropertyUrl(formData.url);
    }
  }, [formData.url, setPropertyUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
  };

  const handleMultiSelectToggle = <T extends string>(name: keyof LeadDetailed, value: T) => {
    setFormData(prev => {
      const currentValues = prev[name] as T[] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [name]: newValues };
    });
  };

  const handleExtractUrl = (url: string) => {
    setPropertyUrl(url);
    extractPropertyData();
  };

  useEffect(() => {
    if (extractedData) {
      setFormData(prev => {
        let propertyTypes = prev.propertyTypes || [];
        if (extractedData.propertyType && !propertyTypes.includes(extractedData.propertyType as PropertyType)) {
          propertyTypes = [...propertyTypes, extractedData.propertyType as PropertyType];
        }

        return {
          ...prev,
          propertyReference: extractedData.reference || prev.propertyReference,
          budget: extractedData.price || prev.budget,
          desiredLocation: extractedData.location || prev.desiredLocation,
          propertyTypes,
          bedrooms: extractedData.bedrooms ? parseInt(extractedData.bedrooms.toString()) : prev.bedrooms,
          url: propertyUrl || prev.url
        };
      });

      toast({
        title: "Données extraites",
        description: "Les informations de la propriété ont été ajoutées au formulaire."
      });
    }
  }, [extractedData, propertyUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue={activeTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="criteria">Critères</TabsTrigger>
          <TabsTrigger value="status">Statut</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralInfoSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
            countries={COUNTRIES}
            sources={LEAD_SOURCES}
          />
        </TabsContent>

        <TabsContent value="criteria" className="space-y-6">
          <SearchCriteriaSection 
            formData={formData}
            handleInputChange={handleInputChange}
            handleNumberChange={handleNumberChange}
            handleMultiSelectToggle={handleMultiSelectToggle}
            propertyTypes={PROPERTY_TYPES}
            viewTypes={VIEW_TYPES}
            amenities={AMENITIES}
            purchaseTimeframes={PURCHASE_TIMEFRAMES}
            financingMethods={FINANCING_METHODS}
            propertyUses={PROPERTY_USES}
            onExtractUrl={handleExtractUrl}
            countries={COUNTRIES}
          />
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <StatusSection 
            formData={formData} 
            handleInputChange={handleInputChange}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3 pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {lead ? 'Sauvegarder' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;
