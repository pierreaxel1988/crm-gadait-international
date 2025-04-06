import React, { useState, useEffect } from 'react';
import { LeadDetailed, LeadSource } from '@/types/lead';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRIES } from '@/utils/countries';
import { deriveNationalityFromCountry } from '@/components/chat/utils/nationalityUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { countryToFlag } from '@/utils/countryUtils';

const LANGUAGE_OPTIONS = [
  { value: "Français", label: "Français" },
  { value: "English", label: "English" },
  { value: "Español", label: "Español" },
  { value: "Deutsch", label: "Deutsch" },
  { value: "Italiano", label: "Italiano" },
  { value: "Русский", label: "Русский" },
  { value: "العربية", label: "العربية" },
  { value: "Nederlands", label: "Nederlands" },
  { value: "Português", label: "Português" },
  { value: "中文", label: "中文" }
];

const LEAD_SOURCES: LeadSource[] = [
  'Site web', 'Réseaux sociaux', 'Portails immobiliers', 'Network', 
  'Repeaters', 'Recommandations', 'Apporteur d\'affaire', 'Idealista',
  'Le Figaro', 'Properstar', 'Property Cloud', 'L\'express Property',
  'James Edition', 'Annonce', 'Email', 'Téléphone', 'Autre', 'Recommendation'
];

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
    });
  };

  const handleTaxResidenceChange = (value: string) => {
    handleInputChange('taxResidence', value);
    
    if (!lead.nationality) {
      const nationality = deriveNationalityFromCountry(value);
      if (nationality) {
        handleInputChange('nationality', nationality);
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('phone', e.target.value);
  };

  const handleCountryCodeChange = (code: string) => {
    handleInputChange('phoneCountryCode', code);
    
    const codeToCountry: Record<string, string> = {
      '+1': '🇺🇸', '+33': '🇫🇷', '+44': '🇬🇧', '+34': '🇪🇸', '+39': '🇮🇹',
      '+41': '🇨🇭', '+49': '🇩🇪', '+32': '🇧🇪', '+31': '🇳🇱', '+351': '🇵🇹',
      '+30': '🇬🇷', '+46': '🇸🇪', '+47': '🇳🇴', '+45': '🇩🇰', '+358': '🇫🇮',
      '+420': '🇨🇿', '+48': '🇵🇱', '+36': '🇭🇺', '+43': '🇦🇹', '+353': '🇮🇪',
      '+352': '🇱🇺', '+377': '🇲🇨', '+7': '🇷🇺', '+380': '🇺🇦', '+40': '🇷🇴',
      '+359': '🇧🇬', '+385': '🇭🇷', '+386': '🇸🇮', '+381': '🇷🇸', '+212': '🇲🇦',
      '+213': '🇩🇿', '+216': '🇹🇳', '+20': '🇪🇬', '+27': '🇿🇦', '+234': '🇳🇬',
      '+81': '🇯🇵', '+86': '🇨🇳', '+91': '🇮🇳', '+65': '🇸🇬', '+82': '🇰🇷',
      '+971': '🇦🇪', '+966': '🇸🇦', '+974': '🇶🇦', '+961': '🇱🇧', '+972': '🇮🇱',
      '+90': '🇹🇷', '+852': '🇭🇰', '+55': '🇧🇷', '+52': '🇲🇽', '+54': '🇦🇷',
      '+56': '🇨🇱', '+57': '🇨🇴', '+58': '🇻🇪', '+51': '🇵🇪', '+61': '🇦🇺',
      '+64': '🇳🇿', '+66': '🇹🇭', '+84': '🇻🇳', '+60': '🇲🇾', '+62': '🇮🇩',
      '+63': '🇵🇭'
    };
    
    const flagEmoji = codeToCountry[code] || '🌍';
    handleInputChange('phoneCountryCodeDisplay', flagEmoji);
  };

  const dynamicTopMargin = isHeaderMeasured 
    ? `${Math.max(headerHeight + 8, 32)}px` 
    : 'calc(32px + 4rem)';

  const nationalityOptions = COUNTRIES.map(country => {
    const nationality = deriveNationalityFromCountry(country) || country;
    return {
      value: nationality,
      label: (
        <div className="flex items-center gap-2">
          <span className="text-lg">{countryToFlag(country)}</span>
          <span>{nationality}</span>
        </div>
      ),
      country: country
    };
  });

  return (
    <div 
      className="space-y-5 pt-4" 
      style={{ 
        marginTop: dynamicTopMargin,
      }}
    >
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b mb-4">Information Générale</h2>
      
      <ScrollArea className="h-[calc(100vh-150px)]">
        <div className="space-y-4 pb-20">
          <div className="space-y-2">
            <Label htmlFor="salutation" className="text-sm">Titre</Label>
            <Select value={lead.salutation || ''} onValueChange={(value) => handleInputChange('salutation', value)}>
              <SelectTrigger id="salutation" className="w-full font-futura">
                <SelectValue placeholder="Sélectionner un titre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M." className="font-futura">Monsieur</SelectItem>
                <SelectItem value="Mme" className="font-futura">Madame</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
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
            <Input 
              id="email" 
              type="email" 
              value={lead.email || ''} 
              onChange={(e) => handleInputChange('email', e.target.value)} 
              placeholder="Adresse email" 
              className="w-full font-futura"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm">Téléphone</Label>
            <div className="flex items-center">
              <div className="relative">
                <Select 
                  value={lead.phoneCountryCode || '+33'} 
                  onValueChange={handleCountryCodeChange}
                >
                  <SelectTrigger className="w-[70px] font-futura border-r-0 rounded-r-none">
                    <SelectValue>
                      {lead.phoneCountryCodeDisplay || '🇫🇷'} {lead.phoneCountryCode || '+33'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+33" className="font-futura">🇫🇷 +33</SelectItem>
                    <SelectItem value="+44" className="font-futura">🇬🇧 +44</SelectItem>
                    <SelectItem value="+1" className="font-futura">🇺🇸 +1</SelectItem>
                    <SelectItem value="+34" className="font-futura">🇪🇸 +34</SelectItem>
                    <SelectItem value="+39" className="font-futura">🇮🇹 +39</SelectItem>
                    <SelectItem value="+41" className="font-futura">🇨🇭 +41</SelectItem>
                    <SelectItem value="+351" className="font-futura">🇵🇹 +351</SelectItem>
                    <SelectItem value="+49" className="font-futura">🇩🇪 +49</SelectItem>
                    <SelectItem value="+32" className="font-futura">🇧🇪 +32</SelectItem>
                    <SelectItem value="+31" className="font-futura">🇳🇱 +31</SelectItem>
                    <SelectItem value="+971" className="font-futura">🇦🇪 +971</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input 
                id="phone" 
                type="tel" 
                value={lead.phone || ''} 
                onChange={handlePhoneChange} 
                placeholder="Numéro de téléphone" 
                className="flex-1 border-l-0 rounded-l-none"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxResidence" className="text-sm">Pays de résidence</Label>
            <Select 
              value={lead.taxResidence || ''} 
              onValueChange={handleTaxResidenceChange}
            >
              <SelectTrigger id="taxResidence" className="w-full font-futura">
                <SelectValue placeholder="Sélectionner un pays" />
              </SelectTrigger>
              <SelectContent searchable>
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
              onValueChange={(value) => handleInputChange('nationality', value)}
            >
              <SelectTrigger id="nationality" className="w-full font-futura">
                <SelectValue placeholder="Sélectionner une nationalité">
                  {lead.nationality && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {countryToFlag(nationalityOptions.find(opt => opt.value === lead.nationality)?.country || lead.nationality)}
                      </span>
                      <span>{lead.nationality}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent searchable>
                {nationalityOptions.map(option => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value} 
                    className="font-futura"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{countryToFlag(option.country)}</span>
                      <span>{option.value}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preferredLanguage" className="text-sm">Langue préférée</Label>
            <Select 
              value={lead.preferredLanguage || ''} 
              onValueChange={(value) => handleInputChange('preferredLanguage', value)}
            >
              <SelectTrigger id="preferredLanguage" className="w-full font-futura">
                <SelectValue placeholder="Sélectionner une langue" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value} className="font-futura">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm">Lien de l'annonce vu</Label>
            <Input 
              id="url" 
              value={lead.url || ''} 
              onChange={(e) => handleInputChange('url', e.target.value)} 
              placeholder="URL de l'annonce immobilière" 
              className="w-full font-futura"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="source" className="text-sm">Source</Label>
            <Select 
              value={lead.source || ''} 
              onValueChange={(value) => handleInputChange('source', value as LeadSource)}
            >
              <SelectTrigger id="source" className="w-full font-futura">
                <SelectValue placeholder="Sélectionner une source" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map(source => (
                  <SelectItem key={source} value={source} className="font-futura">
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="propertyReference" className="text-sm">Référence de propriété</Label>
            <Input 
              id="propertyReference" 
              value={lead.propertyReference || ''} 
              onChange={(e) => handleInputChange('propertyReference', e.target.value)} 
              placeholder="Référence de propriété" 
              className="w-full font-futura"
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default GeneralInfoSection;
