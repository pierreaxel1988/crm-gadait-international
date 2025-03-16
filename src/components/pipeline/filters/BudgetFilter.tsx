
import React from 'react';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';

interface BudgetFilterProps {
  minBudget: string;
  maxBudget: string;
  onBudgetChange: (type: 'min' | 'max', value: string) => void;
}

const BudgetFilter = ({ minBudget, maxBudget, onBudgetChange }: BudgetFilterProps) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <DollarSign className="h-4 w-4" /> Budget
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Min €</label>
          <Input
            type="text"
            value={minBudget}
            onChange={(e) => onBudgetChange('min', e.target.value)}
            placeholder="Min"
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Max €</label>
          <Input
            type="text"
            value={maxBudget}
            onChange={(e) => onBudgetChange('max', e.target.value)}
            placeholder="Max"
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetFilter;
