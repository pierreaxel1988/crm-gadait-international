
import React from 'react';
import { LeadDetailed, PurchaseTimeframe, FinancingMethod, PropertyUse } from '@/types/lead';
import { Label } from '@/components/ui/label';
import MultiSelectButtons from '../../MultiSelectButtons';

interface PurchaseDetailsSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
  purchaseTimeframes: PurchaseTimeframe[];
  financingMethods: FinancingMethod[];
  propertyUses: PropertyUse[];
}

const PurchaseDetailsSection = ({
  lead,
  onDataChange,
  purchaseTimeframes,
  financingMethods,
  propertyUses,
}: PurchaseDetailsSectionProps) => {
  // This is a simplified version for mobile that simply delegates to the main component

  const handleTimeframeToggle = (timeframe: PurchaseTimeframe) => {
    onDataChange({ purchaseTimeframe: timeframe });
  };

  const handleFinancingMethodToggle = (method: FinancingMethod) => {
    onDataChange({ financingMethod: method });
  };

  const handlePropertyUseToggle = (use: PropertyUse) => {
    onDataChange({ propertyUse: use });
  };

  return (
    <div className="space-y-4">
      {/* We'll use the same logic as the desktop version, this is just a placeholder */}
      {/* Purchase timeframe section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Délai d'achat</Label>
        <MultiSelectButtons
          options={purchaseTimeframes}
          selectedValues={lead.purchaseTimeframe ? [lead.purchaseTimeframe] : []}
          onChange={(value) => handleTimeframeToggle(value as PurchaseTimeframe)}
        />
      </div>

      {/* Financing method section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Mode de financement</Label>
        <MultiSelectButtons
          options={financingMethods}
          selectedValues={lead.financingMethod ? [lead.financingMethod] : []}
          onChange={(value) => handleFinancingMethodToggle(value as FinancingMethod)}
        />
      </div>

      {/* Property use section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Usage du bien</Label>
        <MultiSelectButtons
          options={propertyUses}
          selectedValues={lead.propertyUse ? [lead.propertyUse] : []}
          onChange={(value) => handlePropertyUseToggle(value as PropertyUse)}
        />
      </div>
    </div>
  );
};

export default PurchaseDetailsSection;
