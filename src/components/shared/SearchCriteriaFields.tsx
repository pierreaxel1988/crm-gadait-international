
import React from 'react';
import { LeadDetailed, PropertyType, ViewType, Amenity, PurchaseTimeframe, FinancingMethod, PropertyUse } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiSelectButtons from '@/components/leads/form/MultiSelectButtons';
import { MapPin } from 'lucide-react';

interface SearchCriteriaFieldsProps {
  formData: Partial<LeadDetailed>;
  onDataChange: (data: Partial<LeadDetailed>) => void;
  isPublicForm?: boolean;
}

const propertyTypes: PropertyType[] = ['Villa', 'Apartment', 'House', 'Land', 'Other'];
const viewTypes: ViewType[] = ['Mer', 'Montagne', 'Golf', 'Autres'];
const amenities: Amenity[] = ['Piscine', 'Terrasse', 'Jardin'];
const purchaseTimeframes: PurchaseTimeframe[] = ['Immediately', 'Within 3 months', 'Within 6 months', 'Within 1 year', 'No rush'];
const financingMethods: FinancingMethod[] = ['Cash', 'Mortgage', 'Mixed', 'Other'];
const propertyUses: PropertyUse[] = ['Primary residence', 'Secondary residence', 'Investment', 'Commercial'];
const bedroomOptions = [1, 2, 3, 4, 5, 6];

