
import React, { useState } from 'react';
import { LeadDetailed, Currency } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

interface OwnerPriceFieldsProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerPriceFields: React.FC<OwnerPriceFieldsProps> = ({ lead, onDataChange }) => {
  const handleFurnishedToggle = () => {
    const updatedFurnished = !lead.furnished;
    onDataChange({ 
      furnished: updatedFurnished,
      // Reset furniture details when toggling furnished status
      furniture_included_in_price: updatedFurnished ? true : undefined,
      furniture_price: updatedFurnished ? undefined : lead.furniture_price
    });
  };

  return (
    <div className="space-y-4">
      {/* Prix souhaité */}
      <div className="space-y-2">
        <Label htmlFor="desired_price" className="text-sm">Prix souhaité</Label>
        <Input
          id="desired_price"
          value={lead.desired_price || ''}
          onChange={e => onDataChange({ desired_price: e.target.value })}
          placeholder="Ex : 450 000"
          className="w-full font-futura"
          type="text"
        />
      </div>

      {/* Honoraires */}
      <div className="space-y-2">
        <Label htmlFor="fees" className="text-sm">Honoraires</Label>
        <Input
          id="fees"
          value={lead.fees || ''}
          onChange={e => onDataChange({ fees: e.target.value })}
          placeholder="Ex : 5%"
          className="w-full font-futura"
          type="text"
        />
      </div>

      {/* Devise */}
      <div className="space-y-2">
        <Label htmlFor="currency" className="text-sm">Devise</Label>
        <select
          id="currency"
          value={lead.currency || 'EUR'}
          onChange={e => onDataChange({ currency: e.target.value as Currency })}
          className="w-full p-2 border border-gray-300 rounded font-futura"
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="GBP">GBP (£)</option>
          <option value="CHF">CHF (Fr)</option>
          <option value="AED">AED (د.إ)</option>
          <option value="MUR">MUR (₨)</option>
        </select>
      </div>

      {/* Meublé - Toggle Switch */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 pt-2">
          <Label htmlFor="furnished" className="text-sm">Meublé</Label>
          <Switch
            id="furnished"
            checked={!!lead.furnished}
            onCheckedChange={(checked) => {
              const updatedFurnished = !!checked;
              onDataChange({ 
                furnished: updatedFurnished,
                furniture_included_in_price: updatedFurnished ? true : undefined,
                furniture_price: updatedFurnished ? undefined : lead.furniture_price
              });
            }}
          />
          <span className="ml-2 text-xs font-futura">
            {lead.furnished ? 'Oui' : 'Non'}
          </span>
        </div>
      </div>

      {/* Additional fields when "Meublé" is toggled on */}
      {lead.furnished && (
        <>
          <div className="space-y-2 mt-2">
            <Label htmlFor="furniture_included" className="text-sm">Mobilier inclus dans le prix</Label>
            <div className="flex items-center gap-3">
              <Switch
                id="furniture_included"
                checked={!!lead.furniture_included_in_price}
                onCheckedChange={(checked) => onDataChange({ 
                  furniture_included_in_price: checked,
                  furniture_price: checked ? undefined : lead.furniture_price
                })}
              />
              <span className="ml-2 text-xs font-futura">
                {lead.furniture_included_in_price ? 'Oui' : 'Non'}
              </span>
            </div>
          </div>

          {!lead.furniture_included_in_price && (
            <div className="space-y-2 mt-2">
              <Label htmlFor="furniture_price" className="text-sm">Valorisation du mobilier</Label>
              <Input
                id="furniture_price"
                value={lead.furniture_price || ''}
                onChange={e => onDataChange({ furniture_price: e.target.value })}
                placeholder="Ex : 45 000"
                className="w-full font-futura"
                type="text"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Location section component
const OwnerLocationSection: React.FC<OwnerPriceFieldsProps> = ({ lead, onDataChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="country" className="text-sm">Pays</Label>
        <Input
          id="country"
          value={lead.country || ''}
          onChange={e => onDataChange({ country: e.target.value })}
          placeholder="Ex : France"
          className="w-full font-futura"
          type="text"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="desiredLocation" className="text-sm">Localisation souhaitée</Label>
        <Input
          id="desiredLocation"
          value={lead.desiredLocation || ''}
          onChange={e => onDataChange({ desiredLocation: e.target.value })}
          placeholder="Ex : Paris 16e"
          className="w-full font-futura"
          type="text"
        />
      </div>
    </div>
  );
};

// Property details section component
const OwnerPropertySection: React.FC<OwnerPriceFieldsProps> = ({ lead, onDataChange }) => {
  const handleBedroomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Convert to number if the value is a valid number
    const numValue = value === '' ? undefined : Number(value);
    onDataChange({ bedrooms: numValue });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="livingArea" className="text-sm">Surface habitable</Label>
        <Input
          id="livingArea"
          value={lead.livingArea || ''}
          onChange={e => onDataChange({ livingArea: e.target.value })}
          placeholder="Ex : 120 m²"
          className="w-full font-futura"
          type="text"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="landArea" className="text-sm">Surface du terrain</Label>
        <Input
          id="landArea"
          value={lead.landArea || ''}
          onChange={e => onDataChange({ landArea: e.target.value })}
          placeholder="Ex : 500 m²"
          className="w-full font-futura"
          type="text"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bedrooms" className="text-sm">Chambres</Label>
        <Input
          id="bedrooms"
          value={typeof lead.bedrooms === 'number' ? lead.bedrooms.toString() : ''}
          onChange={handleBedroomChange}
          placeholder="Ex : 3"
          className="w-full font-futura"
          type="number"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="propertyType" className="text-sm">Type de bien</Label>
        <select
          id="propertyType"
          value={lead.propertyType || ''}
          onChange={e => onDataChange({ propertyType: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded font-futura"
        >
          <option value="">Sélectionner un type</option>
          <option value="Villa">Villa</option>
          <option value="Appartement">Appartement</option>
          <option value="Penthouse">Penthouse</option>
          <option value="Maison">Maison</option>
          <option value="Duplex">Duplex</option>
          <option value="Chalet">Chalet</option>
          <option value="Terrain">Terrain</option>
          <option value="Manoir">Manoir</option>
          <option value="Maison de ville">Maison de ville</option>
          <option value="Château">Château</option>
          <option value="Local commercial">Local commercial</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="constructionYear" className="text-sm">Année de construction</Label>
        <Input
          id="constructionYear"
          value={lead.constructionYear || ''}
          onChange={e => onDataChange({ constructionYear: e.target.value })}
          placeholder="Ex : 1980"
          className="w-full font-futura"
          type="text"
        />
      </div>
    </div>
  );
};

interface SearchCriteriaSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const SearchCriteriaSection = ({ lead, onDataChange }: SearchCriteriaSectionProps) => {
  const [activeTab, setActiveTab] = useState('budget');
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">Critères de la Propriété</h2>
      
      {lead.pipelineType === 'owners' && (
        <div className="space-y-4">
          <Tabs defaultValue="budget" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="budget">Prix</TabsTrigger>
              <TabsTrigger value="location">Localisation</TabsTrigger>
              <TabsTrigger value="property">Bien</TabsTrigger>
            </TabsList>
            
            <TabsContent value="budget" className="space-y-4">
              <OwnerPriceFields lead={lead} onDataChange={onDataChange} />
            </TabsContent>
            
            <TabsContent value="location" className="space-y-4">
              <OwnerLocationSection lead={lead} onDataChange={onDataChange} />
            </TabsContent>
            
            <TabsContent value="property" className="space-y-4">
              <OwnerPropertySection lead={lead} onDataChange={onDataChange} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default SearchCriteriaSection;

