
import React from 'react';
import { Banknote, MapPin, Building, Building2, AreaChart, Flag, HelpCircle, Check } from 'lucide-react';
import { LeadDetailed, PropertyType, ViewType, Amenity, PurchaseTimeframe, FinancingMethod, PropertyUse } from '@/types/lead';
import { cn } from '@/lib/utils';

interface SearchCriteriaFieldsProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
  setFormData: React.Dispatch<React.SetStateAction<LeadDetailed>>;
}

const SearchCriteriaFields: React.FC<SearchCriteriaFieldsProps> = ({
  formData,
  handleInputChange,
  handleNumberChange,
  handleMultiSelectToggle,
  setFormData
}) => {
  const propertyTypes: PropertyType[] = [
    'Villa', 'Appartement', 'Penthouse', 'Maison', 'Duplex', 
    'Chalet', 'Terrain', 'Manoir', 'Maison de ville', 'Château', 
    'Local commercial', 'Commercial', 'Hotel', 'Vignoble', 'Autres'
  ];

  const viewTypes: ViewType[] = ['Mer', 'Montagne', 'Golf', 'Autres'];
  const amenities: Amenity[] = ['Piscine', 'Jardin', 'Garage', 'Sécurité'];
  const purchaseTimeframes: PurchaseTimeframe[] = ['Moins de trois mois', 'Plus de trois mois'];
  const financingMethods: FinancingMethod[] = ['Cash', 'Prêt bancaire'];
  const propertyUses: PropertyUse[] = ['Investissement locatif', 'Résidence principale'];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold border-b pb-2">Critères de Recherche</h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <Banknote className="h-4 w-4 mr-1" /> Budget
          </span>
        </label>
        <input
          type="text"
          name="budget"
          value={formData.budget || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
          placeholder="ex: 1.500.000€ - 2.000.000€"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" /> Localisation souhaitée
          </span>
        </label>
        <input
          type="text"
          name="desiredLocation"
          value={formData.desiredLocation || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <Building className="h-4 w-4 mr-1" /> Type de bien
          </span>
        </label>
        <select
          name="propertyType"
          value={formData.propertyType || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        >
          <option value="">Sélectionner un type</option>
          {propertyTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <Building2 className="h-4 w-4 mr-1" /> Surface habitable
          </span>
        </label>
        <input
          type="text"
          name="livingArea"
          value={formData.livingArea || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
          placeholder="ex: 200-300m²"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Nombre de chambres
          </label>
        <input
          type="number"
          name="bedrooms"
          value={formData.bedrooms || ''}
          onChange={handleNumberChange}
          className="luxury-input w-full"
          min="0"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Vue souhaitée
        </label>
        <div className="flex flex-wrap gap-2">
          {viewTypes.map(view => (
            <button
              key={view}
              type="button"
              onClick={() => handleMultiSelectToggle('views', view)}
              className={cn(
                "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
                formData.views?.includes(view)
                  ? "bg-primary text-white"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              )}
            >
              {formData.views?.includes(view) && <Check className="h-3 w-3" />}
              {view}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Prestations souhaitées
        </label>
        <div className="flex flex-wrap gap-2">
          {amenities.map(amenity => (
            <button
              key={amenity}
              type="button"
              onClick={() => handleMultiSelectToggle('amenities', amenity)}
              className={cn(
                "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
                formData.amenities?.includes(amenity)
                  ? "bg-primary text-white"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              )}
            >
              {formData.amenities?.includes(amenity) && <Check className="h-3 w-3" />}
              {amenity}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Date d'achat souhaitée
        </label>
        <div className="flex gap-2">
          {purchaseTimeframes.map(timeframe => (
            <button
              key={timeframe}
              type="button"
              onClick={() => setFormData({...formData, purchaseTimeframe: timeframe})}
              className={cn(
                "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
                formData.purchaseTimeframe === timeframe
                  ? "bg-primary text-white"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              )}
            >
              {formData.purchaseTimeframe === timeframe && <Check className="h-3 w-3" />}
              {timeframe}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Mode de financement
        </label>
        <div className="flex gap-2">
          {financingMethods.map(method => (
            <button
              key={method}
              type="button"
              onClick={() => setFormData({...formData, financingMethod: method})}
              className={cn(
                "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
                formData.financingMethod === method
                  ? "bg-primary text-white"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              )}
            >
              {formData.financingMethod === method && <Check className="h-3 w-3" />}
              {method}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Type d'investissement
        </label>
        <div className="flex gap-2">
          {propertyUses.map(use => (
            <button
              key={use}
              type="button"
              onClick={() => setFormData({...formData, propertyUse: use})}
              className={cn(
                "flex items-center gap-1 py-1 px-2 rounded-full text-xs",
                formData.propertyUse === use
                  ? "bg-primary text-white"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              )}
            >
              {formData.propertyUse === use && <Check className="h-3 w-3" />}
              {use}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <Flag className="h-4 w-4 mr-1" /> Nationalité
          </span>
        </label>
        <input
          type="text"
          name="nationality"
          value={formData.nationality || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <Flag className="h-4 w-4 mr-1" /> Résidence fiscale
          </span>
        </label>
        <input
          type="text"
          name="taxResidence"
          value={formData.taxResidence || ''}
          onChange={handleInputChange}
          className="luxury-input w-full"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <span className="flex items-center">
            <HelpCircle className="h-4 w-4 mr-1" /> Notes
          </span>
        </label>
        <textarea
          name="notes"
          value={formData.notes || ''}
          onChange={handleInputChange}
          className="luxury-input w-full min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default SearchCriteriaFields;
