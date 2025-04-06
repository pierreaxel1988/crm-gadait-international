
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
  onChange?: (data: LeadDetailed) => void;
  onCancel: () => void;
  activeTab?: string;
  adminAssignedAgent?: string | undefined;
  isSubmitting?: boolean;
  hideSubmitButton?: boolean;
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
  onChange,
  onCancel, 
  activeTab = 'general',
  adminAssignedAgent,
  isSubmitting = false,
  hideSubmitButton = false
}) => {
  const [formData, setFormData] = useState<LeadDetailed>({
    id: lead?.id || uuidv4(),
    name: lead?.name || '',
    salutation: lead?.salutation || undefined,
    email: lead?.email || '',
    phone: lead?.phone || '',
    phoneCountryCode: lead?.phoneCountryCode || '+33',
    phoneCountryCodeDisplay: lead?.phoneCountryCodeDisplay || '🇫🇷',
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
    preferredLanguage: lead?.preferredLanguage || '',
    taskType: lead?.taskType || undefined,
    notes: lead?.notes || '',
    url: lead?.url || '',
    pipelineType: lead?.pipelineType || 'purchase',
    taxResidence: lead?.taxResidence || '',
  });

  useEffect(() => {
    if (adminAssignedAgent !== undefined) {
      setFormData(prev => ({ ...prev, assignedTo: adminAssignedAgent }));
    }
  }, [adminAssignedAgent]);

  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData, onChange]);

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

  const findBestMatchingLocation = (location: string, country: string): string | undefined => {
    if (!location || !country) return undefined;
    
    const availableLocations = LOCATIONS_BY_COUNTRY[country as keyof typeof LOCATIONS_BY_COUNTRY];
    if (!availableLocations) return undefined;
    
    const exactMatch = availableLocations.find(loc => 
      loc.toLowerCase() === location.toLowerCase()
    );
    
    if (exactMatch) return exactMatch;
    
    const partialMatch = availableLocations.find(loc => 
      location.toLowerCase().includes(loc.toLowerCase()) || 
      loc.toLowerCase().includes(location.toLowerCase())
    );
    
    return partialMatch;
  };

  useEffect(() => {
    if (extractedData) {
      setFormData(prev => {
        const source = detectSourceFromUrl(propertyUrl);
        let country = extractedData.country || prev.country;
        
        let propertyTypes = prev.propertyTypes || [];
        if (extractedData.propertyType && !propertyTypes.includes(extractedData.propertyType as PropertyType)) {
          propertyTypes = [...propertyTypes, extractedData.propertyType as PropertyType];
        }
        
        let bedroomsValue = prev.bedrooms;
        if (extractedData.bedrooms) {
          const bedrooms = typeof extractedData.bedrooms === 'string' 
            ? parseInt(extractedData.bedrooms.toString())
            : extractedData.bedrooms;
          
          if (!isNaN(bedrooms)) {
            if (Array.isArray(prev.bedrooms)) {
              if (!prev.bedrooms.includes(bedrooms)) {
                bedroomsValue = [...prev.bedrooms, bedrooms];
              }
            } else {
              bedroomsValue = [bedrooms];
            }
          }
        }

        let budgetValue = prev.budget;
        if (extractedData.price) {
          const priceText = extractedData.price.toString();
          const priceNumbers = priceText.replace(/[^\d,\.]/g, '').replace(',', '.');
          if (!isNaN(parseFloat(priceNumbers))) {
            budgetValue = priceNumbers;
          } else {
            budgetValue = extractedData.price;
          }
        }

        let amenities = prev.amenities || [];
        if (extractedData.amenities && Array.isArray(extractedData.amenities)) {
          extractedData.amenities.forEach((amenity: string) => {
            if (!amenities.includes(amenity)) {
              amenities.push(amenity);
            }
          });
        }
        
        if (extractedData.description) {
          const description = extractedData.description.toLowerCase();
          AMENITIES.forEach(amenity => {
            if (description.includes(amenity.toLowerCase()) && !amenities.includes(amenity)) {
              amenities.push(amenity);
            }
          });
        }

        let livingArea = prev.livingArea;
        if (extractedData.area) {
          const areaString = extractedData.area.toString();
          const areaMatch = areaString.match(/(\d+)/);
          if (areaMatch) {
            livingArea = areaMatch[1];
          }
        }

        let desiredLocation = prev.desiredLocation;
        if (extractedData.location && country) {
          const bestMatch = findBestMatchingLocation(extractedData.location, country);
          if (bestMatch) {
            desiredLocation = bestMatch;
          } else if (country === 'Spain' && extractedData.location.toLowerCase().includes('marbella')) {
            desiredLocation = 'Marbella';
          } else if (country === 'Spain' && extractedData.location.toLowerCase().includes('malaga')) {
            desiredLocation = 'Malaga';
          }
          
          if (!desiredLocation) {
            const formattedLocation = extractedData.location.charAt(0).toUpperCase() + 
                                      extractedData.location.slice(1).toLowerCase();
            desiredLocation = formattedLocation;
          }
        }

        return {
          ...prev,
          propertyReference: extractedData.reference || prev.propertyReference,
          budget: budgetValue,
          desiredLocation,
          propertyTypes,
          bedrooms: bedroomsValue,
          url: propertyUrl || prev.url,
          source: source || prev.source,
          country,
          amenities,
          livingArea,
          currency: extractedData.currency || prev.currency
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
    console.log("Form submission triggered, isSubmitting:", isSubmitting);
    console.log("Submitting form data:", formData);
    
    if (!formData.name) {
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: "Le nom du lead est requis."
      });
      return;
    }
    
    console.log("Budget value being submitted:", formData.budget);
    console.log("Desired location being submitted:", formData.desiredLocation);
    
    if (!isSubmitting) {
      onSubmit(formData);
    } else {
      console.log("Submission already in progress, ignoring click");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue={activeTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-4 hidden">
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
            extractLoading={isLoading}
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

      {!hideSubmitButton && (
        <div className="flex justify-end space-x-3 pt-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="relative bg-chocolate-dark hover:bg-chocolate-light"
          >
            {isSubmitting ? 'Sauvegarde en cours...' : (lead ? 'Sauvegarder' : 'Créer')}
            {isSubmitting && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            )}
          </Button>
        </div>
      )}
    </form>
  );
};

export default LeadForm;
