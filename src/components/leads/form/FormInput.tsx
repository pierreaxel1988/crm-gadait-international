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
  { code: '+33', country: '🇫🇷 France' },
  { code: '+44', country: '🇬🇧 UK' },
  { code: '+1', country: '🇺🇸 USA' },
  { code: '+34', country: '🇪🇸 Spain' },
  { code: '+39', country: '🇮🇹 Italy' },
  { code: '+41', country: '🇨🇭 Switzerland' },
  { code: '+32', country: '🇧🇪 Belgium' },
  { code: '+49', country: '🇩🇪 Germany' },
  { code: '+31', country: '🇳🇱 Netherlands' },
  { code: '+7', country: '🇷🇺 Russia' },
  { code: '+353', country: '🇮🇪 Ireland' },
  { code: '+971', country: '🇦🇪 UAE' },
  { code: '+966', country: '🇸🇦 Saudi Arabia' },
  { code: '+965', country: '🇰🇼 Kuwait' },
  { code: '+974', country: '🇶🇦 Qatar' },
  { code: '+973', country: '🇧🇭 Bahrain' },
  { code: '+230', country: '🇲🇺 Mauritius' },
  { code: '+212', country: '🇲🇦 Morocco' },
  { code: '+216', country: '🇹🇳 Tunisia' },
  { code: '+213', country: '🇩🇿 Algeria' },
  { code: '+20', country: '🇪🇬 Egypt' }
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

  const handleCountryCodeChange = (code: string) => {
    setSelectedCountryCode(code);
    setShowCountryDropdown(false);
    
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
      
      return countryNameMatches || codeMatches;
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
    
    const countryCodes = ['+33', '+44', '+1', '+34', '+39', '+41', '+32', '+49', '+31', '+7', '+971', '+966', '+965', '+974', '+973', '+230', '+212', '+216', '+213', '+20'];
    
    let phoneNumber = value.toString();
    for (const code of countryCodes) {
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
          <input 
            type="text"
            className="w-full px-2 py-1 text-sm border rounded"
            placeholder="Rechercher un pays ou code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
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
