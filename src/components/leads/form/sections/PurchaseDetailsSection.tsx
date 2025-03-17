
import React, { useState } from 'react';
import { Banknote, MapPin, Timer, CreditCard, Home } from 'lucide-react';
import { LeadDetailed, PurchaseTimeframe, FinancingMethod, PropertyUse } from '@/types/lead';
import FormInput from '../FormInput';
import RadioSelectButtons from '../RadioSelectButtons';
import { Input } from '@/components/ui/input';

interface PurchaseDetailsSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleMultiSelectToggle: <T extends string>(name: keyof LeadDetailed, value: T) => void;
  purchaseTimeframes: PurchaseTimeframe[];
  financingMethods: FinancingMethod[];
  propertyUses: PropertyUse[];
}

const PurchaseDetailsSection = ({
  formData,
  handleInputChange,
  handleMultiSelectToggle,
  purchaseTimeframes,
  financingMethods,
  propertyUses,
}: PurchaseDetailsSectionProps) => {
  const [formattedBudget, setFormattedBudget] = useState(formData.budget || '');
  
  // Fonction pour formater le budget
  const formatBudgetInput = (value: string) => {
    // Supprime tous les caractères non numériques
    const numericValue = value.replace(/[^\d]/g, '');
    
    if (!numericValue) return '';
    
    // Convertit en nombre
    const number = parseInt(numericValue);
    
    // Formate avec séparateur de milliers
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(number);
  };
  
  // Gère le changement de budget
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Stocke la valeur formatée pour l'affichage
    setFormattedBudget(value);
    
    // Stocke la valeur d'origine pour les données
    const rawValue = value.replace(/[^\d]/g, '') ? value : '';
    
    // Simule un événement pour mettre à jour formData
    const syntheticEvent = {
      target: {
        name: 'budget',
        value: rawValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };
  
  // Gère la perte de focus pour formater définitivement
  const handleBudgetBlur = () => {
    if (!formattedBudget) return;
    
    const formatted = formatBudgetInput(formattedBudget);
    setFormattedBudget(formatted);
    
    // Mise à jour du formData avec la valeur formatée
    const syntheticEvent = {
      target: {
        name: 'budget',
        value: formatted
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Budget"
        name="budget"
        value={formattedBudget}
        onChange={handleBudgetChange}
        placeholder="ex: 1.500.000€"
        icon={Banknote}
        renderCustomField={() => (
          <Input
            name="budget"
            value={formattedBudget}
            onChange={handleBudgetChange}
            onBlur={handleBudgetBlur}
            placeholder="ex: 1.500.000€"
            className="luxury-input w-full"
          />
        )}
      />

      <FormInput
        label="Localisation souhaitée"
        name="desiredLocation"
        value={formData.desiredLocation || ''}
        onChange={handleInputChange}
        icon={MapPin}
      />

      <FormInput
        label="Date d'achat souhaitée"
        name="purchaseTimeframe"
        value=""
        onChange={() => {}}
        icon={Timer}
        renderCustomField={() => (
          <RadioSelectButtons
            options={purchaseTimeframes}
            selectedValue={formData.purchaseTimeframe}
            onSelect={(value) => handleMultiSelectToggle('purchaseTimeframe', value)}
          />
        )}
      />

      <FormInput
        label="Mode de financement"
        name="financingMethod"
        value=""
        onChange={() => {}}
        icon={CreditCard}
        renderCustomField={() => (
          <RadioSelectButtons
            options={financingMethods}
            selectedValue={formData.financingMethod}
            onSelect={(value) => handleMultiSelectToggle('financingMethod', value)}
          />
        )}
      />

      <FormInput
        label="Type d'investissement"
        name="propertyUse"
        value=""
        onChange={() => {}}
        icon={Home}
        renderCustomField={() => (
          <RadioSelectButtons
            options={propertyUses}
            selectedValue={formData.propertyUse}
            onSelect={(value) => handleMultiSelectToggle('propertyUse', value)}
          />
        )}
      />
    </div>
  );
};

export default PurchaseDetailsSection;
