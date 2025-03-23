
// On ne modifie que les portions pertinentes du fichier pour éviter de le réécrire complètement

import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';

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
  { code: '+971', country: '🇦🇪 UAE' },
  { code: '+966', country: '🇸🇦 Saudi Arabia' },
  { code: '+965', country: '🇰🇼 Kuwait' },
  { code: '+974', country: '🇶🇦 Qatar' },
  { code: '+973', country: '🇧🇭 Bahrain' }
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
  countryCode = '+33'
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = React.useState(countryCode);
  const [showCountryDropdown, setShowCountryDropdown] = React.useState(false);

  const handleCountryCodeChange = (code: string) => {
    setSelectedCountryCode(code);
    setShowCountryDropdown(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-xs font-opensans font-medium text-gadait-text leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-gadait-error ml-1">*</span>}
        </label>
      </div>
      
      {renderCustomField ? (
        renderCustomField()
      ) : (
        <>
          {type === 'select' ? (
            <div className="relative">
              {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gadait-secondary">
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <select
                id={name}
                name={name}
                value={value || ''}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={cn(
                  "flex h-12 md:h-10 w-full rounded-gadait border border-gadait-border bg-background px-3 py-2 text-sm font-opensans ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gadait-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gadait-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                  Icon && "pl-9"
                )}
                style={{ fontSize: '16px' }}
              >
                <option value="">{placeholder || 'Sélectionner...'}</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gadait-secondary" />
              </div>
            </div>
          ) : type === 'textarea' ? (
            <div className="relative">
              {Icon && (
                <div className="absolute left-3 top-3 text-gadait-secondary">
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
                  "flex min-h-[100px] w-full rounded-gadait border border-gadait-border bg-background px-3 py-2 text-sm font-opensans ring-offset-background placeholder:text-gadait-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gadait-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  Icon && "pl-9"
                )}
                style={{ fontSize: '16px' }}
              />
            </div>
          ) : type === 'tel-with-code' ? (
            <div className="relative">
              {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gadait-secondary">
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <div className="flex">
                <div className="relative flex-shrink-0">
                  <div 
                    className="flex items-center justify-between w-24 h-12 md:h-10 px-3 border border-r-0 border-gadait-border rounded-l-gadait bg-gadait-background cursor-pointer"
                    onClick={() => setShowCountryDropdown(prev => !prev)}
                  >
                    <span className="text-sm font-opensans truncate">{selectedCountryCode}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </div>
                  
                  {showCountryDropdown && (
                    <div className="absolute z-10 mt-1 w-56 max-h-60 overflow-auto rounded-gadait border border-gadait-border bg-background shadow-gadait">
                      {countryCodes.map(country => (
                        <div 
                          key={country.code} 
                          className="px-3 py-3 text-sm font-opensans hover:bg-gadait-background cursor-pointer flex items-center"
                          onClick={() => handleCountryCodeChange(country.code)}
                        >
                          <span className="mr-2">{country.country}</span>
                          <span className="text-gadait-secondary">{country.code}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Input
                  id={name}
                  name={name}
                  type="tel"
                  value={value ?? ''}
                  onChange={onChange}
                  placeholder={placeholder}
                  required={required}
                  disabled={disabled}
                  className={cn("rounded-l-none h-12 md:h-10 font-opensans", Icon && "pl-9")}
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
          ) : (
            <div className="relative">
              {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gadait-secondary">
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
                className={cn(Icon && "pl-9", "h-12 md:h-10 font-opensans rounded-gadait")}
                style={{ fontSize: '16px' }}
              />
            </div>
          )}
        </>
      )}
      
      {helpText && (
        <p className="text-xs font-opensans text-gadait-secondary mt-1">{helpText}</p>
      )}
    </div>
  );
};

export default FormInput;
