
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface FilterActionsProps {
  onClear: () => void;
  onApply: () => void;
  className?: string;
}

const FilterActions = ({ onClear, onApply, className }: FilterActionsProps) => {
  return (
    <div className={`flex justify-between pt-4 border-t ${className || ''}`}>
      <Button variant="outline" size="sm" onClick={onClear} className="font-medium">
        <X className="h-4 w-4 mr-2" /> Effacer
      </Button>
      <Button size="sm" onClick={onApply} className="font-medium">
        <Check className="h-4 w-4 mr-2" /> Appliquer
      </Button>
    </div>
  );
};

export default FilterActions;
