import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { FinancingMethod } from '@/types/lead';

interface FinancingMethodFilterProps {
  financingMethod: FinancingMethod | null;
  onFinancingMethodChange: (method: FinancingMethod | null) => void;
}

const financingMethods: FinancingMethod[] = [
  'Cash',
  'Prêt bancaire'
];

const FinancingMethodFilter: React.FC<FinancingMethodFilterProps> = ({
  financingMethod,
  onFinancingMethodChange
}) => {
  const handleMethodSelect = (method: FinancingMethod) => {
    if (financingMethod === method) {
      onFinancingMethodChange(null);
    } else {
      onFinancingMethodChange(method);
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <CreditCard className="h-4 w-4" /> Financement
        {financingMethod && (
          <span className="ml-1 text-primary font-medium">: {financingMethod}</span>
        )}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        <Button
          variant={!financingMethod ? "default" : "outline"}
          size="sm"
          className="text-xs h-7 px-3 min-w-0 whitespace-nowrap"
          onClick={() => onFinancingMethodChange(null)}
        >
          Tous
        </Button>
        {financingMethods.map((method) => (
          <Button
            key={method}
            variant={financingMethod === method ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-3 min-w-0 whitespace-nowrap"
            onClick={() => handleMethodSelect(method)}
          >
            {method}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FinancingMethodFilter;