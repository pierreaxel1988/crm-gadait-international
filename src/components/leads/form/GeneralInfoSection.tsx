import React, { useState, useEffect } from 'react';
import { LeadDetailed, Country, LeadSource } from '@/types/lead';
import FormSection from './FormSection';
import FormInput from './FormInput';
import { User, Mail, Phone, Flag, BarChart, MapPin, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { COUNTRIES } from '@/utils/countries';
import { deriveNationalityFromCountry, countryMatchesSearch } from '@/components/chat/utils/nationalityUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Textarea } from '@/components/ui/textarea';

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
  const [phoneCountryCode, setPhoneCountryCode] = useState('+33');
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (formData.taxResidence && !formData.nationality) {
      const derivedNationality = deriveNationalityFromCountry(formData.taxResidence);
      if (derivedNationality) {
        const syntheticEvent = {
          target: {
            name: 'nationality',
            value: derivedNationality
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(syntheticEvent);
      }
    }
  }, [formData.taxResidence]);
  
  useEffect(() => {
    if (formData.phone) {
      const countryCodes = ['+33', '+44', '+1', '+34', '+39', '+41', '+32', '+49', '+31', '+7', '+971', '+966', '+965', '+974', '+973', '+230', '+212', '+216', '+213', '+20'];
      const foundCode = countryCodes.find(code => formData.phone?.startsWith(code));
      if (foundCode) {
        setPhoneCountryCode(foundCode);
      }
    }
  }, [formData.phone]);

  const countryCodeMapping: Record<string, string> = {
    '+33': 'France',
    '+44': 'United Kingdom',
    '+1': 'United States',
    '+34': 'Spain',
    '+39': 'Italy',
    '+41': 'Switzerland',
    '+32': 'Belgium',
    '+49': 'Germany',
    '+31': 'Netherlands',
    '+7': 'Russia',
    '+971': 'United Arab Emirates',
    '+966': 'Saudi Arabia',
    '+965': 'Kuwait',
    '+974': 'Qatar',
    '+973': 'Bahrain',
    '+230': 'Mauritius',
    '+212': 'Morocco',
    '+216': 'Tunisia',
    '+213': 'Algeria',
    '+20': 'Egypt'
  };

  const getCountryFlag = (country: string): string => {
    const countryToFlag = (countryCode: string) => {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    };
    
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

  const handlePhoneCodeChange = (code: string) => {
    setPhoneCountryCode(code);
    
    let phoneNumber = formData.phone || '';
    const countryCodes = ['+33', '+44', '+1', '+34', '+39', '+41', '+32', '+49', '+31', '+7', '+971', '+966', '+965', '+974', '+973', '+230', '+212', '+216', '+213', '+20'];
    
    for (const existingCode of countryCodes) {
      if (phoneNumber.startsWith(existingCode)) {
        phoneNumber = phoneNumber.substring(existingCode.length).trim();
        break;
      }
    }
    
    const formattedPhone = phoneNumber ? `${code} ${phoneNumber}` : "";
    const syntheticEvent = {
      target: {
        name: 'phone',
        value: formattedPhone
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
    
    if (countryCodeMapping[code]) {
      const country = countryCodeMapping[code];
      
      if (!formData.taxResidence) {
        const taxResidenceEvent = {
          target: {
            name: 'taxResidence',
            value: country
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(taxResidenceEvent);
      }
      
      if (!formData.nationality) {
        const nationality = deriveNationalityFromCountry(country);
        if (nationality) {
          const nationalityEvent = {
            target: {
              name: 'nationality',
              value: nationality
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleInputChange(nationalityEvent);
        }
      }
    }
  };

  const getPhoneValueWithoutCode = () => {
    if (!formData.phone) return '';
    
    const countryCodes = ['+33', '+44', '+1', '+34', '+39', '+41', '+32', '+49', '+31', '+7', '+971', '+966', '+965', '+974', '+973', '+230', '+212', '+216', '+213', '+20'];
    
    let phoneNumber = formData.phone;
    for (const code of countryCodes) {
      if (phoneNumber.startsWith(code)) {
        return phoneNumber.substring(code.length).trim();
      }
    }
    
    return formData.phone;
  };

  const [showContactPaste, setShowContactPaste] = useState(false);
  const [contactText, setContactText] = useState('');

  const parseContactInfo = () => {
    if (!contactText.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez coller des informations de contact",
        variant: "destructive"
      });
      return;
    }

    let name = '';
    let email = '';
    let phone = '';
    let country = '';
    let language = '';

    const namePatterns = [
      /[À|A] propos de\s+([^\n]+)/i,
      /Name\s*:?\s*([^\r\n]+)/i,
      /Nom\s*:?\s*([^\r\n]+)/i
    ];
    
    const emailPatterns = [
      /e-?mail\s*:?\s*([^\r\n]+)/i,
      /courriel\s*:?\s*([^\r\n]+)/i,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    ];
    
    const phonePatterns = [
      /t[ée]l[ée]phone\s*:?\s*([^\r\n]+)/i,
      /phone\s*:?\s*([^\r\n]+)/i,
      /\(?\+?[0-9][0-9()\-\s.]{7,}\d/
    ];
    
    const countryPatterns = [
      /pays\s*:?\s*([^\r\n]+)/i,
      /country\s*:?\s*([^\r\n]+)/i
    ];
    
    const languagePatterns = [
      /langue\s*:?\s*([^\r\n]+)/i,
      /language\s*:?\s*([^\r\n]+)/i
    ];

    for (const pattern of namePatterns) {
      const match = contactText.match(pattern);
      if (match && match[1]) {
        name = match[1].trim();
        break;
      }
    }

    for (const pattern of emailPatterns) {
      const match = contactText.match(pattern);
      if (match) {
        if (match[1]) {
          email = match[1].trim();
        } else {
          email = match[0].trim();
        }
        break;
      }
    }

    for (const pattern of phonePatterns) {
      const match = contactText.match(pattern);
      if (match) {
        if (match[1]) {
          phone = match[1].trim();
        } else {
          phone = match[0].trim();
        }
        break;
      }
    }

    for (const pattern of countryPatterns) {
      const match = contactText.match(pattern);
      if (match && match[1]) {
        country = match[1].trim();
        break;
      }
    }

    for (const pattern of languagePatterns) {
      const match = contactText.match(pattern);
      if (match && match[1]) {
        language = match[1].trim();
        break;
      }
    }

    if (!name || !email || !phone) {
      const lines = contactText.split('\n').filter(line => line.trim().length > 0);
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (!email && trimmedLine.includes('@')) {
          email = trimmedLine;
        } 
        else if (!phone && /[\d\+]/.test(trimmedLine) && (trimmedLine.includes('+') || trimmedLine.includes(' '))) {
          phone = trimmedLine;
        } 
        else if (!name && !trimmedLine.toLowerCase().includes('phone') && 
                !trimmedLine.toLowerCase().includes('mail') && 
                !trimmedLine.toLowerCase().includes('pays') && 
                !trimmedLine.toLowerCase().includes('langue')) {
          name = trimmedLine;
        }
      });
    }

    let countryCodeFound = false;
    if (phone) {
      const codeMatch = phone.match(/\+(\d+)/);
      if (codeMatch && codeMatch[1]) {
        const code = codeMatch[1];
        const countryCodeMap: Record<string, string> = {
          '1': 'United States',
          '33': 'France',
          '34': 'Spain',
          '44': 'United Kingdom',
          '49': 'Germany',
          '39': 'Italy',
          '41': 'Switzerland',
          '32': 'Belgium',
          '31': 'Netherlands',
          '7': 'Russia',
          '971': 'United Arab Emirates',
          '966': 'Saudi Arabia',
          '965': 'Kuwait',
          '974': 'Qatar',
          '973': 'Bahrain',
          '230': 'Mauritius',
          '212': 'Morocco',
          '216': 'Tunisia',
          '213': 'Algeria',
          '20': 'Egypt'
        };
        
        if (code in countryCodeMap) {
          if (!country) {
            country = countryCodeMap[code];
          }
          setPhoneCountryCode('+' + code);
          countryCodeFound = true;
        }
      }
    }

    console.log("Informations extraites:", { name, email, phone, country, language, countryCode: phoneCountryCode });

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
      if (countryCodeFound) {
        const phoneEvent = {
          target: {
            name: 'phone',
            value: phone
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(phoneEvent);
      } else {
        const phoneEvent = {
          target: {
            name: 'phone',
            value: `${phoneCountryCode} ${phone.replace(/^\+\d+\s*/, '')}`
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(phoneEvent);
      }
    }

    if (country) {
      const countryEvent = {
        target: {
          name: 'taxResidence',
          value: country
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(countryEvent);
      
      const nationality = deriveNationalityFromCountry(country);
      if (nationality) {
        const nationalityEvent = {
          target: {
            name: 'nationality',
            value: nationality
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(nationalityEvent);
      }
    }

    setShowContactPaste(false);
    setContactText('');
    
    toast({
      title: "Informations importées",
      description: "Les informations de contact ont été extraites avec succès."
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value;
    
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
            <Textarea 
              className="w-full p-2 text-sm border rounded-md h-24 font-futura" 
              placeholder="Exemple:
À propos de David
Téléphone
(+1) 4185093022
E-mail
laura.luna@yahoo.ca
Langue
français
Pays
France"
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
          label="Civilité"
          name="salutation"
          type="select"
          value={formData.salutation || ''}
          onChange={handleInputChange}
          icon={User}
          options={[
            { value: 'M.', label: 'M.' },
            { value: 'Mme', label: 'Mme' }
          ]}
          placeholder="Sélectionner..."
          className="mb-3"
        />

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
          searchable={true}
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
            searchable={true}
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
            searchable={true}
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
            searchable={true}
          />
        </div>
      </div>
    </FormSection>
  );
};

export default GeneralInfoSection;
