import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ArrowRight } from 'lucide-react';

interface EnhancedBudgetFilterProps {
  minBudget: string;
  maxBudget: string;
  onBudgetChange: (type: 'min' | 'max', value: string) => void;
}

const EnhancedBudgetFilter = ({ minBudget, maxBudget, onBudgetChange }: EnhancedBudgetFilterProps) => {
  const formatNumber = (value: string) => {
    if (!value) return '';
    const num = parseInt(value.replace(/[^\d]/g, ''));
    return num.toLocaleString('fr-FR');
  };

  const handleInputChange = (type: 'min' | 'max', value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    onBudgetChange(type, numericValue);
  };

  const hasValues = minBudget || maxBudget;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="h-5 w-5 text-primary" />
        <h4 className="font-medium text-foreground">Budget</h4>
        {hasValues && (
          <Badge variant="secondary" className="text-xs">
            {minBudget && maxBudget 
              ? `${formatNumber(minBudget)} - ${formatNumber(maxBudget)} €`
              : minBudget 
                ? `À partir de ${formatNumber(minBudget)} €`
                : `Jusqu'à ${formatNumber(maxBudget)} €`
            }
          </Badge>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minBudget" className="text-sm font-medium text-foreground">
              Budget minimum
            </Label>
            <div className="relative">
              <Input
                id="minBudget"
                type="text"
                placeholder="500 000"
                value={formatNumber(minBudget)}
                onChange={(e) => handleInputChange('min', e.target.value)}
                className="h-12 text-base pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                €
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxBudget" className="text-sm font-medium text-foreground">
              Budget maximum
            </Label>
            <div className="relative">
              <Input
                id="maxBudget"
                type="text"
                placeholder="2 000 000"
                value={formatNumber(maxBudget)}
                onChange={(e) => handleInputChange('max', e.target.value)}
                className="h-12 text-base pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                €
              </span>
            </div>
          </div>
        </div>

        {hasValues && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Fourchette sélectionnée :
            </span>
            <div className="flex items-center gap-2 text-sm font-medium">
              {minBudget && <span>{formatNumber(minBudget)} €</span>}
              {minBudget && maxBudget && <ArrowRight className="h-3 w-3" />}
              {maxBudget && <span>{formatNumber(maxBudget)} €</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedBudgetFilter;