
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface ActionButtonsProps {
  onClear?: () => void;
  onApply?: () => void;
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
  compact?: boolean;
  elegant?: boolean;
}

const ActionButtons = ({ onClear, onApply, onClearFilters, onApplyFilters, compact = false, elegant = false }: ActionButtonsProps) => {
  const handleClear = () => {
    if (onClear) onClear();
    if (onClearFilters) onClearFilters();
  };

  const handleApply = () => {
    if (onApply) onApply();
    if (onApplyFilters) onApplyFilters();
  };

  if (elegant) {
    return (
      <div className="flex justify-between items-center w-full gap-6">
        <Button 
          variant="outline" 
          size="default" 
          onClick={handleClear} 
          className="font-medium px-8 py-2 border-2 hover:bg-muted/50 transition-all duration-200"
        >
          <X className="h-4 w-4 mr-2" /> 
          Effacer tous les filtres
        </Button>
        <Button 
          size="default" 
          onClick={handleApply} 
          className="font-medium px-8 py-2 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-lg"
        >
          <Check className="h-4 w-4 mr-2" /> 
          Appliquer les filtres
        </Button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleClear} className="text-xs">
          <X className="h-3 w-3 mr-1" /> Effacer
        </Button>
        {onApply && (
          <Button size="sm" onClick={handleApply} className="text-xs">
            <Check className="h-3 w-3 mr-1" /> Appliquer
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-between pt-2 mt-2 border-t">
      <Button variant="outline" size="sm" onClick={handleClear} className="font-futura">
        <X className="h-4 w-4 mr-2" /> Effacer
      </Button>
      <Button size="sm" onClick={handleApply} className="font-futura">
        <Check className="h-4 w-4 mr-2" /> Appliquer
      </Button>
    </div>
  );
};

export default ActionButtons;
