
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface ActionButtonsProps {
  onClear?: () => void;
  onApply?: () => void;
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
}

const ActionButtons = ({ onClear, onApply, onClearFilters, onApplyFilters }: ActionButtonsProps) => {
  const handleClear = () => {
    if (onClear) onClear();
    if (onClearFilters) onClearFilters();
  };

  const handleApply = () => {
    if (onApply) onApply();
    if (onApplyFilters) onApplyFilters();
  };

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
