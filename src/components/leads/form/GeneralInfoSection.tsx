
import React, { useState } from 'react';
import { LeadDetailed, Country, LeadSource } from '@/types/lead';
import FormSection from './FormSection';
import FormInput from './FormInput';
import { User, Mail, Phone, Flag, BarChart, MapPin, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { COUNTRIES } from '@/utils/countries';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';

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
  // State pour gérer le code pays
  const [phoneCountryCode, setPhoneCountryCode] = useState('+33');
  
  // Fonction pour extraire le code pays du numéro de téléphone existant
  React.useEffect(() => {
    if (formData.phone) {
      // Rechercher un code pays au début du numéro
      const countryCodes = ['+33', '+44', '+1', '+34', '+39', '+41', '+32', '+49', '+31', '+7', '+971', '+966', '+965', '+974', '+973', '+230', '+212', '+216', '+213', '+20'];
      const foundCode = countryCodes.find(code => formData.phone?.startsWith(code));
      if (foundCode) {
        setPhoneCountryCode(foundCode);
      }
    }
  }, [formData.phone]);
  
  // Function to get country flag emoji
  const getCountryFlag = (country: string): string => {
    // Use emoji country flags
    const countryToFlag = (countryCode: string) => {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    };
    
    // Map country names to ISO 3166-1 alpha-2 codes for the most common countries
    const countryNameToCode: Record<string, string> = {
      'Afghanistan': 'AF', 'Albania': 'AL', 'Algeria': 'DZ', 'Andorra': 'AD', 
      'Angola': 'AO', 'Antigua and Barbuda': 'AG', 'Argentina': 'AR', 'Armenia': 'AM', 
      'Australia': 'AU', 'Austria': 'AT', 'Azerbaijan': 'AZ', 'Bahamas': 'BS', 
      'Bahrain': 'BH', 'Bangladesh': 'BD', 'Barbados': 'BB', 'Belarus': 'BY', 
      'Belgium': 'BE', 'Belize': 'BZ', 'Benin': 'BJ', 'Bhutan': 'BT', 
      'Bolivia': 'BO', 'Bosnia and Herzegovina': 'BA', 'Botswana': 'BW', 'Brazil': 'BR', 
      'Brunei': 'BN', 'Bulgaria': 'BG', 'Burkina Faso': 'BF', 'Burundi': 'BI', 
      'Cabo Verde': 'CV', 'Cambodia': 'KH', 'Cameroon': 'CM', 'Canada': 'CA', 
      'Central African Republic': 'CF', 'Chad': 'TD', 'Chile': 'CL', 'China': 'CN', 
      'Colombia': 'CO', 'Comoros': 'KM', 'Congo': 'CD', 'Costa Rica': 'CR', 
      'Croatia': 'HR', 'Cuba': 'CU', 'Cyprus': 'CY', 'Czech Republic': 'CZ', 
      'Denmark': 'DK', 'Djibouti': 'DJ', 'Dominica': 'DM', 'Dominican Republic': 'DO', 
      'East Timor': 'TL', 'Ecuador': 'EC', 'Egypt': 'EG', 'El Salvador': 'SV', 
      'Equatorial Guinea': 'GQ', 'Eritrea': 'ER', 'Estonia': 'EE', 'Eswatini': 'SZ', 
      'Ethiopia': 'ET', 'Fiji': 'FJ', 'Finland': 'FI', 'France': 'FR', 
      'Gabon': 'GA', 'Gambia': 'GM', 'Georgia': 'GE', 'Germany': 'DE', 
      'Ghana': 'GH', 'Greece': 'GR', 'Grenada': 'GD', 'Guatemala': 'GT', 
      'Guinea': 'GN', 'Guinea-Bissau': 'GW', 'Guyana': 'GY', 'Haiti': 'HT', 
      'Honduras': 'HN', 'Hungary': 'HU', 'Iceland': 'IS', 'India': 'IN', 
      'Indonesia': 'ID', 'Iran': 'IR', 'Iraq': 'IQ', 'Ireland': 'IE', 
      'Israel': 'IL', 'Italy': 'IT', 'Ivory Coast': 'CI', 'Jamaica': 'JM', 
      'Japan': 'JP', 'Jordan': 'JO', 'Kazakhstan': 'KZ', 'Kenya': 'KE', 
      'Kiribati': 'KI', 'Korea, North': 'KP', 'Korea, South': 'KR', 'Kosovo': 'XK', 
      'Kuwait': 'KW', 'Kyrgyzstan': 'KG', 'Laos': 'LA', 'Latvia': 'LV', 
      'Lebanon': 'LB', 'Lesotho': 'LS', 'Liberia': 'LR', 'Libya': 'LY', 
      'Liechtenstein': 'LI', 'Lithuania': 'LT', 'Luxembourg': 'LU', 'Madagascar': 'MG', 
      'Malawi': 'MW', 'Malaysia': 'MY', 'Maldives': 'MV', 'Mali': 'ML', 
      'Malta': 'MT', 'Marshall Islands': 'MH', 'Mauritania': 'MR', 'Mauritius': 'MU', 
      'Mexico': 'MX', 'Micronesia': 'FM', 'Moldova': 'MD', 'Monaco': 'MC', 
      'Mongolia': 'MN', 'Montenegro': 'ME', 'Morocco': 'MA', 'Mozambique': 'MZ', 
      'Myanmar': 'MM', 'Namibia': 'NA', 'Nauru': 'NR', 'Nepal': 'NP', 
      'Netherlands': 'NL', 'New Zealand': 'NZ', 'Nicaragua': 'NI', 'Niger': 'NE', 
      'Nigeria': 'NG', 'North Macedonia': 'MK', 'Norway': 'NO', 'Oman': 'OM', 
      'Pakistan': 'PK', 'Palau': 'PW', 'Panama': 'PA', 'Papua New Guinea': 'PG', 
      'Paraguay': 'P', 'Peru': 'PE', 'Philippines': 'PH', 'Poland': 'PL', 
      'Portugal': 'PT', 'Qatar': 'QA', 'Romania': 'RO', 'Russia': 'RU', 
      'Rwanda': 'RW', 'Saint Kitts and Nevis': 'KN', 'Saint Lucia': 'LC', 
      'Saint Vincent and the Grenadines': 'VC', 'Samoa': 'WS', 'San Marino': 'SM', 
      'Sao Tome and Principe': 'ST', 'Saudi Arabia': 'SA', 'Senegal': 'SN', 
      'Serbia': 'RS', 'Seychelles': 'SC', 'Sierra Leone': 'SL', 'Singapore': 'SG', 
      'Slovakia': 'SK', 'Slovenia': 'SI', 'Solomon Islands': 'SB', 'Somalia': 'SO', 
      'South Africa': 'ZA', 'South Sudan': 'SS', 'Spain': 'ES', 'Sri Lanka': 'LK', 
      'Sudan': 'SD', 'Suriname': 'SR', 'Sweden': 'SE', 'Switzerland': 'CH', 
      'Syria': 'SY', 'Taiwan': 'TW', 'Tajikistan': 'TJ', 'Tanzania': 'TZ', 
      'Thailand': 'TH', 'Togo': 'TG', 'Tonga': 'TO', 'Trinidad and Tobago': 'TT', 
      'Tunisia': 'TN', 'Turkey': 'TR', 'Turkmenistan': 'TM', 'Tuvalu': 'TV', 
      'Uganda': 'UG', 'Ukraine': 'UA', 'United Arab Emirates': 'AE', 'United Kingdom': 'GB', 
      'United States': 'US', 'Uruguay': 'UY', 'Uzbekistan': 'UZ', 'Vanuatu': 'VU', 
      'Vatican City': 'VA', 'Venezuela': 'VE', 'Vietnam': 'VN', 'Yemen': 'YE', 
      'Zambia': 'ZM', 'Zimbabwe': 'ZW'
    };

    const code = countryNameToCode[country];
    return code ? countryToFlag(code) : '🌍';
  };

  // Gérer le changement de code pays
  const handlePhoneCodeChange = (code: string) => {
    setPhoneCountryCode(code);
    
    // Extraire le numéro de téléphone sans code pays
    let phoneNumber = formData.phone || '';
    const countryCodes = ['+33', '+44', '+1', '+34', '+39', '+41', '+32', '+49', '+31', '+7', '+971', '+966', '+965', '+974', '+973', '+230', '+212', '+216', '+213', '+20'];
    
    // Supprimer tout code pays existant
    for (const existingCode of countryCodes) {
      if (phoneNumber.startsWith(existingCode)) {
        phoneNumber = phoneNumber.substring(existingCode.length).trim();
        break;
      }
    }
    
    // Mettre à jour le numéro avec le nouveau code pays
    const formattedPhone = phoneNumber ? `${code} ${phoneNumber}` : "";
    const syntheticEvent = {
      target: {
        name: 'phone',
        value: formattedPhone
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };

  // Adapter la valeur du téléphone pour l'affichage dans le champ
  const getPhoneValueWithoutCode = () => {
    if (!formData.phone) return '';
    
    // Rechercher et supprimer le code pays du numéro de téléphone
    const countryCodes = ['+33', '+44', '+1', '+34', '+39', '+41', '+32', '+49', '+31', '+7', '+971', '+966', '+965', '+974', '+973', '+230', '+212', '+216', '+213', '+20'];
    
    let phoneNumber = formData.phone;
    for (const code of countryCodes) {
      if (phoneNumber.startsWith(code)) {
        return phoneNumber.substring(code.length).trim();
      }
    }
    
    return formData.phone;
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
        
        // Tenter d'extraire un code pays s'il existe
        const codeMatch = phone.match(/^\+\d+/);
        if (codeMatch && codeMatch[0]) {
          setPhoneCountryCode(codeMatch[0]);
        }
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

  // Gérer les changements spécifiques au champ téléphone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value;
    
    // Si le champ est vide, effacer complètement le numéro de téléphone
    if (!phoneNumber) {
      const syntheticEvent = {
        target: {
          name: 'phone',
          value: ''
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(syntheticEvent);
      return;
    }
    
    // Sinon, ajouter le code pays actuel au numéro
    const formattedPhone = `${phoneCountryCode} ${phoneNumber}`;
    const syntheticEvent = {
      target: {
        name: 'phone',
        value: formattedPhone
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
  };

  return (
    <FormSection title="Informations Générales">
      <div className="space-y-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-futura uppercase tracking-wider">Détails de contact</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setShowContactPaste(!showContactPaste)}
            className="text-xs flex items-center gap-1 font-futura"
          >
            <Clipboard className="h-3.5 w-3.5" />
            {showContactPaste ? 'Masquer' : 'Copier/Coller contact'}
          </Button>
        </div>

        {showContactPaste && (
          <div className="space-y-2 mb-4 p-3 border border-dashed border-gray-300 rounded-md bg-gray-50">
            <p className="text-xs text-muted-foreground font-futura">
              Collez les informations de contact (nom, téléphone, email) puis cliquez sur Extraire :
            </p>
            <textarea 
              className="w-full p-2 text-sm border rounded-md h-24 font-futura" 
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
                className="text-xs font-futura uppercase tracking-wide"
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
          value={getPhoneValueWithoutCode()}
          onChange={handlePhoneChange}
          icon={Phone}
          placeholder="Numéro de téléphone"
          countryCode={phoneCountryCode}
          onCountryCodeChange={handlePhoneCodeChange}
        />

        <div className="mb-3">
          <FormInput
            label="Nationalité"
            name="nationality"
            type="select"
            value={formData.nationality || ''}
            onChange={handleInputChange}
            icon={Flag}
            options={COUNTRIES.map(country => ({ 
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
            options={COUNTRIES.map(country => ({ 
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
