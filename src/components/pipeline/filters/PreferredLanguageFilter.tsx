import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

interface PreferredLanguageFilterProps {
  preferredLanguage: string;
  onPreferredLanguageChange: (language: string) => void;
}

const languages = [
  'Français',
  'Anglais',
  'Allemand',
  'Italien',
  'Espagnol',
  'Portugais',
  'Russe',
  'Chinois',
  'Arabe'
];

const PreferredLanguageFilter: React.FC<PreferredLanguageFilterProps> = ({
  preferredLanguage,
  onPreferredLanguageChange
}) => {
  const handleLanguageSelect = (language: string) => {
    if (preferredLanguage === language) {
      onPreferredLanguageChange('');
    } else {
      onPreferredLanguageChange(language);
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Languages className="h-4 w-4" /> Langue préférée
        {preferredLanguage && (
          <span className="ml-1 text-primary font-medium">: {preferredLanguage}</span>
        )}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        <Button
          variant={!preferredLanguage ? "default" : "outline"}
          size="sm"
          className="text-xs h-7 px-3 min-w-0 whitespace-nowrap"
          onClick={() => onPreferredLanguageChange('')}
        >
          Toutes
        </Button>
        {languages.map((language) => (
          <Button
            key={language}
            variant={preferredLanguage === language ? "default" : "outline"}
            size="sm"
            className="text-xs h-7 px-3 min-w-0 whitespace-nowrap"
            onClick={() => handleLanguageSelect(language)}
          >
            {language}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PreferredLanguageFilter;