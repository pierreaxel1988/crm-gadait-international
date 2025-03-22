
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
const AMENITIES: Amenity[] = ['Piscine', 'Jardin', 'Garage', 'Sécurité', 'Climatisation', 'Terrasse', 'Balcon', 'Vue mer', 'Vue montagne', 'Gym', 'Spa', 'Piscine intérieure', 'Jacuzzi', 'Court de tennis', 'Ascenseur', 'Parking'];
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
    budgetMin: lead?.budgetMin || '',
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

  // Déterminer la source de l'annonce en fonction de l'URL
  const detectSourceFromUrl = (url: string): LeadSource | undefined => {
    if (!url) return undefined;
    
    if (url.includes('idealista.com') || url.includes('idealista.es')) {
      return 'Idealista';
    } else if (url.includes('lefigaro.fr') || url.includes('properties.lefigaro.com')) {
      return 'Le Figaro';
    } else if (url.includes('properstar.com')) {
      return 'Properstar';
    } else if (url.includes('propertycloud.fr')) {
      return 'Property Cloud';
    } else if (url.includes('lexpress-property.com')) {
      return 'L\'express Property';
    }
    
    return 'Portails immobiliers';
  };

  // Déterminer le pays en fonction de l'URL et du contenu
  const detectCountryFromUrl = (url: string, location?: string): Country | undefined => {
    if (!url) return undefined;
    
    if (url.includes('.es') || location?.includes('España') || location?.includes('Spain')) {
      return 'Spain';
    } else if (url.includes('.fr') || location?.includes('France')) {
      return 'France';
    } else if (url.includes('.pt') || location?.includes('Portugal')) {
      return 'Portugal';
    } else if (url.includes('.uk') || location?.includes('United Kingdom')) {
      return 'United Kingdom';
    } else if (url.includes('.ch') || location?.includes('Switzerland')) {
      return 'Switzerland';
    }
    
    return undefined;
  };

  useEffect(() => {
    if (extractedData) {
      setFormData(prev => {
        // Détecter la source et le pays à partir de l'URL
        const source = detectSourceFromUrl(propertyUrl);
        const country = detectCountryFromUrl(propertyUrl, extractedData.location);
        
        // Traiter les types de propriété
        let propertyTypes = prev.propertyTypes || [];
        if (extractedData.propertyType && !propertyTypes.includes(extractedData.propertyType as PropertyType)) {
          propertyTypes = [...propertyTypes, extractedData.propertyType as PropertyType];
        }
        
        // Convertir chambres en tableau si extrait de la propriété
        let bedroomsValue = prev.bedrooms;
        if (extractedData.bedrooms) {
          const extractedBedrooms = parseInt(extractedData.bedrooms.toString());
          if (Array.isArray(prev.bedrooms)) {
            if (!prev.bedrooms.includes(extractedBedrooms)) {
              bedroomsValue = [...prev.bedrooms, extractedBedrooms];
            }
          } else {
            bedroomsValue = [extractedBedrooms];
          }
        }

        // Convertir le prix en valeur numérique si possible
        let budgetValue = prev.budget;
        if (extractedData.price) {
          const priceText = extractedData.price.toString();
          // Extraire uniquement les chiffres du prix
          const priceNumbers = priceText.replace(/[^\d,\.]/g, '').replace(',', '.');
          if (!isNaN(parseFloat(priceNumbers))) {
            budgetValue = priceNumbers;
          } else {
            budgetValue = extractedData.price;
          }
        }

        // Extraire et définir les aménités si disponibles
        let amenities = prev.amenities || [];
        if (extractedData.description) {
          const description = extractedData.description.toLowerCase();
          AMENITIES.forEach(amenity => {
            if (description.includes(amenity.toLowerCase()) && !amenities.includes(amenity)) {
              amenities.push(amenity);
            }
          });
        }

        // Définir la surface habitable si disponible
        let livingArea = prev.livingArea;
        if (extractedData.area) {
          const areaString = extractedData.area.toString();
          const areaMatch = areaString.match(/(\d+)/);
          if (areaMatch) {
            livingArea = areaMatch[1];
          }
        }

        return {
          ...prev,
          propertyReference: extractedData.reference || prev.propertyReference,
          budget: budgetValue,
          desiredLocation: extractedData.location || prev.desiredLocation,
          propertyTypes,
          bedrooms: bedroomsValue,
          url: propertyUrl || prev.url,
          source: source || prev.source,
          country: country || prev.country,
          amenities,
          livingArea
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
