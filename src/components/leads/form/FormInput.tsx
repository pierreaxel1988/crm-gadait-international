
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
        <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      
      {renderCustomField ? (
        renderCustomField()
      ) : (
        <>
          {type === 'select' ? (
            <div className="relative">
              {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  Icon && "pl-9"
                )}
              >
                <option value="">Sélectionner...</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
                  "flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
                    className="flex items-center justify-between w-24 h-10 px-3 border border-r-0 border-input rounded-l-md bg-muted cursor-pointer"
                    onClick={() => setShowCountryDropdown(prev => !prev)}
                  >
                    <span className="text-sm truncate">{selectedCountryCode}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </div>
                  
                  {showCountryDropdown && (
                    <div className="absolute z-10 mt-1 w-48 max-h-60 overflow-auto rounded-md border border-input bg-background shadow-md">
                      {countryCodes.map(country => (
                        <div 
                          key={country.code} 
                          className="px-3 py-2 text-sm hover:bg-accent cursor-pointer flex items-center"
                          onClick={() => handleCountryCodeChange(country.code)}
                        >
                          <span className="mr-2">{country.country}</span>
                          <span className="text-muted-foreground">{country.code}</span>
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
                  className={cn("rounded-l-none", Icon && "pl-9")}
                />
              </div>
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
                className={cn(Icon && "pl-9")}
              />
            </div>
          )}
        </>
      )}
      
      {helpText && (
        <p className="text-xs text-muted-foreground mt-1">{helpText}</p>
      )}
    </div>
  );
};

export default FormInput;
