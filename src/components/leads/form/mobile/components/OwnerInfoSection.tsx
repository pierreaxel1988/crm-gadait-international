
import React, { useState } from 'react';
import { LeadDetailed, LeadSource } from '@/types/lead';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronDown } from 'lucide-react';
import FormInput from '../../FormInput';
import { COUNTRIES } from '@/utils/countries';
import { countryToFlag } from '@/utils/countryUtils';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import NationalitySelector from '../../selectors/NationalitySelector';

interface OwnerInfoSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const OwnerInfoSection: React.FC<OwnerInfoSectionProps> = ({
  lead,
  onDataChange
}) => {
  const [isNationalitySelectorOpen, setIsNationalitySelectorOpen] = useState(false);

  const LEAD_SOURCES: LeadSource[] = [
    "Site web", "Réseaux sociaux", "Portails immobiliers", "Network", 
    "Repeaters", "Recommandations", "Apporteur d'affaire", "Idealista",
    "Le Figaro", "Properstar", "Property Cloud", "L'express Property",
    "James Edition", "Annonce", "Email", "Téléphone", "Autre", "Recommendation"
  ];

  const LANGUAGES = [
    "Français", "English", "Español", "Deutsch", "Italiano", "Nederlands", 
    "Português", "русский", "中文", "العربية", "हिन्दी", "日本語"
  ];

  const handleNationalitySelect = (nationality: string) => {
    onDataChange({ nationality });
    setIsNationalitySelectorOpen(false);
  };

  const getNationalityFromCountry = (countryName: string): string => {
    return deriveNationalityFromCountry(countryName) || countryName;
  };

  const getCountryFromNationality = (nationality: string): string => {
    // Logique simple pour retrouver le pays depuis la nationalité
    const nationalityToCountry: Record<string, string> = {
      'Française': 'France',
      'Britannique': 'United Kingdom',
      'Allemande': 'Germany',
      'Italienne': 'Italy',
      'Espagnole': 'Spain',
      'Belge': 'Belgium',
      'Suisse': 'Switzerland',
      'Américaine': 'United States',
      'Canadienne': 'Canada',
      'Australienne': 'Australia',
      'Néerlandaise': 'Netherlands',
      'Portugaise': 'Portugal',
      'Russe': 'Russia',
      'Japonaise': 'Japan',
      'Chinoise': 'China',
      'Indienne': 'India',
      'Brésilienne': 'Brazil'
    };
    return nationalityToCountry[nationality] || 'France';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Civilité</Label>
        <RadioGroup 
          value={lead.salutation || ''} 
          onValueChange={(value) => onDataChange({ salutation: value as 'M.' | 'Mme' })}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="M." id="monsieur" />
            <Label htmlFor="monsieur" className="text-sm font-futura cursor-pointer">M.</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Mme" id="madame" />
            <Label htmlFor="madame" className="text-sm font-futura cursor-pointer">Mme</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm">Nom complet</Label>
        <Input 
          id="name" 
          value={lead.name || ''} 
          onChange={e => onDataChange({ name: e.target.value })} 
          placeholder="Nom et prénom" 
          className="w-full font-futura"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm">Email</Label>
        <Input 
          id="email" 
          type="email"
          value={lead.email || ''} 
          onChange={e => onDataChange({ email: e.target.value })} 
          placeholder="exemple@email.com" 
          className="w-full font-futura"
        />
      </div>

      <FormInput
        label="Téléphone"
        name="phone"
        type="tel-with-code"
        value={lead.phone || ''}
        onChange={e => onDataChange({ phone: e.target.value })}
        placeholder="Numéro de téléphone"
        countryCode={lead.phoneCountryCode || '+33'}
        countryCodeDisplay={lead.phoneCountryCodeDisplay || '🇫🇷'}
        onCountryCodeChange={(code) => {
          const flagMap: Record<string, string> = {
            '+33': '🇫🇷', '+1': '🇺🇸', '+44': '🇬🇧', '+34': '🇪🇸', '+39': '🇮🇹',
            '+41': '🇨🇭', '+49': '🇩🇪', '+32': '🇧🇪', '+31': '🇳🇱', '+351': '🇵🇹',
            '+230': '🇲🇺', '+971': '🇦🇪'
          };
          onDataChange({ 
            phoneCountryCode: code,
            phoneCountryCodeDisplay: flagMap[code] || '🌍'
          });
        }}
        searchable={true}
        showFlagsInDropdown={true}
      />

      <FormInput
        label="Pays de résidence"
        name="residenceCountry"
        type="select"
        value={lead.residenceCountry || ''}
        onChange={e => onDataChange({ residenceCountry: e.target.value })}
        placeholder="Sélectionner un pays"
        options={COUNTRIES.map(country => ({ value: country, label: country }))}
        searchable={true}
      />

      <div className="space-y-2">
        <Label htmlFor="nationality" className="text-sm">Nationalité</Label>
        <div 
          className="flex items-center justify-between px-3 py-2 h-10 w-full border border-input rounded-md bg-background text-sm cursor-pointer hover:bg-accent transition-colors"
          onClick={() => setIsNationalitySelectorOpen(true)}
        >
          {lead.nationality ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{countryToFlag(getCountryFromNationality(lead.nationality))}</span>
              <span className="font-futura">{lead.nationality}</span>
            </div>
          ) : (
            <span className="text-muted-foreground font-futura">Sélectionner une nationalité</span>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <FormInput
        label="Langue préférée"
        name="preferredLanguage"
        type="select"
        value={lead.preferredLanguage || ''}
        onChange={e => onDataChange({ preferredLanguage: e.target.value })}
        placeholder="Sélectionner une langue"
        options={LANGUAGES.map(language => ({ value: language, label: language }))}
        searchable={true}
      />

      <FormInput
        label="Source du contact"
        name="source"
        type="select"
        value={lead.source || ''}
        onChange={e => onDataChange({ source: e.target.value as LeadSource })}
        placeholder="Sélectionner une source"
        options={LEAD_SOURCES.map(source => ({ value: source, label: source }))}
        searchable={true}
      />

      <NationalitySelector
        isOpen={isNationalitySelectorOpen}
        onClose={() => setIsNationalitySelectorOpen(false)}
        onSelect={handleNationalitySelect}
        selectedNationality={lead.nationality}
        title="Sélectionner une nationalité"
        searchPlaceholder="Rechercher une nationalité..."
      />
    </div>
  );
};

export default OwnerInfoSection;
