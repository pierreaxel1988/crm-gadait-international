
import React, { useState } from 'react';
import { LeadDetailed, Country, LeadSource } from '@/types/lead';
import FormSection from './FormSection';
import FormInput from './FormInput';
import { User, Mail, Phone, Flag, BarChart, MapPin, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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

  // State to handle the contact info textarea for quick paste
  const [showContactPaste, setShowContactPaste] = useState(false);
  const [contactText, setContactText] = useState('');

  // Function to parse pasted contact information
  const parseContactInfo = () => {
    if (!contactText.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez coller des informations de contact",
        variant: "destructive"
      });
      return;
    }

    // Split by new lines
    const lines = contactText.split('\n').filter(line => line.trim().length > 0);
    
    // Extract data based on position and patterns
    let name = '';
    let email = '';
    let phone = '';

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if line contains an email (has @ symbol)
      if (trimmedLine.includes('@')) {
        email = trimmedLine;
      } 
      // Check if line contains phone number (has digits and possibly +)
      else if (/[\d\+]/.test(trimmedLine) && (trimmedLine.includes('+') || trimmedLine.includes(' '))) {
        phone = trimmedLine;
      } 
      // If not email or phone, consider it as name
      else if (!name) {
        name = trimmedLine;
      }
    });

    // Create synthetic events to update the form
    if (name) {
      const nameEvent = {
        target: {
          name: 'name',
          value: name
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(nameEvent);
    }

    if (email) {
      const emailEvent = {
        target: {
          name: 'email',
          value: email
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(emailEvent);
    }

    if (phone) {
      const phoneEvent = {
        target: {
          name: 'phone',
          value: phone
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(phoneEvent);
    }

    // Hide the paste area and show a success toast
    setShowContactPaste(false);
    setContactText('');
    
    toast({
      title: "Informations importées",
      description: "Les informations de contact ont été extraites avec succès."
    });
  };

  return (
    <FormSection title="Informations Générales">
      <div className="space-y-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium">Détails de contact</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setShowContactPaste(!showContactPaste)}
            className="text-xs flex items-center gap-1"
          >
            <Clipboard className="h-3.5 w-3.5" />
            {showContactPaste ? 'Masquer' : 'Copier/Coller contact'}
          </Button>
        </div>

        {showContactPaste && (
          <div className="space-y-2 mb-4 p-3 border border-dashed border-gray-300 rounded-md bg-gray-50">
            <p className="text-xs text-muted-foreground">
              Collez les informations de contact (nom, téléphone, email) puis cliquez sur Extraire :
            </p>
            <textarea 
              className="w-full p-2 text-sm border rounded-md h-24" 
              placeholder="Exemple:
Fatiha Mohamed
+34 644 15 78 61
fmohamed01@cuatrocaminos.net"
              value={contactText}
              onChange={(e) => setContactText(e.target.value)}
            />
            <div className="flex justify-end">
              <Button 
                type="button" 
                size="sm" 
                onClick={parseContactInfo}
                className="text-xs"
              >
                Extraire
              </Button>
            </div>
          </div>
        )}

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

        <div className="mb-3">
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
            placeholder="Sélectionner..."
            className="mb-0"
          />
        </div>

        <div className="mb-3">
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
            placeholder="Sélectionner..."
            className="mb-0"
          />
        </div>

        <div className="mb-3">
          <FormInput
            label="Source"
            name="source"
            type="select"
            value={formData.source || ''}
            onChange={handleInputChange}
            icon={BarChart}
            options={sources.map(source => ({ value: source, label: source }))}
            placeholder="Sélectionner..."
            className="mb-0"
          />
        </div>
      </div>
    </FormSection>
  );
};

export default GeneralInfoSection;
