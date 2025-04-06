
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Search, X } from 'lucide-react';

interface FormInputProps {
  label: string;
  name: string;
  value?: string | number;
  defaultValue?: string | number;
  type?: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  rows?: number;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  icon?: React.ElementType;
  readOnly?: boolean;
  countryCode?: string;
  countryCodeDisplay?: string;
  onCountryCodeChange?: (code: string) => void;
  searchable?: boolean;
  error?: string;
  info?: string;
  renderCustomField?: () => React.ReactNode;
}

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

const countryNames: Record<string, string> = {
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

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value = '',
  defaultValue,
  type = 'text',
  placeholder,
  required = false,
  onChange,
  onBlur,
  className = '',
  min,
  max,
  step,
  rows = 3,
  disabled = false,
  options = [],
  icon: Icon,
  readOnly = false,
  countryCode,
  countryCodeDisplay,
  onCountryCodeChange,
  searchable = false,
  error,
  info,
  renderCustomField
}) => {
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleCountryDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!disabled && !readOnly) {
      setIsCountryDropdownOpen(!isCountryDropdownOpen);
    }
  };

  const handleCountryCodeChange = (code: string) => {
    if (onCountryCodeChange) {
      onCountryCodeChange(code);
    }
    setIsCountryDropdownOpen(false);
    setSearchTerm('');
  };

  const renderSelectInput = () => {
    return (
      <select
        id={name}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          Icon && "pl-10",
          error && "border-red-500",
        )}
        required={required}
      >
        <option value="" disabled>{placeholder}</option>
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  const renderPhoneWithCodeInput = () => {
    return (
      <div className="relative">
        <div className="flex">
          <div className="relative">
            <button
              type="button"
              className="flex items-center h-10 px-3 border border-input border-r-0 rounded-l-md bg-muted focus:outline-none hover:bg-accent transition-colors"
              onClick={toggleCountryDropdown}
              disabled={disabled || readOnly}
            >
              {countryCodeDisplay ? (
                <div className="flex items-center">
                  <span className="text-lg mr-1">{countryCodeDisplay}</span> 
                  <span className="text-xs text-muted-foreground">{countryCode}</span>
                </div>
              ) : (
                <span>{countryCode}</span>
              )}
              <ChevronDown
                className={cn(
                  "ml-1 h-4 w-4 transition-transform duration-200",
                  isCountryDropdownOpen ? "transform rotate-180" : ""
                )}
              />
            </button>
            
            {isCountryDropdownOpen && (
              <div
                className="absolute left-0 z-50 mt-1 w-72 max-h-60 overflow-auto bg-background border rounded-md shadow-lg"
                ref={dropdownRef}
              >
                {searchable && (
                  <div className="sticky top-0 p-2 bg-background border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Rechercher..."
                        className="pl-8 h-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      {searchTerm && (
                        <button
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchTerm('');
                          }}
                        >
                          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div className="p-1">
                  {countryCodes
                    .filter(code => {
                      if (!searchTerm) return true;
                      const codeStr = code.toString();
                      const normalizedSearchTerm = searchTerm.toLowerCase();
                      
                      return (
                        codeStr.toLowerCase().includes(normalizedSearchTerm) ||
                        countryNames[codeStr]?.toLowerCase().includes(normalizedSearchTerm)
                      );
                    })
                    .map((code) => (
                      <button
                        key={code}
                        className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-accent rounded-sm text-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCountryCodeChange(code);
                        }}
                      >
                        <div className="flex items-center">
                          {getPhoneCountryFlag(code.toString())}
                          <span className="ml-2">{countryNames[code] || code}</span>
                        </div>
                        <span className="text-muted-foreground">{code}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
          <Input
            type="tel"
            name={name}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder || "Numéro de téléphone"}
            disabled={disabled}
            readOnly={readOnly}
            className={cn("rounded-l-none", error && "border-red-500")}
            required={required}
          />
        </div>
      </div>
    );
  };

  // Fonction pour obtenir le drapeau d'un pays à partir du code téléphonique
  const getPhoneCountryFlag = (countryCode: string): JSX.Element => {
    // Mapping entre codes et deux-lettres de pays
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
    
    const countryToFlag = (countryCode: string): string => {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    };
    
    const country = codeToCountry[countryCode];
    const flag = country ? countryToFlag(country) : '🌍';
    
    return (
      <span className="text-lg">{flag}</span>
    );
  };

  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label 
          htmlFor={name} 
          className={cn(
            "block text-sm font-medium",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>
        {info && (
          <span className="text-xs text-muted-foreground">{info}</span>
        )}
      </div>
      
      <div className="relative">
        {Icon && type !== 'tel-with-code' && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
        
        {renderCustomField ? (
          renderCustomField()
        ) : type === 'textarea' ? (
          <Textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(
              "resize-none",
              Icon && "pl-10",
              error && "border-red-500",
            )}
            required={required}
          />
        ) : type === 'tel-with-code' ? (
          renderPhoneWithCodeInput()
        ) : type === 'select' ? (
          renderSelectInput()
        ) : (
          <Input
            id={name}
            type={type}
            name={name}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(
              Icon && "pl-10",
              error && "border-red-500",
            )}
            required={required}
          />
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FormInput;
