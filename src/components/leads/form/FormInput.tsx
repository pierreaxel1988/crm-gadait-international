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
  SelectValue,
} from "@/components/ui/select";

type InputType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select';

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
  renderCustomField
}: FormInputProps) => {
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

  const handleSelectChange = (selectedValue: string) => {
    const syntheticEvent = {
      target: {
        name,
        value: selectedValue
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    onChange(syntheticEvent);
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
        return (
          <Select
            name={name}
            value={value?.toString() || ""}
            onValueChange={handleSelectChange}
            disabled={readOnly}
          >
            <SelectTrigger className={baseClassName}>
              <SelectValue placeholder={placeholder || 'Sélectionner une option'} />
            </SelectTrigger>
            <SelectContent>
              {options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
