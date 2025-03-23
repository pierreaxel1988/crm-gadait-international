
import React from 'react';
import { Timer, CreditCard, Home } from 'lucide-react';
import { LeadDetailed, PurchaseTimeframe, FinancingMethod, PropertyUse } from '@/types/lead';
import FormInput from '../FormInput';
import RadioSelectButtons from '../RadioSelectButtons';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6 md:space-y-8">
      <h2 className={cn(
        "font-medium text-brown-700",
        isMobile ? "text-xl" : "text-2xl"
      )}>Conditions d'achat</h2>
      
      <div className="space-y-5 md:space-y-6">
        <FormInput
          label="Date d'achat souhaitée"
          name="purchaseTimeframe"
          value=""
          onChange={() => {}}
          icon={Timer}
          iconClassName={cn(isMobile && "h-4 w-4")}
          labelClassName={cn(isMobile && "text-sm")}
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
          iconClassName={cn(isMobile && "h-4 w-4")}
          labelClassName={cn(isMobile && "text-sm")}
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
          iconClassName={cn(isMobile && "h-4 w-4")}
          labelClassName={cn(isMobile && "text-sm")}
          renderCustomField={() => (
            <RadioSelectButtons
              options={propertyUses}
              selectedValue={formData.propertyUse}
              onSelect={(value) => handleMultiSelectToggle('propertyUse', value)}
            />
          )}
        />
      </div>
    </div>
  );
};

export default PurchaseDetailsSection;
