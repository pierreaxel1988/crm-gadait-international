
import React from 'react';
import { LeadDetailed, Country, LeadSource } from '@/types/lead';
import FormSection from './FormSection';
import FormInput from './FormInput';
import { User, Mail, Phone, Flag, BarChart, MapPin } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GeneralInfoSectionProps {
  formData: LeadDetailed;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  countries: Country[];
  sources: LeadSource[];
}

const GeneralInfoSection = ({ 
  formData, 
  handleInputChange,
  countries,
  sources
}: GeneralInfoSectionProps) => {
  // Function to get country flag emoji
  const getCountryFlag = (country: string): string => {
    const countryToFlag: Record<string, string> = {
      'Croatia': '🇭🇷',
      'France': '🇫🇷',
      'Greece': '🇬🇷',
      'Maldives': '🇲🇻',
      'Mauritius': '🇲🇺',
      'Portugal': '🇵🇹',
      'Seychelles': '🇸🇨',
      'Spain': '🇪🇸',
      'Switzerland': '🇨🇭',
      'United Arab Emirates': '🇦🇪',
      'United Kingdom': '🇬🇧',
      'United States': '🇺🇸'
    };
    
    return countryToFlag[country] || '';
  };

  return (
    <FormSection title="Informations Générales">
      <div className="space-y-4">
        <FormInput
          label="Nom"
          name="name"
          value={formData.name || ''}
          onChange={handleInputChange}
          required
          icon={User}
          placeholder="Nom complet"
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleInputChange}
          icon={Mail}
          placeholder="Adresse email"
        />

        <FormInput
          label="Téléphone"
          name="phone"
          type="tel-with-code"
          value={formData.phone || ''}
          onChange={handleInputChange}
          icon={Phone}
          placeholder="Numéro de téléphone"
        />

        <FormInput
          label="Nationalité"
          name="nationality"
          type="select"
          value={formData.nationality || ''}
          onChange={handleInputChange}
          icon={Flag}
          options={countries.map(country => ({ 
            value: country, 
            label: `${getCountryFlag(country)} ${country}` 
          }))}
          placeholder="Nationalité du client"
        />

        <FormInput
          label="Pays de résidence"
          name="taxResidence"
          type="select"
          value={formData.taxResidence || ''}
          onChange={handleInputChange}
          icon={MapPin}
          options={countries.map(country => ({ 
            value: country, 
            label: `${getCountryFlag(country)} ${country}` 
          }))}
          placeholder="Pays de résidence fiscale"
        />

        <FormInput
          label="Source"
          name="source"
          type="select"
          value={formData.source || ''}
          onChange={handleInputChange}
          icon={BarChart}
          options={sources.map(source => ({ value: source, label: source }))}
          placeholder="Source du lead"
        />
      </div>
    </FormSection>
  );
};

export default GeneralInfoSection;
