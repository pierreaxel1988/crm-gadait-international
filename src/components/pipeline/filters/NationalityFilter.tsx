import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

// Liste des nationalités courantes
const COMMON_NATIONALITIES = [
  'Française',
  'Belge', 
  'Suisse',
  'Mauricienne',
  'Britannique',
  'Allemande',
  'Italienne',
  'Américaine',
  'Canadienne',
  'Australienne',
  'Sud-Africaine',
  'Autre'
];

interface NationalityFilterProps {
  nationality: string;
  onNationalityChange: (nationality: string) => void;
}

const NationalityFilter = ({ nationality, onNationalityChange }: NationalityFilterProps) => {
  const handleNationalitySelect = (selectedNationality: string) => {
    if (nationality === selectedNationality) {
      onNationalityChange('');
    } else {
      onNationalityChange(selectedNationality);
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Globe className="h-4 w-4" /> Nationalité
        {nationality && (
          <span className="ml-1 text-primary font-medium">: {nationality}</span>
        )}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        <Button
          variant={!nationality ? "default" : "outline"}
          size="sm"
          className="text-xs h-7 px-3 min-w-0 whitespace-nowrap"
          onClick={() => onNationalityChange('')}
        >
          Toutes
        </Button>
        {COMMON_NATIONALITIES.map((nationalityOption) => (
          <Button
            key={nationalityOption}
            variant={nationality === nationalityOption ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-3 min-w-0 whitespace-nowrap"
            onClick={() => handleNationalitySelect(nationalityOption)}
          >
            {nationalityOption}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default NationalityFilter;