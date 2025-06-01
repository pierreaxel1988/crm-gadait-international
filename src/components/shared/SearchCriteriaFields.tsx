
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Euro, DollarSign, PoundSterling } from 'lucide-react';
import { LeadDetailed, Currency } from '@/types/lead';
import MultiSelectButtons from '@/components/leads/form/MultiSelectButtons';
import { Button } from '@/components/ui/button';
import { getTranslation } from '@/utils/languageUtils';

interface SearchCriteriaFieldsProps {
  formData: Partial<LeadDetailed>;
  onDataChange: (data: Partial<LeadDetailed>) => void;
  isPublicForm?: boolean;
  language?: 'fr' | 'en';
}

const SearchCriteriaFields = ({ formData, onDataChange, isPublicForm = false, language = 'fr' }: SearchCriteriaFieldsProps) => {
  // Translations for form fields
  const t = (key: string) => {
    const translations = {
      fr: {
        desiredLocation: "Localisation souhaitée",
        budget: "Budget maximum",
        budgetMin: "Budget minimum", 
        propertyType: "Type de propriété",
        bedrooms: "Nombre de chambres",
        livingArea: "Surface habitable (m²)",
        landArea: "Surface terrain (m²)",
        views: "Vues",
        amenities: "Équipements",
        purchaseTimeframe: "Délai d'achat",
        financingMethod: "Mode de financement",
        propertyUse: "Usage du bien",
        nationality: "Nationalité",
        taxResidence: "Résidence fiscale",
        preferredLanguage: "Langue préférée",
        regions: "Régions (Maurice)",
        immediately: "Immédiatement",
        within3months: "Dans les 3 mois",
        within6months: "Dans les 6 mois", 
        within1year: "Dans l'année",
        norush: "Pas pressé",
        cash: "Comptant",
        mortgage: "Crédit",
        mixed: "Mixte",
        other: "Autre",
        primary: "Résidence principale",
        secondary: "Résidence secondaire",
        investment: "Investissement",
        commercial: "Commercial",
        french: "Français",
        english: "Anglais",
        german: "Allemand",
        italian: "Italien",
        spanish: "Espagnol",
        north: "Nord",
        south: "Sud",
        east: "Est",
        west: "Ouest",
        central: "Centre"
      },
      en: {
        desiredLocation: "Desired location",
        budget: "Maximum budget",
        budgetMin: "Minimum budget",
        propertyType: "Property type", 
        bedrooms: "Number of bedrooms",
        livingArea: "Living area (m²)",
        landArea: "Land area (m²)",
        views: "Views",
        amenities: "Amenities",
        purchaseTimeframe: "Purchase timeframe",
        financingMethod: "Financing method",
        propertyUse: "Property use",
        nationality: "Nationality",
        taxResidence: "Tax residence",
        preferredLanguage: "Preferred language",
        regions: "Regions (Mauritius)",
        immediately: "Immediately",
        within3months: "Within 3 months",
        within6months: "Within 6 months",
        within1year: "Within 1 year", 
        norush: "No rush",
        cash: "Cash",
        mortgage: "Mortgage",
        mixed: "Mixed",
        other: "Other",
        primary: "Primary residence",
        secondary: "Secondary residence", 
        investment: "Investment",
        commercial: "Commercial",
        french: "French",
        english: "English",
        german: "German",
        italian: "Italian",
        spanish: "Spanish",
        north: "North",
        south: "South",
        east: "East",
        west: "West",
        central: "Central"
      }
    };
    
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  const propertyTypes = language === 'en' ? [
    'Villa', 'Apartment', 'House', 'Land', 'Other'
  ] : [
    'Appartement', 'Penthouse', 'Maison', 'Duplex', 'Chalet', 'Terrain', 
    'Manoir', 'Maison de ville', 'Château', 'Local commercial', 'Commercial', 
    'Hotel', 'Vignoble', 'Autres'
  ];

  const bedroomOptions = ['1', '2', '3', '4', '5', '6+'];
  
  const viewOptions = language === 'en' ? 
    ['Sea view', 'Mountain view', 'Garden view', 'City view', 'Pool view'] :
    ['Mer', 'Montagne', 'Golf', 'Autres'];
    
  const amenityOptions = language === 'en' ?
    ['Pool', 'Gym', 'Parking', 'Garden', 'Terrace', 'Balcony'] :
    ['Piscine', 'Terrasse', 'Jardin'];

  const mauritiusRegions = ['North', 'South', 'East', 'West', 'Central'];

  const currencies: Currency[] = ['EUR', 'USD', 'GBP', 'CHF', 'MUR', 'AED'];

  const getCurrencyIcon = (currency: Currency) => {
    switch (currency) {
      case 'EUR': return <Euro className="h-4 w-4" />;
      case 'USD': return <DollarSign className="h-4 w-4" />;
      case 'GBP': return <PoundSterling className="h-4 w-4" />;
      default: return <span className="text-xs font-medium">{currency}</span>;
    }
  };

  const handlePropertyTypeToggle = (type: string) => {
    const currentTypes = formData.propertyTypes || [];
    const newTypes = currentTypes.includes(type as any)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type as any];
    
    onDataChange({ propertyTypes: newTypes });
  };

  const handleBedroomToggle = (bedroom: string) => {
    const currentBedrooms = Array.isArray(formData.bedrooms) ? formData.bedrooms : [];
    const bedroomValue = bedroom === '6+' ? 6 : parseInt(bedroom);
    
    const newBedrooms = currentBedrooms.includes(bedroomValue)
      ? currentBedrooms.filter(b => b !== bedroomValue)
      : [...currentBedrooms, bedroomValue];
    
    console.log('Bedroom toggle in SearchCriteriaFields:', { bedroom, bedroomValue, currentBedrooms, newBedrooms });
    onDataChange({ bedrooms: newBedrooms });
  };

  const handleViewToggle = (view: string) => {
    const currentViews = formData.views || [];
    const newViews = currentViews.includes(view)
      ? currentViews.filter(v => v !== view)
      : [...currentViews, view];
    
    onDataChange({ views: newViews });
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = formData.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    onDataChange({ amenities: newAmenities });
  };

  const handleRegionToggle = (region: string) => {
    const currentRegions = formData.regions || [];
    const newRegions = currentRegions.includes(region)
      ? currentRegions.filter(r => r !== region)
      : [...currentRegions, region];
    
    onDataChange({ regions: newRegions });
  };

  return (
    <div className="space-y-6">
      {/* Localisation souhaitée */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-loro-navy">
          {t('desiredLocation')}
        </Label>
        <Input
          value={formData.desiredLocation || ''}
          onChange={(e) => onDataChange({ desiredLocation: e.target.value })}
          placeholder={language === 'en' ? "City, region, or specific area" : "Ville, région ou zone spécifique"}
          className="border-loro-sand/30 focus:border-loro-terracotta"
        />
      </div>

      {/* Budget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-loro-navy">
            {t('budgetMin')}
          </Label>
          <div className="relative">
            <Input
              type="text"
              value={formData.budgetMin || ''}
              onChange={(e) => onDataChange({ budgetMin: e.target.value })}
              placeholder="500 000"
              className="border-loro-sand/30 focus:border-loro-terracotta pr-12"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-loro-hazel">
              {getCurrencyIcon(formData.currency as Currency || 'EUR')}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium text-loro-navy">
            {t('budget')}
          </Label>
          <div className="relative">
            <Input
              type="text"
              value={formData.budget || ''}
              onChange={(e) => onDataChange({ budget: e.target.value })}
              placeholder="1 000 000"
              className="border-loro-sand/30 focus:border-loro-terracotta pr-12"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-loro-hazel">
              {getCurrencyIcon(formData.currency as Currency || 'EUR')}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-loro-navy">
            {language === 'en' ? 'Currency' : 'Devise'}
          </Label>
          <Select
            value={formData.currency || 'EUR'}
            onValueChange={(value) => onDataChange({ currency: value as Currency })}
          >
            <SelectTrigger className="border-loro-sand/30 focus:border-loro-terracotta">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency} value={currency}>
                  <div className="flex items-center gap-2">
                    {getCurrencyIcon(currency)}
                    <span>{currency}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Type de propriété */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-loro-navy">
          {t('propertyType')}
        </Label>
        <MultiSelectButtons
          options={propertyTypes as any}
          selectedValues={formData.propertyTypes || []}
          onToggle={handlePropertyTypeToggle}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
        />
      </div>

      {/* Nombre de chambres */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-loro-navy">
          {t('bedrooms')}
        </Label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {bedroomOptions.map(bedroom => {
            const bedroomValue = bedroom === '6+' ? 6 : parseInt(bedroom);
            const isSelected = Array.isArray(formData.bedrooms) && formData.bedrooms.includes(bedroomValue);
            
            return (
              <Button
                key={bedroom}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleBedroomToggle(bedroom)}
                className={`h-10 transition-all duration-200 ${
                  isSelected
                    ? 'bg-loro-hazel text-white border-loro-hazel hover:bg-loro-hazel/90'
                    : 'bg-white text-loro-navy border-loro-sand hover:bg-loro-pearl/20 hover:border-loro-hazel'
                }`}
              >
                {bedroom}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Surfaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-loro-navy">
            {t('livingArea')}
          </Label>
          <Input
            type="text"
            value={formData.livingArea || ''}
            onChange={(e) => onDataChange({ livingArea: e.target.value })}
            placeholder="150"
            className="border-loro-sand/30 focus:border-loro-terracotta"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium text-loro-navy">
            {t('landArea')}
          </Label>
          <Input
            type="text"
            value={formData.landArea || ''}
            onChange={(e) => onDataChange({ landArea: e.target.value })}
            placeholder="500"
            className="border-loro-sand/30 focus:border-loro-terracotta"
          />
        </div>
      </div>

      {/* Vues */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-loro-navy">
          {t('views')}
        </Label>
        <MultiSelectButtons
          options={viewOptions as any}
          selectedValues={formData.views || []}
          onToggle={handleViewToggle}
          className="grid grid-cols-2 md:grid-cols-3 gap-2"
        />
      </div>

      {/* Équipements */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-loro-navy">
          {t('amenities')}
        </Label>
        <MultiSelectButtons
          options={amenityOptions as any}
          selectedValues={formData.amenities || []}
          onToggle={handleAmenityToggle}
          className="grid grid-cols-2 md:grid-cols-3 gap-2"
        />
      </div>

      {/* Délai d'achat */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-loro-navy">
          {t('purchaseTimeframe')}
        </Label>
        <Select
          value={formData.purchaseTimeframe || ''}
          onValueChange={(value) => onDataChange({ purchaseTimeframe: value })}
        >
          <SelectTrigger className="border-loro-sand/30 focus:border-loro-terracotta">
            <SelectValue placeholder={language === 'en' ? "Select timeframe" : "Sélectionner un délai"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Immediately">{t('immediately')}</SelectItem>
            <SelectItem value="Within 3 months">{t('within3months')}</SelectItem>
            <SelectItem value="Within 6 months">{t('within6months')}</SelectItem>
            <SelectItem value="Within 1 year">{t('within1year')}</SelectItem>
            <SelectItem value="No rush">{t('norush')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mode de financement */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-loro-navy">
          {t('financingMethod')}
        </Label>
        <Select
          value={formData.financingMethod || ''}
          onValueChange={(value) => onDataChange({ financingMethod: value })}
        >
          <SelectTrigger className="border-loro-sand/30 focus:border-loro-terracotta">
            <SelectValue placeholder={language === 'en' ? "Select financing method" : "Sélectionner un mode de financement"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">{t('cash')}</SelectItem>
            <SelectItem value="Mortgage">{t('mortgage')}</SelectItem>
            <SelectItem value="Mixed">{t('mixed')}</SelectItem>
            <SelectItem value="Other">{t('other')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Usage du bien */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-loro-navy">
          {t('propertyUse')}
        </Label>
        <Select
          value={formData.propertyUse || ''}
          onValueChange={(value) => onDataChange({ propertyUse: value })}
        >
          <SelectTrigger className="border-loro-sand/30 focus:border-loro-terracotta">
            <SelectValue placeholder={language === 'en' ? "Select property use" : "Sélectionner l'usage du bien"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Primary residence">{t('primary')}</SelectItem>
            <SelectItem value="Secondary residence">{t('secondary')}</SelectItem>
            <SelectItem value="Investment">{t('investment')}</SelectItem>
            <SelectItem value="Commercial">{t('commercial')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Nationalité */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-loro-navy">
          {t('nationality')}
        </Label>
        <Input
          value={formData.nationality || ''}
          onChange={(e) => onDataChange({ nationality: e.target.value })}
          placeholder={language === 'en' ? "Nationality" : "Nationalité"}
          className="border-loro-sand/30 focus:border-loro-terracotta"
        />
      </div>

      {/* Résidence fiscale */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-loro-navy">
          {t('taxResidence')}
        </Label>
        <Input
          value={formData.taxResidence || ''}
          onChange={(e) => onDataChange({ taxResidence: e.target.value })}
          placeholder={language === 'en' ? "Tax residence" : "Résidence fiscale"}
          className="border-loro-sand/30 focus:border-loro-terracotta"
        />
      </div>

      {/* Langue préférée */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-loro-navy">
          {t('preferredLanguage')}
        </Label>
        <Select
          value={formData.preferredLanguage || ''}
          onValueChange={(value) => onDataChange({ preferredLanguage: value })}
        >
          <SelectTrigger className="border-loro-sand/30 focus:border-loro-terracotta">
            <SelectValue placeholder={language === 'en' ? "Select preferred language" : "Sélectionner une langue"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Français">{t('french')}</SelectItem>
            <SelectItem value="English">{t('english')}</SelectItem>
            <SelectItem value="Deutsch">{t('german')}</SelectItem>
            <SelectItem value="Italiano">{t('italian')}</SelectItem>
            <SelectItem value="Español">{t('spanish')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Régions Maurice */}
      {formData.country === 'Maurice' || formData.country === 'Mauritius' ? (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-loro-navy">
            {t('regions')}
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {mauritiusRegions.map(region => {
              const isSelected = formData.regions?.includes(region) || false;
              
              return (
                <Button
                  key={region}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRegionToggle(region)}
                  className={`h-10 transition-all duration-200 ${
                    isSelected
                      ? 'bg-loro-hazel text-white border-loro-hazel hover:bg-loro-hazel/90'
                      : 'bg-white text-loro-navy border-loro-sand hover:bg-loro-pearl/20 hover:border-loro-hazel'
                  }`}
                >
                  {t(region.toLowerCase())}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SearchCriteriaFields;
