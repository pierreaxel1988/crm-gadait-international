import React, { useState, useEffect, useRef } from 'react';
import { LeadDetailed } from '@/types/lead';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clipboard, User, Mail, Phone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import { COUNTRIES } from '@/utils/countries';
import { Textarea } from '@/components/ui/textarea';

interface GeneralInfoSectionProps {
  lead: LeadDetailed;
  onDataChange: (data: Partial<LeadDetailed>) => void;
}

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  lead,
  onDataChange
}) => {
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [isHeaderMeasured, setIsHeaderMeasured] = useState(false);
  const [showContactPaste, setShowContactPaste] = useState(false);
  const [contactText, setContactText] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+33');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const measureHeader = () => {
      const headerElement = document.querySelector('.bg-loro-sand');
      if (headerElement) {
        const height = headerElement.getBoundingClientRect().height;
        setHeaderHeight(height);
        setIsHeaderMeasured(true);
      }
    };
    
    measureHeader();
    window.addEventListener('resize', measureHeader);
    const timeoutId = setTimeout(measureHeader, 300);
    
    return () => {
      window.removeEventListener('resize', measureHeader);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current && 
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showCountryDropdown && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showCountryDropdown]);

  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    onDataChange({
      [field]: value
    } as Partial<LeadDetailed>);
  };

  const updatePhoneCodeInUI = (code: string) => {
    setPhoneCountryCode(code);
  };

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
    let phoneCountryCode = '';

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

    let detectedCountryCode = '+33';
    let phoneNumberWithoutCode = '';
    
    if (phone) {
      const countryCodeRegex = /(?:\(\+(\d+)\)|\+(\d+)(?:[\s\-]|$))/;
      const countryCodeMatch = phone.match(countryCodeRegex);
      
      if (countryCodeMatch) {
        const codeDigits = countryCodeMatch[1] || countryCodeMatch[2];
        
        if (codeDigits) {
          const commonCodes = {
            '1': '1',
            '7': '7',
            '20': '20',
            '27': '27',
            '30': '30',
            '31': '31',
            '32': '32',
            '33': '33',
            '34': '34',
            '36': '36',
            '39': '39',
            '40': '40',
            '41': '41',
            '43': '43',
            '44': '44',
            '45': '45',
            '46': '46',
            '47': '47',
            '48': '48',
            '49': '49',
            '51': '51',
            '52': '52',
            '53': '53',
            '54': '54',
            '55': '55',
            '56': '56',
            '57': '57',
            '58': '58',
            '60': '60',
            '61': '61',
            '62': '62',
            '63': '63',
            '64': '64',
            '65': '65',
            '66': '66',
            '81': '81',
            '82': '82',
            '84': '84',
            '86': '86',
            '90': '90',
            '91': '91',
            '92': '92',
            '93': '93',
            '94': '94',
            '95': '95',
            '98': '98',
            '212': '212',
            '213': '213',
            '216': '216',
            '218': '218',
            '220': '220',
            '221': '221',
            '222': '222',
            '223': '223',
            '224': '224',
            '225': '225',
            '230': '230',
            '233': '233',
            '234': '234',
            '241': '241',
            '242': '242',
            '243': '243',
            '248': '248',
            '249': '249',
            '251': '251',
            '254': '254',
            '255': '255',
            '256': '256',
            '260': '260',
            '261': '261',
            '262': '262',
            '263': '263',
            '264': '264',
            '265': '265',
            '266': '266',
            '267': '267',
            '268': '268',
            '269': '269',
            '297': '297',
            '298': '298',
            '299': '299',
            '350': '350',
            '351': '351',
            '352': '352',
            '353': '353',
            '354': '354',
            '356': '356',
            '357': '357',
            '358': '358',
            '359': '359',
            '370': '370',
            '371': '371',
            '372': '372',
            '373': '373',
            '374': '374',
            '375': '375',
            '376': '376',
            '377': '377',
            '378': '378',
            '380': '380',
            '381': '381',
            '382': '382',
            '383': '383',
            '385': '385',
            '386': '386',
            '387': '387',
            '389': '389',
            '420': '420',
            '421': '421',
            '423': '423',
            '500': '500',
            '501': '501',
            '502': '502',
            '503': '503',
            '504': '504',
            '505': '505',
            '506': '506',
            '507': '507',
            '509': '509',
            '590': '590',
            '591': '591',
            '592': '592',
            '593': '593',
            '594': '594',
            '595': '595',
            '596': '596',
            '597': '597',
            '598': '598',
            '599': '599',
            '670': '670',
            '673': '673',
            '674': '674',
            '675': '675',
            '676': '676',
            '677': '677',
            '678': '678',
            '679': '679',
            '680': '680',
            '685': '685',
            '686': '686',
            '691': '691',
            '692': '692',
            '850': '850',
            '852': '852',
            '853': '853',
            '855': '855',
            '856': '856',
            '880': '880',
            '886': '886',
            '960': '960',
            '961': '961',
            '962': '962',
            '963': '963',
            '964': '964',
            '965': '965',
            '966': '966',
            '967': '967',
            '968': '968',
            '970': '970',
            '971': '971',
            '972': '972',
            '973': '973',
            '974': '974',
            '975': '975',
            '976': '976',
            '977': '977',
            '992': '992',
            '993': '993',
            '994': '994',
            '995': '995',
            '996': '996',
            '998': '998',
          };
          
          let matchedCode = '';
          for (const [code, value] of Object.entries(commonCodes)) {
            if (codeDigits.startsWith(code) && code.length > matchedCode.length) {
              matchedCode = code;
            }
          }
          
          if (matchedCode) {
            detectedCountryCode = '+' + matchedCode;
            updatePhoneCodeInUI(detectedCountryCode);
          }
          
          if (phone.includes('(+')) {
            phoneNumberWithoutCode = phone.replace(/\(\+\d+\)\s*/, '').trim();
          } else if (phone.includes('+')) {
            phoneNumberWithoutCode = phone.replace(/\+\d+[\s\-]?/, '').trim();
          } else {
            phoneNumberWithoutCode = phone;
          }
        }
      } else {
        phoneNumberWithoutCode = phone;
      }

      phoneNumberWithoutCode = phoneNumberWithoutCode.replace(/[()]/g, '').trim();
    }

    const countryCodeMap: Record<string, string> = {
      '+1': 'United States',
      '+33': 'France',
      '+34': 'Spain',
      '+44': 'United Kingdom',
      '+49': 'Germany',
      '+39': 'Italy',
      '+41': 'Switzerland',
      '+32': 'Belgium',
      '+31': 'Netherlands',
      '+7': 'Russia',
      '+353': 'Ireland',
      '+971': 'United Arab Emirates',
      '+966': 'Saudi Arabia',
      '+965': 'Kuwait',
      '+974': 'Qatar',
      '+973': 'Bahrain',
      '+230': 'Mauritius',
      '+262': 'Réunion',
      '+212': 'Morocco',
      '+216': 'Tunisia',
      '+213': 'Algeria',
      '+20': 'Egypt',
      '+351': 'Portugal',
      '+30': 'Greece',
      '+385': 'Croatia',
      '+960': 'Maldives',
      '+248': 'Seychelles',
      '+27': 'South Africa',
      '+91': 'India',
      '+61': 'Australia',
      '+64': 'New Zealand',
      '+86': 'China',
      '+81': 'Japan',
      '+82': 'South Korea',
      '+55': 'Brazil',
      '+52': 'Mexico',
      '+54': 'Argentina',
      '+56': 'Chile',
      '+57': 'Colombia',
      '+58': 'Venezuela'
    };
    
    if (detectedCountryCode && !country && countryCodeMap[detectedCountryCode]) {
      country = countryCodeMap[detectedCountryCode];
    }

    setDetectedCountry(country);

    console.log("Informations extraites:", { 
      name, 
      email, 
      phoneNumberWithoutCode, 
      country, 
      language, 
      detectedCountryCode 
    });

    if (name) handleInputChange('name', name);
    if (email) handleInputChange('email', email);
    
    if (phoneNumberWithoutCode) {
      handleInputChange('phone', phoneNumberWithoutCode);
    }
    
    if (country) {
      handleInputChange('taxResidence', country);
      
      const nationality = deriveNationalityFromCountry(country);
      if (nationality) {
        handleInputChange('nationality', nationality);
      }
    }

    setShowContactPaste(false);
    setContactText('');
    
    toast({
      title: "Informations importées",
      description: "Les informations de contact ont été extraites avec succès."
    });
  };

  const handleCountryCodeChange = (code: string) => {
    setPhoneCountryCode(code);
    setShowCountryDropdown(false);
    setSearchQuery('');
    
    if (lead.phone) {
      let phoneNumber = lead.phone;
      const countryCodes = [
        '+1', '+7', '+20', '+27', '+30', '+31', '+32', '+33', '+34', '+36', '+39', 
        '+40', '+41', '+43', '+44', '+45', '+46', '+47', '+48', '+49', '+51', '+52', 
        '+53', '+54', '+55', '+56', '+57', '+58', '+60', '+61', '+62', '+63', '+64', 
        '+65', '+66', '+81', '+82', '+84', '+86', '+90', '+91', '+92', '+93', '+94', 
        '+95', '+98', '+212', '+213', '+216', '+218', '+230', '+234', '+248', '+249', 
        '+254', '+255', '+256', '+260', '+262', '+263', '+264', '+267', '+351', '+352', 
        '+353', '+354', '+355', '+357', '+358', '+359', '+370', '+371', '+372', '+373', 
        '+374', '+375', '+376', '+377', '+378', '+380', '+385', '+386', '+387', '+420', 
        '+421', '+423', '+503', '+504', '+505', '+506', '+507', '+591', '+593', '+595', 
        '+598', '+852', '+855', '+856', '+880', '+886', '+960', '+961', '+962', '+963', 
        '+964', '+965', '+966', '+967', '+968', '+970', '+971', '+972', '+973', '+974', 
        '+975', '+976', '+977', '+992', '+993', '+994', '+995', '+996', '+998'
      ];
      
      const sortedCodes = [...countryCodes].sort((a, b) => b.length - a.length);
      
      for (const existingCode of sortedCodes) {
        if (phoneNumber.startsWith(existingCode)) {
          phoneNumber = phoneNumber.substring(existingCode.length).trim();
          break;
        }
      }
      
      phoneNumber = phoneNumber.replace(/[-\s().]/g, '');
      
      handleInputChange('phone', phoneNumber);
    }
    
    setTimeout(() => {
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
      }
    }, 100);
    
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
      '+41': 'Switzerland',
      '+44': 'United Kingdom',
      '+49': 'Germany',
      '+52': 'Mexico',
      '+54': 'Argentina',
      '+55': 'Brazil',
      '+61': 'Australia',
      '+66': 'Thailand',
      '+81': 'Japan',
      '+86': 'China',
      '+91': 'India',
      '+212': 'Morocco',
      '+213': 'Algeria',
      '+216': 'Tunisia',
      '+230': 'Mauritius',
      '+234': 'Nigeria',
      '+351': 'Portugal',
      '+353': 'Ireland',
      '+380': 'Ukraine',
      '+385': 'Croatia',
      '+598': 'Uruguay',
      '+852': 'Hong Kong',
      '+880': 'Bangladesh',
      '+960': 'Maldives',
      '+965': 'Kuwait',
      '+966': 'Saudi Arabia',
      '+971': 'United Arab Emirates',
      '+972': 'Israel',
      '+973': 'Bahrain',
      '+974': 'Qatar'
    };
    
    if (countryCodeMapping[code] && !lead.taxResidence) {
      const country = countryCodeMapping[code];
      handleInputChange('taxResidence', country);
      setDetectedCountry(country);
      
      if (!lead.nationality) {
        const nationality = deriveNationalityFromCountry(country);
        if (nationality) {
          handleInputChange('nationality', nationality);
        }
      }
    }
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    const pastedText = e.clipboardData.getData('text');
    
    if (!pastedText) return;
    
    const phoneRegex = /(?:(?:\+|00)(\d{1,4}))?[\s\-.(]*(\d[\d\s\-.()]{5,})/;
    const match = pastedText.match(phoneRegex);
    
    if (match) {
      const detectedCode = match[1] ? `+${match[1]}` : null;
      let phoneNumber = match[2] ? match[2].trim() : pastedText.trim();
      
      phoneNumber = phoneNumber.replace(/[-\s().]/g, '');
      
      if (detectedCode) {
        setPhoneCountryCode(detectedCode);
        
        handleInputChange('phone', phoneNumber);
        
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
          '+41': 'Switzerland',
          '+44': 'United Kingdom',
          '+49': 'Germany',
          '+52': 'Mexico',
          '+54': 'Argentina',
          '+55': 'Brazil',
          '+61': 'Australia',
          '+66': 'Thailand',
          '+81': 'Japan',
          '+86': 'China',
          '+91': 'India',
          '+212': 'Morocco',
          '+213': 'Algeria',
          '+216': 'Tunisia',
          '+230': 'Mauritius',
          '+234': 'Nigeria',
          '+351': 'Portugal',
          '+353': 'Ireland',
          '+380': 'Ukraine',
          '+385': 'Croatia',
          '+598': 'Uruguay',
          '+852': 'Hong Kong',
          '+880': 'Bangladesh',
          '+960': 'Maldives',
          '+965': 'Kuwait',
          '+966': 'Saudi Arabia',
          '+971': 'United Arab Emirates',
          '+972': 'Israel',
          '+973': 'Bahrain',
          '+974': 'Qatar'
        };
        
        if (countryCodeMapping[detectedCode] && !lead.taxResidence) {
          const country = countryCodeMapping[detectedCode];
          handleInputChange('taxResidence', country);
          setDetectedCountry(country);
          
          if (!lead.nationality) {
            const nationality = deriveNationalityFromCountry(country);
            if (nationality) {
              handleInputChange('nationality', nationality);
            }
          }
        }
      } else {
        handleInputChange('phone', phoneNumber);
      }
    } else {
      const cleanedNumber = pastedText.replace(/[-\s().]/g, '');
      handleInputChange('phone', cleanedNumber);
    }
  };

  const countryCodes = [
    { code: '+1', country: '🇺🇸 USA/Canada' },
    { code: '+7', country: '🇷🇺 Russia' },
    { code: '+20', country: '🇪🇬 Egypt' },
    { code: '+27', country: '🇿🇦 South Africa' },
    { code: '+30', country: '🇬🇷 Greece' },
    { code: '+31', country: '🇳🇱 Netherlands' },
    { code: '+32', country: '🇧🇪 Belgium' },
    { code: '+33', country: '🇫🇷 France' },
    { code: '+34', country: '🇪🇸 Spain' },
    { code: '+36', country: '🇭🇺 Hungary' },
    { code: '+39', country: '🇮🇹 Italy' },
    { code: '+41', country: '🇨🇭 Switzerland' },
    { code: '+44', country: '🇬🇧 UK' },
    { code: '+49', country: '🇩🇪 Germany' },
    { code: '+52', country: '🇲🇽 Mexico' },
    { code: '+54', country: '🇦🇷 Argentina' },
    { code: '+55', country: '🇧🇷 Brazil' },
    { code: '+61', country: '🇦🇺 Australia' },
    { code: '+66', country: '🇹🇭 Thailand' },
    { code: '+81', country: '🇯🇵 Japan' },
    { code: '+86', country: '🇨🇳 China' },
    { code: '+91', country: '🇮🇳 India' },
    { code: '+212', country: '🇲🇦 Morocco' },
    { code: '+213', country: '🇩🇿 Algeria' },
    { code: '+216', country: '🇹🇳 Tunisia' },
    { code: '+230', country: '🇲🇺 Mauritius' },
    { code: '+234', country: '🇳🇬 Nigeria' },
    { code: '+351', country: '🇵🇹 Portugal' },
    { code: '+353', country: '🇮🇪 Ireland' },
    { code: '+380', country: '🇺🇦 Ukraine' },
    { code: '+385', country: '🇭🇷 Croatia' },
    { code: '+598', country: '🇺🇾 Uruguay' },
    { code: '+852', country: '🇭🇰 Hong Kong' },
    { code: '+880', country: '🇧🇩 Bangladesh' },
    { code: '+960', country: '🇲🇻 Maldives' },
    { code: '+965', country: '🇰🇼 Kuwait' },
    { code: '+966', country: '🇸🇦 Saudi Arabia' },
    { code: '+971', country: '🇦🇪 UAE' },
    { code: '+972', country: '🇮🇱 Israel' },
    { code: '+973', country: '🇧🇭 Bahrain' },
    { code: '+974', country: '🇶🇦 Qatar' },
    { code: '+43', country: '🇦🇹 Austria' },
    { code: '+45', country: '🇩🇰 Denmark' },
    { code: '+46', country: '🇸🇪 Sweden' },
    { code: '+47', country: '🇳🇴 Norway' },
    { code: '+48', country: '🇵🇱 Poland' },
    { code: '+58', country: '🇻🇪 Venezuela' },
    { code: '+60', country: '🇲🇾 Malaysia' },
    { code: '+62', country: '🇮🇩 Indonesia' },
    { code: '+63', country: '🇵🇭 Philippines' },
    { code: '+64', country: '🇳🇿 New Zealand' },
    { code: '+65', country: '🇸🇬 Singapore' },
    { code: '+82', country: '🇰🇷 South Korea' },
    { code: '+84', country: '🇻🇳 Vietnam' },
    { code: '+90', country: '🇹🇷 Turkey' },
    { code: '+92', country: '🇵🇰 Pakistan' },
    { code: '+94', country: '🇱🇰 Sri Lanka' },
    { code: '+95', country: '🇲🇲 Myanmar' },
    { code: '+98', country: '🇮🇷 Iran' },
    { code: '+218', country: '🇱🇾 Libya' },
    { code: '+248', country: '🇸🇨 Seychelles' },
    { code: '+254', country: '🇰🇪 Kenya' },
    { code: '+255', country: '🇹🇿 Tanzania' },
    { code: '+256', country: '🇺🇬 Uganda' },
    { code: '+260', country: '🇿🇲 Zambia' },
    { code: '+262', country: '🇷🇪 Réunion' },
    { code: '+263', country: '🇿🇼 Zimbabwe' },
    { code: '+264', country: '🇳🇦 Namibia' },
    { code: '+267', country: '🇧🇼 Botswana' },
    { code: '+350', country: '🇬🇮 Gibraltar' },
    { code: '+352', country: '🇱🇺 Luxembourg' },
    { code: '+354', country: '🇮🇸 Iceland' },
    { code: '+355', country: '🇦🇱 Albania' },
    { code: '+356', country: '🇲🇹 Malta' },
    { code: '+357', country: '🇨🇾 Cyprus' },
    { code: '+358', country: '🇫🇮 Finland' },
    { code: '+359', country: '🇧🇬 Bulgaria' },
    { code: '+370', country: '🇱🇹 Lithuania' },
    { code: '+371', country: '🇱🇻 Latvia' },
    { code: '+372', country: '🇪🇪 Estonia' },
    { code: '+373', country: '🇲🇩 Moldova' },
    { code: '+374', country: '🇦🇲 Armenia' },
    { code: '+375', country: '🇧🇾 Belarus' },
    { code: '+376', country: '🇦🇩 Andorra' },
    { code: '+377', country: '🇲🇨 Monaco' },
    { code: '+378', country: '🇸🇲 San Marino' },
    { code: '+386', country: '🇸🇮 Slovenia' },
    { code: '+420', country: '🇨🇿 Czech Republic' },
    { code: '+421', country: '🇸🇰 Slovakia' },
    { code: '+961', country: '🇱🇧 Lebanon' },
    { code: '+962', country: '🇯🇴 Jordan' },
    { code: '+963', country: '🇸🇾 Syria' },
    { code: '+964', country: '🇮🇶 Iraq' },
    { code: '+967', country: '🇾🇪 Yemen' },
    { code: '+968', country: '🇴🇲 Oman' },
    { code: '+970', country: '🇵🇸 Palestine' },
    { code: '+975', country: '🇧🇹 Bhutan' },
    { code: '+976', country: '🇲🇳 Mongolia' },
    { code: '+977', country: '🇳🇵 Nepal' },
    { code: '+992', country: '🇹🇯 Tajikistan' },
    { code: '+993', country: '🇹🇲 Turkmenistan' },
    { code: '+994', country: '🇦🇿 Azerbaijan' },
    { code: '+995', country: '🇬🇪 Georgia' },
    { code: '+996', country: '🇰🇬 Kyrgyzstan' }
  ];

  const filteredCountryCodes = React.useMemo(() => {
    if (!searchQuery) return countryCodes;
    
    return countryCodes.filter(country => {
      const countryNameMatches = country.country.toLowerCase().includes(searchQuery.toLowerCase());
      const codeMatches = country.code.includes(searchQuery);
      const normalizedCountry = country.country.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const normalizedQuery = searchQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const normalizedMatches = normalizedCountry.includes(normalizedQuery);
      
      return countryNameMatches || codeMatches || normalizedMatches;
    });
  }, [searchQuery]);

  const renderCountryDropdown = () => {
    return (
      <div 
        ref={countryDropdownRef}
        className="absolute z-10 mt-1 w-56 max-h-60 overflow-auto rounded-md border border-input bg-background shadow-md left-0 top-full"
      >
        <div className="sticky top-0 bg-background border-b border-input p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              ref={searchInputRef}
              type="text"
              className="w-full px-2 py-1 pl-8 text-sm border rounded"
              placeholder="Rechercher un pays ou code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        
        {filteredCountryCodes.map(country => (
          <div 
            key={country.code} 
            className="px-3 py-2 text-sm hover:bg-accent cursor-pointer flex items-center justify-between font-futura"
            onClick={() => handleCountryCodeChange(country.code)}
          >
            <div className="flex items-center">
              <span className="mr-2">{country.country}</span>
            </div>
            <span className="text-muted-foreground">{country.code}</span>
          </div>
        ))}
        
        {filteredCountryCodes.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground font-futura">
            Aucun pays ne correspond à votre recherche
          </div>
        )}
      </div>
    );
  };

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

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

  return (
    <div 
      className="space-y-5 pt-4" 
      style={{ marginTop: dynamicTopMargin }}
    >
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">Informations Générales</h2>
      
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm">Nom</Label>
          <Input 
            id="name" 
            value={lead.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Nom complet" 
            className="w-full font-futura"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm">Email</Label>
          <div className="flex">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 border border-r-0 rounded-l-md bg-white">
              <Mail className="h-4 w-4 text-gray-500" />
            </div>
            <Input 
              id="email" 
              value={lead.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Adresse email" 
              className="w-full rounded-l-none font-futura" 
              type="email"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm">Téléphone</Label>
          <div className="flex">
            <div className="relative flex-shrink-0">
              <div 
                className="inline-flex h-10 items-center justify-between px-3 border border-r-0 rounded-l-md bg-muted cursor-pointer font-futura"
                onClick={() => setShowCountryDropdown(prev => !prev)}
                style={{ minWidth: '56px' }}
              >
                <span className="text-xl">{getCountryFlagEmoji(phoneCountryCode)}</span>
                <span className="text-xs text-muted-foreground ml-1">{phoneCountryCode}</span>
              </div>
              
              {showCountryDropdown && (
                <div 
                  ref={countryDropdownRef}
                  className="absolute z-10 mt-1 w-56 max-h-60 overflow-auto rounded-md border border-input bg-background shadow-md left-0 top-full"
                >
                  <div className="sticky top-0 bg-background border-b border-input p-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input 
                        ref={searchInputRef}
                        type="text"
                        className="w-full px-2 py-1 pl-8 text-sm border rounded"
                        placeholder="Rechercher un pays ou code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  
                  {filteredCountryCodes.map(country => (
                    <div 
                      key={country.code} 
                      className="px-3 py-2 text-sm hover:bg-accent cursor-pointer flex items-center justify-between font-futura"
                      onClick={() => handleCountryCodeChange(country.code)}
                    >
                      <div className="flex items-center">
                        <span className="mr-2 text-base">{getCountryFlagEmoji(country.code)}</span>
                        <span>{country.country.replace(/^🇺🇸 |^🇫🇷 |^🇬🇧 |^🇪🇸 |^🇮🇹 |^🇩🇪 |^🇯🇵 |^🇨🇳 |^🇷🇺 |^🇮🇳 |^.{4} /, '')}</span>
                      </div>
                      <span className="text-muted-foreground">{country.code}</span>
                    </div>
                  ))}
                  
                  {filteredCountryCodes.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground font-futura">
                      Aucun pays ne correspond à votre recherche
                    </div>
                  )}
                </div>
              )}
            </div>
            <Input 
              id="phone" 
              value={lead.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onPaste={handlePhonePaste}
              placeholder="Numéro de téléphone" 
              className="w-full rounded-l-none font-futura" 
              type="tel"
              ref={phoneInputRef}
            />
          </div>
          {detectedCountry && (
            <p className="text-xs text-muted-foreground font-futura mt-1">
              Pays détecté: {detectedCountry}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm">Pays de résidence</Label>
          <Select 
            value={lead.taxResidence || ''} 
            onValueChange={value => handleInputChange('taxResidence', value)}
          >
            <SelectTrigger id="country" className="w-full font-futura">
              <SelectValue placeholder="Sélectionner un pays" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(country => (
                <SelectItem key={country} value={country} className="font-futura">
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nationality" className="text-sm">Nationalité</Label>
          <Select 
            value={lead.nationality || ''} 
            onValueChange={value => handleInputChange('nationality', value)}
          >
            <SelectTrigger id="nationality" className="w-full font-futura">
              <SelectValue placeholder="Sélectionner une nationalité" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(country => {
                const nationality = deriveNationalityFromCountry(country);
                return (
                  <SelectItem key={country} value={nationality || country} className="font-futura">
                    {nationality || country}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="source" className="text-sm">Source</Label>
          <Select 
            value={lead.source || ''} 
            onValueChange={value => handleInputChange('source', value)}
          >
            <SelectTrigger id="source" className="w-full font-futura">
              <SelectValue placeholder="Sélectionner une source" />
            </SelectTrigger>
            <SelectContent>
              {[
                'Site web', 
                'Réseaux sociaux', 
                'Portails immobiliers', 
                'Network', 
                'Repeaters', 
                'Recommandations',
                'Apporteur d\'affaire',
                'Idealista',
                'Le Figaro',
                'Properstar',
                'Property Cloud',
                'L\'express Property',
                'James Edition',
                'Annonce',
                'Email',
                'Téléphone',
                'Autre',
                'Recommendation'
              ].map(source => (
                <SelectItem key={source} value={source} className="font-futura">
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoSection;
