
import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface FormInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea';
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
}

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
  renderCustomField
}) => {
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
