
import React from 'react';
import { LeadDetailed, AssetType, Equipment } from '@/types/lead';
import FormInput from '../FormInput';
import MultiSelectButtons from '../MultiSelectButtons';
import { Label } from '@/components/ui/label';
import BudgetFilter from '@/components/pipeline/filters/BudgetFilter';
import CustomTagInput from '../CustomTagInput';
import { Textarea } from '@/components/ui/textarea';
import { 
  Home,
  Camera,
  Car,
  Fan,
  Building,
  Building2,
  Bed,
  Sofa,
  Droplets,
  DoorClosed
} from 'lucide-react';

interface OwnerPropertyDetailsSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
}

const OwnerPropertyDetailsSection = ({
  formData,
  handleInputChange,
  handleMultiSelectToggle
}: OwnerPropertyDetailsSectionProps) => {
  const handleBudgetChange = (type: 'min' | 'max', value: string) => {
    const fieldName = type === 'min' ? 'budgetMin' : 'budget';
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
  };

  const handleCurrencyChange = (value: string) => {
    const syntheticEvent = {
      target: {
        name: 'currency',
        value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
  };

  const handleArrayFieldChange = (fieldName: keyof LeadDetailed, newValues: string[]) => {
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: newValues
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
  };

  const handleBedroomChange = (value: string) => {
    const numValue = value === "8+" ? 8 : parseInt(value);
    const currentBedrooms = Array.isArray(formData.bedrooms)
      ? [...formData.bedrooms]
      : formData.bedrooms
      ? [formData.bedrooms]
      : [];
    
    const newBedrooms = currentBedrooms.includes(numValue)
      ? currentBedrooms.filter(b => b !== numValue)
      : [...currentBedrooms, numValue];
    
    const syntheticEvent = {
      target: {
        name: 'bedrooms',
        value: newBedrooms
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
  };

  // Définir les atouts avec des icônes Lucide
  const ASSETS: { value: AssetType; icon: React.ComponentType<any>; }[] = [
    { value: "Vue mer", icon: Home },
    { value: "Vue panoramique", icon: Camera },
    { value: "Bord de mer", icon: Home },
    { value: "Front de mer", icon: Home },
    { value: "Domaine de chasse", icon: Home },
    { value: "Écurie", icon: Home },
    { value: "Bien d'architecte", icon: Home },
    { value: "Style contemporain", icon: Home },
    { value: "Monument classé", icon: Home },
    { value: "Court de tennis", icon: Home },
    { value: "Pied des pistes", icon: Home },
    { value: "Proche montagne", icon: Home },
    { value: "Proche aéroport", icon: Home },
    { value: "Proche gare", icon: Home },
    { value: "Proche golf", icon: Home },
  ];

  // Définir les équipements avec des icônes Lucide
  const EQUIPMENT: { value: Equipment; icon: React.ComponentType<any>; label: string; }[] = [
    { value: "Piscine", icon: Droplets, label: "Piscine" },
    { value: "Ascenseur", icon: Home, label: "Ascenseur" },
    { value: "Garage & Parking", icon: Car, label: "Garage & Parking" },
    { value: "Climatisation", icon: Fan, label: "Climatisation" },
    { value: "Salle de réception", icon: Building, label: "Salle de réception" },
    { value: "Dépendances", icon: Building2, label: "Dépendances" },
    { value: "Loge gardien", icon: Home, label: "Loge gardien" },
    { value: "Spa", icon: Droplets, label: "Spa" },
    { value: "Viager", icon: Home, label: "Viager" },
    { value: "Terrasse", icon: Home, label: "Terrasse" },
    { value: "Jardin", icon: Home, label: "Jardin" },
    { value: "Meublé", icon: Sofa, label: "Meublé" },
    { value: "Cheminée", icon: Home, label: "Cheminée" },
    { value: "Maison d'amis", icon: Home, label: "Maison d'amis" },
    { value: "Bâtiments agricoles", icon: Home, label: "Bâtiments agricoles" },
    { value: "Chambre de bonne", icon: Bed, label: "Chambre de bonne" },
    { value: "Accessible aux handicapés", icon: Home, label: "Accessible aux handicapés" }
  ];

  return (
    <div className="space-y-4">
      <FormInput
        label="Surface habitable (m²)"
        name="livingArea"
        value={formData.livingArea || ''}
        onChange={handleInputChange}
        placeholder="Surface habitable approximative"
      />

      <FormInput
        label="Surface du terrain (m²)"
        name="landArea"
        value={formData.landArea || ''}
        onChange={handleInputChange}
        placeholder="Surface du terrain"
      />

      <div className="space-y-2">
        <h4 className="text-sm font-medium mb-3">Nombre de chambres</h4>
        <MultiSelectButtons
          options={["1", "2", "3", "4", "5", "6", "7", "8+"]}
          selectedValues={
            Array.isArray(formData.bedrooms)
              ? formData.bedrooms.map(num => num >= 8 ? "8+" : num.toString())
              : formData.bedrooms
              ? [formData.bedrooms >= 8 ? "8+" : formData.bedrooms.toString()]
              : []
          }
          onChange={handleBedroomChange}
          specialOption="8+"
        />
      </div>

      <div className="pt-2">
        <Label className="text-sm font-medium mb-3">Prix souhaité</Label>
        <BudgetFilter
          minBudget={formData.budgetMin || ''}
          maxBudget={formData.budget || ''}
          onBudgetChange={handleBudgetChange}
          currency={formData.currency || 'EUR'}
          onCurrencyChange={handleCurrencyChange}
        />
      </div>

      <FormInput
        label="Année de construction"
        name="constructionYear"
        type="number"
        value={formData.constructionYear || ''}
        onChange={handleInputChange}
        placeholder="Année de construction"
      />

      <FormInput
        label="Nombre de places de parking"
        name="parkingSpaces"
        type="number"
        value={formData.parkingSpaces?.toString() || ''}
        onChange={handleInputChange}
        placeholder="Nombre de places"
      />

      <FormInput
        label="Nombre d'étages"
        name="floors"
        type="number"
        value={formData.floors?.toString() || ''}
        onChange={handleInputChange}
        placeholder="Nombre d'étages"
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium">Orientation</Label>
        <MultiSelectButtons
          options={["Nord", "Sud", "Est", "Ouest"]}
          selectedValues={formData.orientation || []}
          onChange={(value) => handleMultiSelectToggle('orientation', value)}
        />
      </div>

      <FormInput
        label="Classe énergétique"
        name="energyClass"
        value={formData.energyClass || ''}
        onChange={handleInputChange}
        placeholder="Ex: A, B, C..."
      />

      <FormInput
        label="Taxes annuelles"
        name="yearlyTaxes"
        value={formData.yearlyTaxes || ''}
        onChange={handleInputChange}
        placeholder="Montant des taxes annuelles"
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium">Description du bien</Label>
        <Textarea
          name="propertyDescription"
          value={formData.propertyDescription || ''}
          onChange={handleInputChange}
          placeholder="Description détaillée du bien"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Points forts du bien</Label>
        <CustomTagInput
          tags={formData.keyFeatures || []}
          onChange={(newTags) => handleArrayFieldChange('keyFeatures', newTags)}
          placeholder="Ajouter un point fort..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Équipements</Label>
        <div className="grid grid-cols-2 gap-2">
          {EQUIPMENT.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleMultiSelectToggle('equipment', value)}
              className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
                formData.equipment?.includes(value)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <FormInput
        label="Frais de syndic"
        name="condoFees"
        value={formData.condoFees || ''}
        onChange={handleInputChange}
        placeholder="Montant des frais de syndic"
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium">Facilités</Label>
        <CustomTagInput
          tags={formData.facilities || []}
          onChange={(newTags) => handleArrayFieldChange('facilities', newTags)}
          placeholder="Ajouter une facilité..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Travaux nécessaires</Label>
        <Textarea
          name="renovationNeeded"
          value={formData.renovationNeeded || ''}
          onChange={handleInputChange}
          placeholder="Description des travaux nécessaires"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium mb-3">Les atouts</h4>
        <div className="grid grid-cols-2 gap-2">
          {ASSETS.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleMultiSelectToggle('assets', value)}
              className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
                formData.assets?.includes(value)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerPropertyDetailsSection;
