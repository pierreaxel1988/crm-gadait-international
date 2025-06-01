
import React, { useState, useRef, useEffect } from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, PurchaseTimeframe, FinancingMethod, PropertyUse, Currency } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MapPin, Home, Building, Bed, Eye, Star, Clock, CreditCard, Target, Crown, Building2, Mountain, TreePine, MoreHorizontal, Warehouse, Hotel, Grape, Waves, Compass, Droplets, Wind, Car, Shield, ArrowUp, Search, ChevronDown, X } from 'lucide-react';
import MultiSelectButtons from '@/components/leads/form/MultiSelectButtons';
import RadioSelectButtons from '@/components/leads/form/RadioSelectButtons';
import { countryToFlag } from '@/utils/countryUtils';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import { useCountriesFromDatabase } from '@/hooks/useCountriesFromDatabase';

interface SearchCriteriaFieldsProps {
  formData: Partial<LeadDetailed>;
  onDataChange: (data: Partial<LeadDetailed>) => void;
  isPublicForm?: boolean;
}

const SearchCriteriaFields: React.FC<SearchCriteriaFieldsProps> = ({
  formData,
  onDataChange,
  isPublicForm = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isTaxResidenceDropdownOpen, setIsTaxResidenceDropdownOpen] = useState(false);
  const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const taxResidenceDropdownRef = useRef<HTMLDivElement>(null);
  const nationalityDropdownRef = useRef<HTMLDivElement>(null);

  const { countries, loading } = useCountriesFromDatabase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      if (taxResidenceDropdownRef.current && !taxResidenceDropdownRef.current.contains(event.target as Node)) {
        setIsTaxResidenceDropdownOpen(false);
      }
      if (nationalityDropdownRef.current && !nationalityDropdownRef.current.contains(event.target as Node)) {
        setIsNationalityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onDataChange({ [name]: value });
  };

  const handleMultiSelectToggle = <T extends string>(field: keyof LeadDetailed, value: T) => {
    const currentValues = (formData[field] as T[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onDataChange({ [field]: newValues });
  };

  const handleBedroomToggle = (value: string) => {
    const numValue = value === "8+" ? 8 : parseInt(value);
    const currentBedrooms = Array.isArray(formData.bedrooms) 
      ? [...formData.bedrooms] 
      : formData.bedrooms 
      ? [formData.bedrooms] 
      : [];
    const newBedrooms = currentBedrooms.includes(numValue)
      ? currentBedrooms.filter(b => b !== numValue)
      : [...currentBedrooms, numValue];
    onDataChange({ bedrooms: newBedrooms.length ? newBedrooms : undefined });
  };

  const getSelectedBedrooms = () => {
    if (!formData.bedrooms) return [];
    if (Array.isArray(formData.bedrooms)) {
      return formData.bedrooms.map(num => num >= 8 ? "8+" : num.toString());
    }
    const value = formData.bedrooms;
    return [value >= 8 ? "8+" : value.toString()];
  };

  const filteredCountries = searchTerm
    ? countries.filter(country => 
        country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : countries;

  const handleCountrySelect = (country: string) => {
    const event = {
      target: {
        name: 'country',
        value: country
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
    setIsCountryDropdownOpen(false);
    setSearchTerm('');
  };

  const handleTaxResidenceSelect = (country: string) => {
    const event = {
      target: {
        name: 'taxResidence',
        value: country
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
    setIsTaxResidenceDropdownOpen(false);
    setSearchTerm('');

    // Auto-suggest nationality if not already set
    if (!formData.nationality) {
      const nationality = deriveNationalityFromCountry(country);
      if (nationality) {
        const nationalityEvent = {
          target: {
            name: 'nationality',
            value: nationality
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(nationalityEvent);
      }
    }
  };

  const handleNationalitySelect = (nationality: string) => {
    const event = {
      target: {
        name: 'nationality',
        value: nationality
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
    setIsNationalityDropdownOpen(false);
    setSearchTerm('');
  };

  const getPropertyTypeIcon = (type: PropertyType) => {
    switch (type) {
      case "Villa":
        return Home;
      case "Appartement":
        return Building;
      case "Penthouse":
        return Crown;
      case "Maison":
        return Home;
      case "Duplex":
        return Building2;
      case "Chalet":
        return Mountain;
      case "Terrain":
        return TreePine;
      case "Manoir":
        return Crown;
      case "Maison de ville":
        return Building2;
      case "Château":
        return Crown;
      case "Local commercial":
        return Warehouse;
      case "Commercial":
        return Building;
      case "Hotel":
        return Hotel;
      case "Vignoble":
        return Grape;
      case "Autres":
        return MoreHorizontal;
      default:
        return Home;
    }
  };

  const getViewTypeIcon = (type: ViewType) => {
    switch (type) {
      case "Mer":
        return Waves;
      case "Montagne":
        return Mountain;
      case "Golf":
        return TreePine;
      case "Autres":
        return MoreHorizontal;
      default:
        return Compass;
    }
  };

  const getAmenityIcon = (amenity: Amenity) => {
    switch (amenity) {
      case "Piscine":
        return Droplets;
      case "Terrasse":
        return Home;
      case "Balcon":
        return Building;
      case "Jardin":
        return TreePine;
      case "Parking":
        return Car;
      case "Ascenseur":
        return ArrowUp;
      case "Sécurité":
        return Shield;
      case "Climatisation":
        return Wind;
      default:
        return Star;
    }
  };

  const propertyTypesList: PropertyType[] = [
    "Villa", "Appartement", "Penthouse", "Maison", "Duplex", "Chalet", 
    "Terrain", "Manoir", "Maison de ville", "Château", "Local commercial", 
    "Commercial", "Hotel", "Vignoble", "Autres"
  ];

  const bedroomOptions = ["1", "2", "3", "4", "5", "6", "7", "8+"];

  const viewTypesList: ViewType[] = ["Mer", "Montagne", "Golf", "Autres"];

  const amenitiesList: Amenity[] = [
    "Piscine", "Terrasse", "Balcon", "Jardin", "Parking", 
    "Ascenseur", "Sécurité", "Climatisation"
  ];

  const purchaseTimeframes: PurchaseTimeframe[] = [
    "Immédiat", "1-3 mois", "3-6 mois", "6-12 mois", "+12 mois"
  ];

  const financingMethods: FinancingMethod[] = ["Cash", "Crédit", "Mixte"];

  const propertyUses: PropertyUse[] = [
    "Résidence principale", "Résidence secondaire", "Investissement"
  ];

  const currencies: Currency[] = ["EUR", "USD", "GBP", "CHF", "AED", "MUR"];

  const languageOptions = [
    'Français', 'English', 'Deutsch', 'Italiano', 'Español', 
    'العربية', '中文', 'Русский'
  ];

  if (loading) {
    return <div className="text-center p-4">Chargement des pays...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Localisation */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4 text-loro-terracotta" />
          Localisation
        </Label>
        <Input
          name="desiredLocation"
          value={formData.desiredLocation || ''}
          onChange={handleInputChange}
          placeholder="Ville, région..."
          className="w-full p-3 text-sm border-gray-300 focus:ring-loro-terracotta focus:border-loro-terracotta"
        />
      </div>

      {/* Budget */}
      <div className="space-y-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <div className="text-loro-terracotta text-lg font-bold">€</div>
          Budget
        </Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-gray-600 mb-1 block text-xs">Min</Label>
            <Input
              name="budgetMin"
              value={formData.budgetMin || ''}
              onChange={handleInputChange}
              placeholder="Min"
              className="w-full p-3 text-sm border-gray-300"
            />
          </div>
          <div>
            <Label className="text-gray-600 mb-1 block text-xs">Max</Label>
            <Input
              name="budget"
              value={formData.budget || ''}
              onChange={handleInputChange}
              placeholder="Max"
              className="w-full p-3 text-sm border-gray-300"
            />
          </div>
        </div>

        <div>
          <Label className="text-gray-600 mb-1 block text-xs">Devise</Label>
          <select
            name="currency"
            value={formData.currency || 'EUR'}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
          >
            {currencies.map(currency => (
              <option key={currency} value={currency}>
                {currency === 'EUR' && 'Euro (€)'}
                {currency === 'USD' && 'USD ($)'}
                {currency === 'GBP' && 'GBP (£)'}
                {currency === 'CHF' && 'CHF'}
                {currency === 'AED' && 'AED'}
                {currency === 'MUR' && 'MUR'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Type de propriété */}
      <div className="space-y-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Building className="h-4 w-4 text-loro-terracotta" />
          Type de propriété
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {propertyTypesList.map(type => {
            const IconComponent = getPropertyTypeIcon(type);
            const isSelected = (formData.propertyTypes || []).includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleMultiSelectToggle('propertyTypes', type)}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-loro-navy text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nombre de chambres */}
      <div className="space-y-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Bed className="h-4 w-4 text-loro-terracotta" />
          Nombre de chambres
        </Label>
        <div className="flex flex-wrap gap-2">
          {bedroomOptions.map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => handleBedroomToggle(number)}
              className={`flex items-center justify-center w-12 h-12 rounded-lg font-semibold text-sm transition-all ${
                getSelectedBedrooms().includes(number)
                  ? 'bg-loro-navy text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {number}
            </button>
          ))}
        </div>
      </div>

      {/* Surface habitable */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Home className="h-4 w-4 text-loro-terracotta" />
          Surface habitable (m²)
        </Label>
        <Input
          name="livingArea"
          value={formData.livingArea || ''}
          onChange={handleInputChange}
          placeholder="Ex: 120"
          className="w-full p-3 text-sm border-gray-300"
        />
      </div>

      {/* Terrain (m²) */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <TreePine className="h-4 w-4 text-loro-terracotta" />
          Terrain (m²)
        </Label>
        <Input
          name="landArea"
          value={formData.landArea || ''}
          onChange={handleInputChange}
          placeholder="Ex: 500"
          className="w-full p-3 text-sm border-gray-300"
        />
      </div>

      {/* Vue souhaitée */}
      <div className="space-y-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4 text-loro-terracotta" />
          Vue souhaitée
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {viewTypesList.map(view => {
            const IconComponent = getViewTypeIcon(view);
            const isSelected = (formData.views || []).includes(view);
            return (
              <button
                key={view}
                type="button"
                onClick={() => handleMultiSelectToggle('views', view)}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-loro-navy text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {view}
              </button>
            );
          })}
        </div>
      </div>

      {/* Commodités souhaitées */}
      <div className="space-y-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Star className="h-4 w-4 text-loro-terracotta" />
          Commodités souhaitées
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {amenitiesList.map(amenity => {
            const IconComponent = getAmenityIcon(amenity);
            const isSelected = (formData.amenities || []).includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => handleMultiSelectToggle('amenities', amenity)}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-loro-navy text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      {/* Délai d'acquisition */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-loro-terracotta" />
          Délai d'acquisition
        </Label>
        <RadioSelectButtons
          options={purchaseTimeframes}
          selectedValue={formData.purchaseTimeframe}
          onSelect={(value) => onDataChange({ purchaseTimeframe: value })}
        />
      </div>

      {/* Mode de financement */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-loro-terracotta" />
          Mode de financement
        </Label>
        <RadioSelectButtons
          options={financingMethods}
          selectedValue={formData.financingMethod}
          onSelect={(value) => onDataChange({ financingMethod: value })}
        />
      </div>

      {/* Utilisation prévue */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-loro-terracotta" />
          Utilisation prévue
        </Label>
        <RadioSelectButtons
          options={propertyUses}
          selectedValue={formData.propertyUse}
          onSelect={(value) => onDataChange({ propertyUse: value })}
        />
      </div>

      {/* Informations personnelles - uniquement pour le formulaire public */}
      {isPublicForm && (
        <div className="space-y-6 border-t pt-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Informations personnelles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pays de résidence */}
            <div className="space-y-2" ref={taxResidenceDropdownRef}>
              <Label className="text-gray-800 mb-1 block font-medium text-xs">Pays de résidence</Label>
              <div 
                className="flex items-center justify-between px-3 py-2 h-10 w-full border border-input rounded-md bg-background text-sm cursor-pointer"
                onClick={() => setIsTaxResidenceDropdownOpen(!isTaxResidenceDropdownOpen)}
              >
                {formData.taxResidence ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{countryToFlag(formData.taxResidence)}</span>
                    <span>{formData.taxResidence}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Sélectionner un pays</span>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${isTaxResidenceDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isTaxResidenceDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg">
                  <div className="sticky top-0 p-2 bg-background border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Rechercher un pays..."
                        className="pl-8 h-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      {searchTerm && (
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchTerm('');
                          }}
                        >
                          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-60 overflow-auto p-1">
                    {filteredCountries.map(country => (
                      <div
                        key={country}
                        className={`flex items-center px-4 py-2 hover:bg-accent rounded-sm cursor-pointer ${formData.taxResidence === country ? 'bg-accent/50' : ''}`}
                        onClick={() => handleTaxResidenceSelect(country)}
                      >
                        <span className="text-lg mr-2">{countryToFlag(country)}</span>
                        <span>{country}</span>
                      </div>
                    ))}
                    
                    {filteredCountries.length === 0 && (
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        Aucun résultat
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Nationalité */}
            <div className="space-y-2" ref={nationalityDropdownRef}>
              <Label className="text-gray-800 mb-1 block font-medium text-xs">Nationalité</Label>
              <div 
                className="flex items-center justify-between px-3 py-2 h-10 w-full border border-input rounded-md bg-background text-sm cursor-pointer"
                onClick={() => setIsNationalityDropdownOpen(!isNationalityDropdownOpen)}
              >
                {formData.nationality ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{countryToFlag(formData.nationality)}</span>
                    <span>{formData.nationality}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Sélectionner une nationalité</span>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${isNationalityDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isNationalityDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg">
                  <div className="sticky top-0 p-2 bg-background border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Rechercher une nationalité..."
                        className="pl-8 h-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      {searchTerm && (
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchTerm('');
                          }}
                        >
                          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-60 overflow-auto p-1">
                    {filteredCountries.map(country => {
                      const nationality = deriveNationalityFromCountry(country) || country;
                      return (
                        <div
                          key={`${country}-${nationality}`}
                          className={`flex items-center px-4 py-2 hover:bg-accent rounded-sm cursor-pointer ${formData.nationality === nationality ? 'bg-accent/50' : ''}`}
                          onClick={() => handleNationalitySelect(nationality)}
                        >
                          <span className="text-lg mr-2">{countryToFlag(country)}</span>
                          <span>{nationality}</span>
                        </div>
                      );
                    })}
                    
                    {filteredCountries.length === 0 && (
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        Aucun résultat
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Langue préférée */}
          <div className="space-y-2">
            <Label className="text-gray-800 mb-1 block font-medium text-xs">Langue préférée</Label>
            <select
              name="preferredLanguage"
              value={formData.preferredLanguage || ''}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Sélectionner une langue</option>
              {languageOptions.map(language => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchCriteriaFields;