const SearchCriteriaFields = ({ formData, onDataChange, isPublicForm = false }: SearchCriteriaFieldsProps) => {
  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    onDataChange({ [field]: value });
  };

  const handleMultiSelectToggle = (field: keyof LeadDetailed, value: any) => {
    const currentValues = (formData[field] as any[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onDataChange({ [field]: newValues });
  };

  const handleBedroomToggle = (value: number) => {
    const currentBedrooms = Array.isArray(formData.bedrooms) ? formData.bedrooms : 
                           (formData.bedrooms ? [formData.bedrooms] : []);
    
    const newBedrooms = currentBedrooms.includes(value)
      ? currentBedrooms.filter(v => v !== value)
      : [...currentBedrooms, value];
    
    onDataChange({ bedrooms: newBedrooms });
  };

  return (
    <div className="space-y-6">
      {/* Localisation souhaitée */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4 text-loro-terracotta" />
          Localisation souhaitée
        </Label>
        <Input
          value={formData.desiredLocation || ''}
          onChange={(e) => handleInputChange('desiredLocation', e.target.value)}
          placeholder="Ville ou région recherchée"
          className="font-futura"
        />
      </div>

      {/* Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Budget minimum</Label>
          <Input
            value={formData.budgetMin || ''}
            onChange={(e) => handleInputChange('budgetMin', e.target.value)}
            placeholder="Ex: 200000"
            className="font-futura"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Budget maximum</Label>
          <Input
            value={formData.budget || ''}
            onChange={(e) => handleInputChange('budget', e.target.value)}
            placeholder="Ex: 500000"
            className="font-futura"
          />
        </div>
      </div>

      {/* Devise */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Devise</Label>
        <Select value={formData.currency || 'EUR'} onValueChange={(value) => handleInputChange('currency', value)}>
          <SelectTrigger className="font-futura">
            <SelectValue placeholder="Choisir une devise" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EUR">EUR (€)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="GBP">GBP (£)</SelectItem>
            <SelectItem value="CHF">CHF</SelectItem>
            <SelectItem value="MUR">MUR</SelectItem>
            <SelectItem value="AED">AED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Types de propriété */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Types de propriété recherchée</Label>
        <MultiSelectButtons 
          options={propertyTypes} 
          selectedValues={formData.propertyTypes || []} 
          onToggle={(value) => handleMultiSelectToggle('propertyTypes', value)}
          className="grid grid-cols-2 md:grid-cols-3 gap-2"
          buttonClassName="h-10 text-sm border-loro-sand/30 text-loro-navy hover:bg-loro-sand/20 data-[selected=true]:bg-loro-hazel data-[selected=true]:text-white data-[selected=true]:border-loro-hazel"
        />
      </div>

      {/* Nombre de chambres */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Nombre de chambres</Label>
        <MultiSelectButtons 
          options={bedroomOptions} 
          selectedValues={Array.isArray(formData.bedrooms) ? formData.bedrooms : (formData.bedrooms ? [formData.bedrooms] : [])} 
          onToggle={handleBedroomToggle}
          className="grid grid-cols-3 md:grid-cols-6 gap-2"
          buttonClassName="h-10 text-sm border-loro-sand/30 text-loro-navy hover:bg-loro-sand/20 data-[selected=true]:bg-loro-hazel data-[selected=true]:text-white data-[selected=true]:border-loro-hazel"
        />
      </div>

      {/* Surface habitable et terrain */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Surface habitable (m²)</Label>
          <Input
            value={formData.livingArea || ''}
            onChange={(e) => handleInputChange('livingArea', e.target.value)}
            placeholder="Ex: 150"
            className="font-futura"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Surface terrain (m²)</Label>
          <Input
            value={formData.landArea || ''}
            onChange={(e) => handleInputChange('landArea', e.target.value)}
            placeholder="Ex: 1000"
            className="font-futura"
          />
        </div>
      </div>

      {/* Vues */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Vues souhaitées</Label>
        <MultiSelectButtons 
          options={viewTypes} 
          selectedValues={formData.views || []} 
          onToggle={(value) => handleMultiSelectToggle('views', value)}
          className="grid grid-cols-2 md:grid-cols-4 gap-2"
          buttonClassName="h-10 text-sm border-loro-sand/30 text-loro-navy hover:bg-loro-sand/20 data-[selected=true]:bg-loro-hazel data-[selected=true]:text-white data-[selected=true]:border-loro-hazel"
        />
      </div>

      {/* Équipements */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Équipements souhaités</Label>
        <MultiSelectButtons 
          options={amenities} 
          selectedValues={formData.amenities || []} 
          onToggle={(value) => handleMultiSelectToggle('amenities', value)}
          className="grid grid-cols-2 md:grid-cols-3 gap-2"
          buttonClassName="h-10 text-sm border-loro-sand/30 text-loro-navy hover:bg-loro-sand/20 data-[selected=true]:bg-loro-hazel data-[selected=true]:text-white data-[selected=true]:border-loro-hazel"
        />
      </div>

      {/* Délais d'achat */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Délais d'achat</Label>
        <Select value={formData.purchaseTimeframe || ''} onValueChange={(value) => handleInputChange('purchaseTimeframe', value)}>
          <SelectTrigger className="font-futura">
            <SelectValue placeholder="Sélectionner un délai" />
          </SelectTrigger>
          <SelectContent>
            {purchaseTimeframes.map(timeframe => (
              <SelectItem key={timeframe} value={timeframe}>{timeframe}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mode de financement */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Mode de financement</Label>
        <Select value={formData.financingMethod || ''} onValueChange={(value) => handleInputChange('financingMethod', value)}>
          <SelectTrigger className="font-futura">
            <SelectValue placeholder="Sélectionner un mode de financement" />
          </SelectTrigger>
          <SelectContent>
            {financingMethods.map(method => (
              <SelectItem key={method} value={method}>{method}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Usage de la propriété */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Usage de la propriété</Label>
        <Select value={formData.propertyUse || ''} onValueChange={(value) => handleInputChange('propertyUse', value)}>
          <SelectTrigger className="font-futura">
            <SelectValue placeholder="Sélectionner un usage" />
          </SelectTrigger>
          <SelectContent>
            {propertyUses.map(use => (
              <SelectItem key={use} value={use}>{use}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Nationalité */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Nationalité</Label>
        <Input
          value={formData.nationality || ''}
          onChange={(e) => handleInputChange('nationality', e.target.value)}
          placeholder="Ex: Française"
          className="font-futura"
        />
      </div>

      {/* Résidence fiscale */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Résidence fiscale</Label>
        <Input
          value={formData.taxResidence || ''}
          onChange={(e) => handleInputChange('taxResidence', e.target.value)}
          placeholder="Ex: France"
          className="font-futura"
        />
      </div>

      {/* Langue préférée */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Langue préférée</Label>
        <Select value={formData.preferredLanguage || ''} onValueChange={(value) => handleInputChange('preferredLanguage', value)}>
          <SelectTrigger className="font-futura">
            <SelectValue placeholder="Sélectionner une langue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Français">Français</SelectItem>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Deutsch">Deutsch</SelectItem>
            <SelectItem value="Español">Español</SelectItem>
            <SelectItem value="Italiano">Italiano</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchCriteriaFields;
