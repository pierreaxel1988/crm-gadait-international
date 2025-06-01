import React from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, PurchaseTimeframe, FinancingMethod, PropertyUse, Currency } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MapPin, Home, Building, Bed, Eye, Star, Clock, CreditCard, Target, Crown, Building2, Mountain, TreePine, MoreHorizontal, Warehouse, Hotel, Grape, Waves, Compass, Droplets, Wind, Car, Shield, ArrowUp } from 'lucide-react';
import MultiSelectButtons from '@/components/leads/form/MultiSelectButtons';
import RadioSelectButtons from '@/components/leads/form/RadioSelectButtons';
import { countries } from '@/utils/countries';

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

  return (
    <div className="space-y-6">
      {/* Pays recherché */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4 text-loro-terracotta" />
          Pays recherché
        </Label>
        <select
          name="country"
          value={formData.country || ''}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-loro-terracotta focus:border-transparent text-sm"
        >
          <option value="">Sélectionner un pays</option>
          {countries.map((country) => (
            <option key={country.code} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

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
            <div>
              <Label className="text-gray-800 mb-1 block font-medium text-xs">Pays de résidence</Label>
              <Input
                name="taxResidence"
                value={formData.taxResidence || ''}
                onChange={handleInputChange}
                placeholder="Pays de résidence"
                className="w-full p-3 text-sm border-gray-300"
              />
            </div>
            
            <div>
              <Label className="text-gray-800 mb-1 block font-medium text-xs">Nationalité</Label>
              <Input
                name="nationality"
                value={formData.nationality || ''}
                onChange={handleInputChange}
                placeholder="Nationalité"
                className="w-full p-3 text-sm border-gray-300"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-800 mb-1 block font-medium text-xs">Langue préférée</Label>
            <select
              name="preferredLanguage"
              value={formData.preferredLanguage || ''}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Sélectionner une langue</option>
              {languageOptions.map((language) => (
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
