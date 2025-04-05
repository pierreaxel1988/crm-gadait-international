import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { countryMatchesSearch } from '@/components/chat/utils/nationalityUtils';
import { getCountryFromCode, countryCodeMapping } from '@/components/pipeline/mobile/utils/leadFormatUtils';

interface FormInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'tel-with-code' | 'number' | 'date' | 'select' | 'textarea';
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  icon?: React.ElementType;
  options?: { value: string; label: string }[];
  className?: string;
  helpText?: string;
  disabled?: boolean;
  renderCustomField?: () => React.ReactNode;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  searchable?: boolean;
}

const countryCodes = [
  { code: '+93', country: '🇦🇫 Afghanistan' },
  { code: '+355', country: '🇦🇱 Albania' },
  { code: '+213', country: '🇩🇿 Algeria' },
  { code: '+376', country: '🇦🇩 Andorra' },
  { code: '+244', country: '🇦🇴 Angola' },
  { code: '+1', country: '🇺🇸 USA/Canada' },
  { code: '+54', country: '🇦🇷 Argentina' },
  { code: '+374', country: '🇦🇲 Armenia' },
  { code: '+61', country: '🇦🇺 Australia' },
  { code: '+43', country: '🇦🇹 Austria' },
  { code: '+994', country: '🇦🇿 Azerbaijan' },
  { code: '+973', country: '🇧🇭 Bahrain' },
  { code: '+880', country: '🇧🇩 Bangladesh' },
  { code: '+375', country: '🇧🇾 Belarus' },
  { code: '+32', country: '🇧🇪 Belgium' },
  { code: '+501', country: '🇧🇿 Belize' },
  { code: '+229', country: '🇧🇯 Benin' },
  { code: '+975', country: '🇧🇹 Bhutan' },
  { code: '+591', country: '🇧🇴 Bolivia' },
  { code: '+387', country: '🇧🇦 Bosnia and Herzegovina' },
  { code: '+267', country: '🇧🇼 Botswana' },
  { code: '+55', country: '🇧🇷 Brazil' },
  { code: '+673', country: '🇧🇳 Brunei' },
  { code: '+359', country: '🇧🇬 Bulgaria' },
  { code: '+226', country: '🇧🇫 Burkina Faso' },
  { code: '+257', country: '🇧🇮 Burundi' },
  { code: '+855', country: '🇰🇭 Cambodia' },
  { code: '+237', country: '🇨🇲 Cameroon' },
  { code: '+238', country: '🇨🇻 Cape Verde' },
  { code: '+236', country: '🇨🇫 Central African Republic' },
  { code: '+235', country: '🇹🇩 Chad' },
  { code: '+56', country: '🇨🇱 Chile' },
  { code: '+86', country: '🇨🇳 China' },
  { code: '+57', country: '🇨🇴 Colombia' },
  { code: '+269', country: '🇰🇲 Comoros' },
  { code: '+242', country: '🇨🇬 Congo' },
  { code: '+506', country: '🇨🇷 Costa Rica' },
  { code: '+385', country: '🇭🇷 Croatia' },
  { code: '+53', country: '🇨🇺 Cuba' },
  { code: '+357', country: '🇨🇾 Cyprus' },
  { code: '+420', country: '🇨🇿 Czech Republic' },
  { code: '+45', country: '🇩🇰 Denmark' },
  { code: '+253', country: '🇩🇯 Djibouti' },
  { code: '+1809', country: '🇩🇴 Dominican Republic' },
  { code: '+670', country: '🇹🇱 East Timor' },
  { code: '+593', country: '🇪🇨 Ecuador' },
  { code: '+20', country: '🇪🇬 Egypt' },
  { code: '+503', country: '🇸🇻 El Salvador' },
  { code: '+240', country: '🇬🇶 Equatorial Guinea' },
  { code: '+291', country: '🇪🇷 Eritrea' },
  { code: '+372', country: '🇪🇪 Estonia' },
  { code: '+268', country: '🇸🇿 Eswatini' },
  { code: '+251', country: '🇪🇹 Ethiopia' },
  { code: '+679', country: '🇫🇯 Fiji' },
  { code: '+358', country: '🇫🇮 Finland' },
  { code: '+33', country: '🇫🇷 France' },
  { code: '+262', country: '🇷🇪 Réunion' },
  { code: '+241', country: '🇬🇦 Gabon' },
  { code: '+220', country: '🇬🇲 Gambia' },
  { code: '+995', country: '🇬🇪 Georgia' },
  { code: '+49', country: '🇩🇪 Germany' },
  { code: '+233', country: '🇬🇭 Ghana' },
  { code: '+30', country: '🇬🇷 Greece' },
  { code: '+299', country: '🇬🇱 Greenland' },
  { code: '+502', country: '🇬🇹 Guatemala' },
  { code: '+224', country: '🇬🇳 Guinea' },
  { code: '+245', country: '🇬🇼 Guinea-Bissau' },
  { code: '+592', country: '🇬🇾 Guyana' },
  { code: '+509', country: '🇭🇹 Haiti' },
  { code: '+504', country: '🇭🇳 Honduras' },
  { code: '+852', country: '🇭🇰 Hong Kong' },
  { code: '+36', country: '🇭🇺 Hungary' },
  { code: '+354', country: '🇮🇸 Iceland' },
  { code: '+91', country: '🇮🇳 India' },
  { code: '+62', country: '🇮🇩 Indonesia' },
  { code: '+98', country: '🇮🇷 Iran' },
  { code: '+964', country: '🇮🇶 Iraq' },
  { code: '+353', country: '🇮🇪 Ireland' },
  { code: '+972', country: '🇮🇱 Israel' },
  { code: '+39', country: '🇮🇹 Italy' },
  { code: '+225', country: '🇨🇮 Ivory Coast' },
  { code: '+1876', country: '🇯🇲 Jamaica' },
  { code: '+81', country: '🇯🇵 Japan' },
  { code: '+962', country: '🇯🇴 Jordan' },
  { code: '+7', country: '🇰🇿 Kazakhstan/Russia' },
  { code: '+254', country: '🇰🇪 Kenya' },
  { code: '+686', country: '🇰🇮 Kiribati' },
  { code: '+850', country: '🇰🇵 North Korea' },
  { code: '+82', country: '🇰🇷 South Korea' },
  { code: '+383', country: '🇽🇰 Kosovo' },
  { code: '+965', country: '🇰🇼 Kuwait' },
  { code: '+996', country: '🇰🇬 Kyrgyzstan' },
  { code: '+856', country: '🇱🇦 Laos' },
  { code: '+371', country: '🇱🇻 Latvia' },
  { code: '+961', country: '🇱🇧 Lebanon' },
  { code: '+266', country: '🇱🇸 Lesotho' },
  { code: '+231', country: '🇱🇷 Liberia' },
  { code: '+218', country: '🇱🇾 Libya' },
  { code: '+423', country: '🇱🇮 Liechtenstein' },
  { code: '+370', country: '🇱🇹 Lithuania' },
  { code: '+352', country: '🇱🇺 Luxembourg' },
  { code: '+261', country: '🇲🇬 Madagascar' },
  { code: '+265', country: '🇲🇼 Malawi' },
  { code: '+60', country: '🇲🇾 Malaysia' },
  { code: '+960', country: '🇲🇻 Maldives' },
  { code: '+223', country: '🇲🇱 Mali' },
  { code: '+356', country: '🇲🇹 Malta' },
  { code: '+692', country: '🇲🇭 Marshall Islands' },
  { code: '+222', country: '🇲🇷 Mauritania' },
  { code: '+230', country: '🇲🇺 Mauritius' },
  { code: '+52', country: '🇲🇽 Mexico' },
  { code: '+691', country: '🇫🇲 Micronesia' },
  { code: '+373', country: '🇲🇩 Moldova' },
  { code: '+377', country: '🇲🇨 Monaco' },
  { code: '+976', country: '🇲🇳 Mongolia' },
  { code: '+382', country: '🇲🇪 Montenegro' },
  { code: '+212', country: '🇲🇦 Morocco' },
  { code: '+258', country: '🇲🇿 Mozambique' },
  { code: '+95', country: '🇲🇲 Myanmar' },
  { code: '+264', country: '🇳🇦 Namibia' },
  { code: '+674', country: '🇳🇷 Nauru' },
  { code: '+977', country: '🇳🇵 Nepal' },
  { code: '+31', country: '🇳🇱 Netherlands' },
  { code: '+64', country: '🇳🇿 New Zealand' },
  { code: '+505', country: '🇳🇮 Nicaragua' },
  { code: '+227', country: '🇳🇪 Niger' },
  { code: '+234', country: '🇳🇬 Nigeria' },
  { code: '+389', country: '🇲🇰 North Macedonia' },
  { code: '+47', country: '🇳🇴 Norway' },
  { code: '+968', country: '🇴🇲 Oman' },
  { code: '+92', country: '🇵🇰 Pakistan' },
  { code: '+680', country: '🇵🇼 Palau' },
  { code: '+507', country: '🇵🇦 Panama' },
  { code: '+675', country: '🇵🇬 Papua New Guinea' },
  { code: '+595', country: '🇵🇾 Paraguay' },
  { code: '+51', country: '🇵🇪 Peru' },
  { code: '+63', country: '🇵🇭 Philippines' },
  { code: '+48', country: '🇵🇱 Poland' },
  { code: '+351', country: '🇵🇹 Portugal' },
  { code: '+974', country: '🇶🇦 Qatar' },
  { code: '+40', country: '🇷🇴 Romania' },
  { code: '+250', country: '🇷🇼 Rwanda' },
  { code: '+1869', country: '🇰🇳 Saint Kitts and Nevis' },
  { code: '+1758', country: '🇱🇨 Saint Lucia' },
  { code: '+1784', country: '🇻🇨 Saint Vincent and the Grenadines' },
  { code: '+685', country: '🇼🇸 Samoa' },
  { code: '+378', country: '🇸🇲 San Marino' },
  { code: '+239', country: '🇸🇹 Sao Tome and Principe' },
  { code: '+966', country: '🇸🇦 Saudi Arabia' },
  { code: '+221', country: '🇸🇳 Senegal' },
  { code: '+381', country: '🇷🇸 Serbia' },
  { code: '+248', country: '🇸🇨 Seychelles' },
  { code: '+232', country: '🇸🇱 Sierra Leone' },
  { code: '+65', country: '🇸🇬 Singapore' },
  { code: '+421', country: '🇸🇰 Slovakia' },
  { code: '+386', country: '🇸🇮 Slovenia' },
  { code: '+677', country: '🇸🇧 Solomon Islands' },
  { code: '+252', country: '🇸🇴 Somalia' },
  { code: '+27', country: '🇿🇦 South Africa' },
  { code: '+211', country: '🇸🇸 South Sudan' },
  { code: '+34', country: '🇪🇸 Spain' },
  { code: '+94', country: '🇱🇰 Sri Lanka' },
  { code: '+249', country: '🇸🇩 Sudan' },
  { code: '+597', country: '🇸🇷 Suriname' },
  { code: '+46', country: '🇸🇪 Sweden' },
  { code: '+41', country: '🇨🇭 Switzerland' },
  { code: '+963', country: '🇸🇾 Syria' },
  { code: '+886', country: '🇹🇼 Taiwan' },
  { code: '+992', country: '🇹🇯 Tajikistan' },
  { code: '+255', country: '🇹🇿 Tanzania' },
  { code: '+66', country: '🇹🇭 Thailand' },
  { code: '+228', country: '🇹🇬 Togo' },
  { code: '+676', country: '🇹🇴 Tonga' },
  { code: '+1868', country: '🇹🇹 Trinidad and Tobago' },
  { code: '+216', country: '🇹🇳 Tunisia' },
  { code: '+90', country: '🇹🇷 Turkey' },
  { code: '+993', country: '🇹🇲 Turkmenistan' },
  { code: '+688', country: '🇹🇻 Tuvalu' },
  { code: '+256', country: '🇺🇬 Uganda' },
  { code: '+380', country: '🇺🇦 Ukraine' },
  { code: '+971', country: '🇦🇪 UAE' },
  { code: '+44', country: '🇬🇧 UK' },
  { code: '+598', country: '🇺🇾 Uruguay' },
  { code: '+998', country: '🇺🇿 Uzbekistan' },
  { code: '+678', country: '🇻🇺 Vanuatu' },
  { code: '+379', country: '🇻🇦 Vatican City' },
  { code: '+58', country: '🇻🇪 Venezuela' },
  { code: '+84', country: '🇻🇳 Vietnam' },
  { code: '+967', country: '🇾🇪 Yemen' },
  { code: '+260', country: '🇿🇲 Zambia' },
  { code: '+263', country: '🇿🇼 Zimbabwe' }
];

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon,
  options = [],
  className,
  helpText,
  disabled = false,
  renderCustomField,
  countryCode = '+33',
  onCountryCodeChange,
  searchable = false
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCode);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const searchCountryInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current && 
        !selectRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
      
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
    if (showOptions && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showOptions, searchable]);

  useEffect(() => {
    if (selectedCountryCode) {
      const country = getCountryFromCode(selectedCountryCode);
      
      if (country && onCountryCodeChange) {
        onCountryCodeChange(selectedCountryCode);
      }
    }
  }, [selectedCountryCode, onCountryCodeChange]);

  useEffect(() => {
    if (showCountryDropdown && searchCountryInputRef.current) {
      setTimeout(() => {
        searchCountryInputRef.current?.focus();
      }, 100);
    }
  }, [showCountryDropdown]);

  const handleCountryCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setSelectedCountryCode(input);
    
    if (input.startsWith('+')) {
      const country = getCountryFromCode(input);
      
      if (country) {
        if (onCountryCodeChange) {
          onCountryCodeChange(input);
        }
      }
    }
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (type !== 'tel-with-code') return;
    
    e.preventDefault();
    
    const pastedText = e.clipboardData.getData('text');
    
    if (!pastedText) return;
    
    const phoneRegex = /(?:\+(\d+))?[\s\-]?([0-9\s\-]+)/;
    const match = pastedText.match(phoneRegex);
    
    if (match) {
      const detectedCode = match[1] ? `+${match[1]}` : null;
      let phoneNumber = match[2] ? match[2].trim() : pastedText.trim();
      
      if (detectedCode) {
        setSelectedCountryCode(detectedCode);
        if (onCountryCodeChange) {
          onCountryCodeChange(detectedCode);
        }
        
        const cleanedNumber = phoneNumber.replace(/[-\s()]/g, '');
        
        const syntheticEvent = {
          target: {
            name,
            value: cleanedNumber
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
      } else {
        const cleanedNumber = pastedText.replace(/[-\s()]/g, '');
        
        const syntheticEvent = {
          target: {
            name,
            value: cleanedNumber
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
      }
    } else {
      const cleanedNumber = pastedText.replace(/[-\s()]/g, '');
      
      const syntheticEvent = {
        target: {
          name,
          value: cleanedNumber
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(syntheticEvent);
    }
  };

  const handleCountryCodeChange = (code: string) => {
    setSelectedCountryCode(code);
    setShowCountryDropdown(false);
    setSearchQuery("");
    
    if (onCountryCodeChange) {
      onCountryCodeChange(code);
    }
    
    if (typeof value === 'string' && value) {
      let cleanedNumber = value;
      for (const codeObj of countryCodes) {
        if (value.startsWith(codeObj.code)) {
          cleanedNumber = value.substring(codeObj.code.length).trim();
          break;
        }
      }
      
      const syntheticEvent = {
        target: {
          name,
          value: cleanedNumber
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(syntheticEvent);
    }
    
    setTimeout(() => {
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
      }
    }, 100);
  };

  const getCodeButtonWidth = () => {
    const baseWidth = 24;
    return selectedCountryCode.length > 3 ? 
      baseWidth + (selectedCountryCode.length - 3) * 6 : 
      baseWidth;
  };

  const selectedCountry = countryCodes.find(country => country.code === selectedCountryCode);

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

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery || !searchable || !options) return options;
    
    return options.filter(option => {
      const label = option.label.toLowerCase();
      const query = searchQuery.toLowerCase();
      const normalizedLabel = label.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      return normalizedLabel.includes(normalizedQuery);
    });
  }, [options, searchQuery, searchable]);

  const handleOptionSelect = (optionValue: string) => {
    const syntheticEvent = {
      target: {
        name,
        value: optionValue
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    onChange(syntheticEvent);
    setShowOptions(false);
    setSearchQuery("");
  };

  const getPhoneValueWithoutCode = () => {
    if (!value) return '';
    
    const allCountryCodes = countryCodes.map(country => country.code);
    
    let phoneNumber = value.toString();
    for (const code of allCountryCodes) {
      if (phoneNumber.startsWith(code)) {
        return phoneNumber.substring(code.length).trim();
      }
    }
    
    return phoneNumber;
  };

  const renderCountryDropdown = () => {
    return (
      <div 
        ref={countryDropdownRef} 
        className="absolute z-10 mt-1 w-56 max-h-60 overflow-auto rounded-md border border-input bg-background shadow-md"
      >
        <div className="sticky top-0 bg-background border-b border-input p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              ref={searchCountryInputRef}
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

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-futura text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      
      {renderCustomField ? (
        renderCustomField()
      ) : (
        <>
          {type === 'select' ? (
            <div className="relative" ref={selectRef}>
              {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <div
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-chocolate-dark focus-visible:border-chocolate-dark disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer select-none",
                  Icon && "pl-9"
                )}
                onClick={() => setShowOptions(!showOptions)}
              >
                <div className="flex-1 flex items-center">
                  {value ? (
                    options.find(opt => opt.value === value)?.label || value
                  ) : (
                    <span className="text-muted-foreground">{placeholder || 'Sélectionner...'}</span>
                  )}
                </div>
                <div className="flex items-center">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              {showOptions && (
                <div className="absolute z-50 w-full mt-1 rounded-md border border-input bg-background shadow-md max-h-60 overflow-auto">
                  {searchable && (
                    <div className="sticky top-0 p-2 bg-background border-b border-input">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          className="w-full p-2 pl-8 text-sm border rounded-md"
                          placeholder="Rechercher..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  )}
                  <div className="py-1">
                    <div 
                      className="px-3 py-2 text-sm hover:bg-accent cursor-pointer font-futura text-muted-foreground"
                      onClick={() => handleOptionSelect('')}
                    >
                      {placeholder || 'Sélectionner...'}
                    </div>
                    {filteredOptions.map((option) => (
                      <div 
                        key={option.value} 
                        className={cn(
                          "px-3 py-2 text-sm hover:bg-accent cursor-pointer font-futura",
                          value === option.value ? "bg-accent font-medium" : ""
                        )}
                        onClick={() => handleOptionSelect(option.value)}
                      >
                        {option.label}
                      </div>
                    ))}
                    {filteredOptions.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground font-futura">
                        Aucun résultat trouvé
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : type === 'textarea' ? (
            <div className="relative">
              {Icon && (
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <textarea
                id={name}
                name={name}
                value={value || ''}
                onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={cn(
                  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-chocolate-dark focus-visible:border-chocolate-dark disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 font-futura",
                  Icon && "pl-9"
                )}
              />
            </div>
          ) : type === 'tel-with-code' ? (
            <div className="relative">
              {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <div className="flex">
                <div className="relative flex-shrink-0">
                  <div 
                    className="flex items-center justify-between w-24 h-9 px-3 border border-r-0 border-input rounded-l-md bg-muted cursor-pointer font-futura"
                    onClick={() => setShowCountryDropdown(prev => !prev)}
                    style={{ minWidth: `${getCodeButtonWidth()}px` }}
                  >
                    <input
                      type="text"
                      className="bg-transparent border-none outline-none p-0 w-full text-sm"
                      value={selectedCountryCode}
                      onChange={handleCountryCodeInputChange}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="+xx"
                    />
                    <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
                  </div>
                  
                  {showCountryDropdown && renderCountryDropdown()}
                </div>
                <Input
                  id={name}
                  name={name}
                  type="tel"
                  value={getPhoneValueWithoutCode() ?? ''}
                  onChange={onChange}
                  placeholder={placeholder}
                  required={required}
                  disabled={disabled}
                  className="rounded-l-none h-9 font-futura"
                  ref={phoneInputRef}
                  onPaste={handlePhonePaste}
                />
              </div>
              
              {selectedCountryCode && getCountryFromCode(selectedCountryCode) && (
                <div className="text-xs text-muted-foreground mt-1 font-futura italic">
                  Pays détecté: {getCountryFromCode(selectedCountryCode)}
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <Input
                id={name}
                name={name}
                type={type}
                value={value ?? ''}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={cn(Icon && "pl-9", "h-9 font-futura")}
              />
            </div>
          )}
        </>
      )}
      
      {helpText && (
        <p className="text-xs text-muted-foreground mt-1 font-futura">{helpText}</p>
      )}
    </div>
  );
};

export default FormInput;
