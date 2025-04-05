import React, { useState, useEffect } from 'react';
import { LeadDetailed } from '@/types/lead';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clipboard, User, Mail, Phone } from 'lucide-react';
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

  const handleInputChange = (field: keyof LeadDetailed, value: any) => {
    onDataChange({
      [field]: value
    } as Partial<LeadDetailed>);
  };

  const updatePhoneCodeInUI = (code: string) => {
    setPhoneCountryCode(code);
    const phoneCodeSelect = document.querySelector('select[name="phoneCountryCode"]') as HTMLSelectElement;
    if (phoneCodeSelect) {
      phoneCodeSelect.value = code;
      phoneCodeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
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

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

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
            <Select 
              value={phoneCountryCode} 
              onValueChange={(value) => setPhoneCountryCode(value)}
              name="phoneCountryCode"
            >
              <SelectTrigger className="flex-shrink-0 w-20 rounded-r-none font-futura">
                <SelectValue placeholder="+33" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+33">+33</SelectItem>
                <SelectItem value="+1">+1</SelectItem>
                <SelectItem value="+44">+44</SelectItem>
                <SelectItem value="+34">+34</SelectItem>
                <SelectItem value="+39">+39</SelectItem>
                <SelectItem value="+41">+41</SelectItem>
                <SelectItem value="+32">+32</SelectItem>
                <SelectItem value="+49">+49</SelectItem>
                <SelectItem value="+31">+31</SelectItem>
                <SelectItem value="+7">+7</SelectItem>
                <SelectItem value="+353">+353</SelectItem>
                <SelectItem value="+971">+971</SelectItem>
                <SelectItem value="+966">+966</SelectItem>
                <SelectItem value="+965">+965</SelectItem>
                <SelectItem value="+974">+974</SelectItem>
                <SelectItem value="+973">+973</SelectItem>
                <SelectItem value="+230">+230</SelectItem>
                <SelectItem value="+262">+262</SelectItem>
                <SelectItem value="+212">+212</SelectItem>
                <SelectItem value="+216">+216</SelectItem>
                <SelectItem value="+213">+213</SelectItem>
                <SelectItem value="+20">+20</SelectItem>
                <SelectItem value="+351">+351</SelectItem>
                <SelectItem value="+30">+30</SelectItem>
                <SelectItem value="+385">+385</SelectItem>
                <SelectItem value="+960">+960</SelectItem>
                <SelectItem value="+248">+248</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              id="phone" 
              value={lead.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Numéro de téléphone" 
              className="w-full rounded-l-none font-futura" 
              type="tel"
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
