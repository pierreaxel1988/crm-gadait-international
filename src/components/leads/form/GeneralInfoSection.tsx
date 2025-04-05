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
      const countryCodes = [
        '+1', '+7', '+20', '+27', '+30', '+31', '+32', '+33', '+34', '+36', '+39', 
        '+40', '+41', '+43', '+44', '+45', '+46', '+47', '+48', '+49', '+51', '+52', 
        '+53', '+54', '+55', '+56', '+57', '+58', '+60', '+61', '+62', '+63', '+64', 
        '+65', '+66', '+81', '+82', '+84', '+86', '+90', '+91', '+92', '+93', '+94', 
        '+95', '+98', '+212', '+213', '+216', '+218', '+220', '+221', '+222', '+223', 
        '+224', '+225', '+226', '+227', '+228', '+229', '+230', '+231', '+232', '+233', 
        '+234', '+235', '+236', '+237', '+238', '+239', '+240', '+241', '+242', '+243', 
        '+244', '+245', '+246', '+247', '+248', '+249', '+250', '+251', '+252', '+253', 
        '+254', '+255', '+256', '+257', '+258', '+260', '+261', '+262', '+263', '+264', 
        '+265', '+266', '+267', '+268', '+269', '+290', '+291', '+297', '+298', '+299', 
        '+350', '+351', '+352', '+353', '+354', '+355', '+356', '+357', '+358', '+359', 
        '+370', '+371', '+372', '+373', '+374', '+375', '+376', '+377', '+378', '+379', 
        '+380', '+381', '+382', '+383', '+385', '+386', '+387', '+389', '+420', '+421', 
        '+423', '+500', '+501', '+502', '+503', '+504', '+505', '+506', '+507', '+508', 
        '+509', '+590', '+591', '+592', '+593', '+594', '+595', '+596', '+597', '+598', 
        '+599', '+670', '+672', '+673', '+674', '+675', '+676', '+677', '+678', '+679', 
        '+680', '+681', '+682', '+683', '+685', '+686', '+687', '+688', '+689', '+690', 
        '+691', '+692', '+850', '+852', '+853', '+855', '+856', '+880', '+886', '+960', 
        '+961', '+962', '+963', '+964', '+965', '+966', '+967', '+968', '+970', '+971', 
        '+972', '+973', '+974', '+975', '+976', '+977', '+992', '+993', '+994', '+995', 
        '+996', '+998'
      ];
      
      const sortedCodes = [...countryCodes].sort((a, b) => b.length - a.length);
      
      const foundCode = sortedCodes.find(code => formData.phone?.startsWith(code));
      if (foundCode) {
        setPhoneCountryCode(foundCode);
      }
    }
  }, [formData.phone]);

  const countryCodeMapping: Record<string, string> = {
    '+1': 'United States',
    '+7': 'Russia',
    '+20': 'Egypt',
    '+27': 'South Africa',
    '+30': 'Greece',
    '+31': 'Netherlands',
    '+32': 'Belgium',
    '+33': 'France',
    '+34': 'Spain',
    '+36': 'Hungary',
    '+39': 'Italy',
    '+40': 'Romania',
    '+41': 'Switzerland',
    '+43': 'Austria',
    '+44': 'United Kingdom',
    '+45': 'Denmark',
    '+46': 'Sweden',
    '+47': 'Norway',
    '+48': 'Poland',
    '+49': 'Germany',
    '+51': 'Peru',
    '+52': 'Mexico',
    '+53': 'Cuba',
    '+54': 'Argentina',
    '+55': 'Brazil',
    '+56': 'Chile',
    '+57': 'Colombia',
    '+58': 'Venezuela',
    '+60': 'Malaysia',
    '+61': 'Australia',
    '+62': 'Indonesia',
    '+63': 'Philippines',
    '+64': 'New Zealand',
    '+65': 'Singapore',
    '+66': 'Thailand',
    '+81': 'Japan',
    '+82': 'South Korea',
    '+84': 'Vietnam',
    '+86': 'China',
    '+90': 'Turkey',
    '+91': 'India',
    '+92': 'Pakistan',
    '+93': 'Afghanistan',
    '+94': 'Sri Lanka',
    '+95': 'Myanmar',
    '+98': 'Iran',
    '+212': 'Morocco',
    '+213': 'Algeria',
    '+216': 'Tunisia',
    '+218': 'Libya',
    '+230': 'Mauritius',
    '+234': 'Nigeria',
    '+248': 'Seychelles',
    '+249': 'Sudan',
    '+254': 'Kenya',
    '+255': 'Tanzania',
    '+256': 'Uganda',
    '+260': 'Zambia',
    '+262': 'Réunion',
    '+263': 'Zimbabwe',
    '+264': 'Namibia',
    '+267': 'Botswana',
    '+351': 'Portugal',
    '+352': 'Luxembourg',
    '+353': 'Ireland',
    '+354': 'Iceland',
    '+355': 'Albania',
    '+357': 'Cyprus',
    '+358': 'Finland',
    '+359': 'Bulgaria',
    '+370': 'Lithuania',
    '+371': 'Latvia',
    '+372': 'Estonia',
    '+373': 'Moldova',
    '+374': 'Armenia',
    '+375': 'Belarus',
    '+376': 'Andorra',
    '+377': 'Monaco',
    '+378': 'San Marino',
    '+380': 'Ukraine',
    '+385': 'Croatia',
    '+386': 'Slovenia',
    '+387': 'Bosnia and Herzegovina',
    '+420': 'Czech Republic',
    '+421': 'Slovakia',
    '+423': 'Liechtenstein',
    '+503': 'El Salvador',
    '+504': 'Honduras',
    '+505': 'Nicaragua',
    '+506': 'Costa Rica',
    '+507': 'Panama',
    '+591': 'Bolivia',
    '+593': 'Ecuador',
    '+595': 'Paraguay',
    '+598': 'Uruguay',
    '+852': 'Hong Kong',
    '+855': 'Cambodia',
    '+856': 'Laos',
    '+880': 'Bangladesh',
    '+886': 'Taiwan',
    '+960': 'Maldives',
    '+961': 'Lebanon',
    '+962': 'Jordan',
    '+963': 'Syria',
    '+964': 'Iraq',
    '+965': 'Kuwait',
    '+966': 'Saudi Arabia',
    '+967': 'Yemen',
    '+968': 'Oman',
    '+970': 'Palestine',
    '+971': 'United Arab Emirates',
    '+972': 'Israel',
    '+973': 'Bahrain',
    '+974': 'Qatar',
    '+975': 'Bhutan',
    '+976': 'Mongolia',
    '+977': 'Nepal',
    '+992': 'Tajikistan',
    '+993': 'Turkmenistan',
    '+994': 'Azerbaijan',
    '+995': 'Georgia',
    '+996': 'Kyrgyzstan',
    '+998': 'Uzbekistan'
  };

  const getCountryFlagEmoji = (countryCode: string): string => {
    const codeToCountry: Record<string, string> = {
      '+1': 'US',
      '+7': 'RU',
      '+20': 'EG',
      '+27': 'ZA',
      '+30': 'GR',
      '+31': 'NL',
      '+32': 'BE',
      '+33': 'FR',
      '+34': 'ES',
      '+36': 'HU',
      '+39': 'IT',
      '+41': 'CH',
      '+43': 'AT',
      '+44': 'GB',
      '+45': 'DK',
      '+46': 'SE',
      '+47': 'NO',
      '+48': 'PL',
      '+49': 'DE',
      '+51': 'PE',
      '+52': 'MX',
      '+53': 'CU',
      '+54': 'AR',
      '+55': 'BR',
      '+56': 'CL',
      '+57': 'CO',
      '+58': 'VE',
      '+60': 'MY',
      '+61': 'AU',
      '+62': 'ID',
      '+63': 'PH',
      '+64': 'NZ',
      '+65': 'SG',
      '+66': 'TH',
      '+81': 'JP',
      '+82': 'KR',
      '+84': 'VN',
      '+86': 'CN',
      '+90': 'TR',
      '+91': 'IN',
      '+92': 'PK',
      '+93': 'AF',
      '+94': 'LK',
      '+95': 'MM',
      '+98': 'IR',
      '+212': 'MA',
      '+213': 'DZ',
      '+216': 'TN',
      '+218': 'LY',
      '+230': 'MU',
      '+234': 'NG',
      '+248': 'SC',
      '+249': 'SD',
      '+254': 'KE',
      '+255': 'TZ',
      '+256': 'UG',
      '+260': 'ZM',
      '+262': 'RE',
      '+263': 'ZW',
      '+264': 'NA',
      '+267': 'BW',
      '+351': 'PT',
      '+352': 'LU',
      '+353': 'IE',
      '+354': 'IS',
      '+355': 'AL',
      '+357': 'CY',
      '+358': 'FI',
      '+359': 'BG',
      '+370': 'LT',
      '+371': 'LV',
      '+372': 'EE',
      '+373': 'MD',
      '+374': 'AM',
      '+375': 'BY',
      '+376': 'AD',
      '+377': 'MC',
      '+378': 'SM',
      '+380': 'UA',
      '+385': 'HR',
      '+386': 'SI',
      '+387': 'BA',
      '+420': 'CZ',
      '+421': 'SK',
      '+423': 'LI',
      '+503': 'SV',
      '+504': 'HN',
      '+505': 'NI',
      '+506': 'CR',
      '+507': 'PA',
      '+591': 'BO',
      '+593': 'EC',
      '+595': 'PY',
      '+598': 'UY',
      '+852': 'HK',
      '+855': 'KH',
      '+856': 'LA',
      '+880': 'BD',
      '+886': 'TW',
      '+960': 'MV',
      '+961': 'LB',
      '+962': 'JO',
      '+963': 'SY',
      '+964': 'IQ',
      '+965': 'KW',
      '+966': 'SA',
      '+967': 'YE',
      '+968': 'OM',
      '+970': 'PS',
      '+971': 'AE',
      '+972': 'IL',
      '+973': 'BH',
      '+974': 'QA',
      '+975': 'BT',
      '+976': 'MN',
      '+977': 'NP',
      '+992': 'TJ',
      '+993': 'TM',
      '+994': 'AZ',
      '+995': 'GE',
      '+996': 'KG',
      '+998': 'UZ'
    };
    
    const country = codeToCountry[countryCode];
    if (!country) return '🌍';
    
    return countryToFlag(country);
  };

  const countryToFlag = (countryCode: string): string => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const handlePhoneCodeChange = (code: string) => {
    setPhoneCountryCode(code);
    
    let phoneNumber = formData.phone || '';
    const countryCodes = [
      '+1', '+7', '+20', '+27', '+30', '+31', '+32', '+33', '+34', '+36', '+39', 
      '+40', '+41', '+43', '+44', '+45', '+46', '+47', '+48', '+49', '+51', '+52', 
      '+53', '+54', '+55', '+56', '+57', '+58', '+60', '+61', '+62', '+63', '+64', 
      '+65', '+66', '+81', '+82', '+84', '+86', '+90', '+91', '+92', '+93', '+94', 
      '+95', '+98', '+212', '+213', '+216', '+218', '+220', '+221', '+222', '+223', 
      '+224', '+225', '+226', '+227', '+228', '+229', '+230', '+231', '+232', '+233', 
      '+234', '+235', '+236', '+237', '+238', '+239', '+240', '+241', '+242', '+243', 
      '+244', '+245', '+246', '+247', '+248', '+249', '+250', '+251', '+252', '+253', 
      '+254', '+255', '+256', '+257', '+258', '+260', '+261', '+262', '+263', '+264', 
      '+265', '+266', '+267', '+268', '+269', '+290', '+291', '+297', '+298', '+299', 
      '+350', '+351', '+352', '+353', '+354', '+355', '+356', '+357', '+358', '+359', 
      '+370', '+371', '+372', '+373', '+374', '+375', '+376', '+377', '+378', '+379', 
      '+380', '+381', '+382', '+383', '+385', '+386', '+387', '+389', '+420', '+421', 
      '+423', '+500', '+501', '+502', '+503', '+504', '+505', '+506', '+507', '+508', 
      '+509', '+590', '+591', '+592', '+593', '+594', '+595', '+596', '+597', '+598', 
      '+599', '+670', '+672', '+673', '+674', '+675', '+676', '+677', '+678', '+679', 
      '+680', '+681', '+682', '+683', '+685', '+686', '+687', '+688', '+689', '+690', 
      '+691', '+692', '+850', '+852', '+853', '+855', '+856', '+880', '+886', '+960', 
      '+961', '+962', '+963', '+964', '+965', '+966', '+967', '+968', '+970', '+971', 
      '+972', '+973', '+974', '+975', '+976', '+977', '+992', '+993', '+994', '+995', 
      '+996', '+998'
    ];
    
    const sortedCodes = [...countryCodes].sort((a, b) => b.length - a.length);
    
    for (const existingCode of sortedCodes) {
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
    
    const countryCodes = [
      '+1', '+7', '+20', '+27', '+30', '+31', '+32', '+33', '+34', '+36', '+39', 
      '+40', '+41', '+43', '+44', '+45', '+46', '+47', '+48', '+49', '+51', '+52', 
      '+53', '+54', '+55', '+56', '+57', '+58', '+60', '+61', '+62', '+63', '+64', 
      '+65', '+66', '+81', '+82', '+84', '+86', '+90', '+91', '+92', '+93', '+94', 
      '+95', '+98', '+212', '+213', '+216', '+218', '+220', '+221', '+222', '+223', 
      '+224', '+225', '+226', '+227', '+228', '+229', '+230', '+231', '+232', '+233', 
      '+234', '+235', '+236', '+237', '+238', '+239', '+240', '+241', '+242', '+243', 
      '+244', '+245', '+246', '+247', '+248', '+249', '+250', '+251', '+252', '+253', 
      '+254', '+255', '+256', '+257', '+258', '+260', '+261', '+262', '+263', '+264', 
      '+265', '+266', '+267', '+268', '+269', '+290', '+291', '+297', '+298', '+299', 
      '+350', '+351', '+352', '+353', '+354', '+355', '+356', '+357', '+358', '+359', 
      '+370', '+371', '+372', '+373', '+374', '+375', '+376', '+377', '+378', '+379', 
      '+380', '+381', '+382', '+383', '+385', '+386', '+387', '+389', '+420', '+421', 
      '+423', '+500', '+501', '+502', '+503', '+504', '+505', '+506', '+507', '+508', 
      '+509', '+590', '+591', '+592', '+593', '+594', '+595', '+596', '+597', '+598', 
      '+599', '+670', '+672', '+673', '+674', '+675', '+676', '+677', '+678', '+679', 
      '+680', '+681', '+682', '+683', '+685', '+686', '+687', '+688', '+689', '+690', 
      '+691', '+692', '+850', '+852', '+853', '+855', '+856', '+880', '+886', '+960', 
      '+961', '+962', '+963', '+964', '+965', '+966', '+967', '+968', '+970', '+971', 
      '+972', '+973', '+974', '+975', '+976', '+977', '+992', '+993', '+994', '+995', 
      '+996', '+998'
    ];
    
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
          '262': 'Réunion',
          '212': 'Morocco',
          '216': 'Tunisia',
          '213': 'Algeria',
          '20': 'Egypt',
          '353': 'Ireland'
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
    
    const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    const formattedPhone = `${phoneCountryCode} ${cleanedNumber}`;
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
          placeholder="Numéro"
          countryCode={phoneCountryCode}
          countryCodeDisplay={getCountryFlagEmoji(phoneCountryCode)}
          onCountryCodeChange={handlePhoneCodeChange}
          searchable={true}
          className="mb-3"
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
