
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';
import FormField from './FormField';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { COUNTRIES } from '@/utils/countries';
import { useIsMobile } from '@/hooks/use-mobile';

type InputType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select' | 'tel-with-code';

interface FormInputProps {
  label: React.ReactNode;
  name: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: InputType;
  required?: boolean;
  placeholder?: string;
  className?: string;
  icon?: LucideIcon;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  readOnly?: boolean;
  renderCustomField?: () => React.ReactNode;
  countryCode?: string;
  onCountryCodeChange?: (value: string) => void;
  onCustomChange?: (value: string) => void;
}

const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  className = '',
  icon: Icon,
  options,
  min,
  max,
  readOnly = false,
  renderCustomField,
  countryCode,
  onCountryCodeChange,
  onCustomChange
}: FormInputProps) => {
  const isMobile = useIsMobile();
  
  const renderLabel = () => {
    if (typeof label === 'string' && Icon) {
      return (
        <span className="flex items-center gap-1">
          <Icon className="h-4 w-4" />
          <span>{label}</span>
          {required && <span className="text-destructive">*</span>}
        </span>
      );
    }
    
    return (
      <>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </>
    );
  };

  const renderInput = () => {
    if (renderCustomField) {
      return renderCustomField();
    }
    
    const baseClassName = `luxury-input w-full ${className}`;
    
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={baseClassName}
            readOnly={readOnly}
          />
        );
        
      case 'select':
        if (onCustomChange) {
          return (
            <Select
              value={String(value || '')}
              onValueChange={onCustomChange}
              disabled={readOnly}
            >
              <SelectTrigger className={baseClassName}>
                <SelectValue placeholder={placeholder || 'Sélectionner une option'} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        
        return (
          <select
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            className={baseClassName}
            disabled={readOnly}
          >
            <option value="">{placeholder || 'Sélectionner une option'}</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'number':
        return (
          <Input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            min={min}
            max={max}
            className={baseClassName}
            readOnly={readOnly}
          />
        );
        
      case 'tel-with-code':
        return (
          <div className="flex">
            <div className={`${isMobile ? 'w-20' : 'w-28'} mr-2`}>
              <Select
                value={countryCode}
                onValueChange={onCountryCodeChange}
                disabled={readOnly}
              >
                <SelectTrigger className="w-full overflow-hidden">
                  <SelectValue placeholder="+33" className="truncate flex items-center" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="+33">+33 🇫🇷</SelectItem>
                  <SelectItem value="+44">+44 🇬🇧</SelectItem>
                  <SelectItem value="+1">+1 🇺🇸</SelectItem>
                  <SelectItem value="+49">+49 🇩🇪</SelectItem>
                  <SelectItem value="+39">+39 🇮🇹</SelectItem>
                  <SelectItem value="+34">+34 🇪🇸</SelectItem>
                  <SelectItem value="+41">+41 🇨🇭</SelectItem>
                  <SelectItem value="+32">+32 🇧🇪</SelectItem>
                  <SelectItem value="+352">+352 🇱🇺</SelectItem>
                  <SelectItem value="+377">+377 🇲🇨</SelectItem>
                  <SelectItem value="+7">+7 🇷🇺</SelectItem>
                  <SelectItem value="+971">+971 🇦🇪</SelectItem>
                  <SelectItem value="+966">+966 🇸🇦</SelectItem>
                  <SelectItem value="+86">+86 🇨🇳</SelectItem>
                  <SelectItem value="+81">+81 🇯🇵</SelectItem>
                  <SelectItem value="+61">+61 🇦🇺</SelectItem>
                  <SelectItem value="+55">+55 🇧🇷</SelectItem>
                  <SelectItem value="+351">+351 🇵🇹</SelectItem>
                  <SelectItem value="+30">+30 🇬🇷</SelectItem>
                  <SelectItem value="+45">+45 🇩🇰</SelectItem>
                  <SelectItem value="+46">+46 🇸🇪</SelectItem>
                  <SelectItem value="+47">+47 🇳🇴</SelectItem>
                  <SelectItem value="+358">+358 🇫🇮</SelectItem>
                  <SelectItem value="+420">+420 🇨🇿</SelectItem>
                  <SelectItem value="+36">+36 🇭🇺</SelectItem>
                  <SelectItem value="+48">+48 🇵🇱</SelectItem>
                  <SelectItem value="+40">+40 🇷🇴</SelectItem>
                  <SelectItem value="+90">+90 🇹🇷</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              type="tel"
              name={name}
              value={value || ''}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              className={baseClassName}
              readOnly={readOnly}
            />
          </div>
        );
        
      default:
        return (
          <Input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={baseClassName}
            readOnly={readOnly}
          />
        );
    }
  };

  return (
    <FormField label={renderLabel()}>
      {renderInput()}
    </FormField>
  );
};

export default FormInput;
