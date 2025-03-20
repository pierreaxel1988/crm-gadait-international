
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface ActionButtonsProps {
  onClear: () => void;
  onApply: () => void;
}

const ActionButtons = ({ onClear, onApply }: ActionButtonsProps) => {
  return (
    <div className="flex justify-between pt-2 mt-2 border-t">
      <Button variant="outline" size="sm" onClick={onClear}>
        <X className="h-4 w-4 mr-2" /> Effacer
      </Button>
      <Button variant="action" size="sm" onClick={onApply}>
        <Check className="h-4 w-4 mr-2" /> Appliquer
      </Button>
    </div>
  );
};

export default ActionButtons;
